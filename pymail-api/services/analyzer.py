import os
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date, timedelta
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Tuple

import tldextract
from imap_tools import OR, A, MailBox
from models.schemas import (
    AnalysisResponse,
    DomainReputation,
    IMAPCredentials,
    SenderStats,
)
from services.domain_reputation import (
    describe_domain_signals_en,
    describe_domain_signals_pt,
    dns_signals_to_trust,
    flush_reputation_cache,
    lookup_domain_signals,
    virustotal_domain_flags,
)


def _env_to_bool(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _build_psl_extractor(include_private_domains: bool) -> tldextract.TLDExtract:
    # Avoid first-use network fetch and rely on bundled PSL snapshot/cache.
    return tldextract.TLDExtract(
        suffix_list_urls=(),
        include_psl_private_domains=include_private_domains,
    )


_INCLUDE_PSL_PRIVATE_DOMAINS = _env_to_bool(
    "NORMALIZE_SOURCE_INCLUDE_PRIVATE_DOMAINS", default=False
)
_PSL_EXTRACTOR = _build_psl_extractor(
    include_private_domains=_INCLUDE_PSL_PRIVATE_DOMAINS
)
_SOURCE_GROUPING_MODE = "tenant" if _INCLUDE_PSL_PRIVATE_DOMAINS else "provider"


def _extract_domain(email: str) -> str:
    if not email or "@" not in email:
        return "unknown"
    return email.split("@", 1)[1].lower().strip()


def normalize_source(sender_email: str, sender_name: str) -> str:
    email = (sender_email or "").lower().strip()
    name = (sender_name or "").lower().strip()
    domain = _extract_domain(email)

    linkedin_signals = ["linkedin", "lnkd"]
    if any(signal in email for signal in linkedin_signals) or any(
        signal in name for signal in linkedin_signals
    ):
        return "linkedin"

    if domain and domain != "unknown":
        extracted = _PSL_EXTRACTOR(domain)
        if extracted.domain:
            return extracted.domain.lower().strip()
        if extracted.suffix:
            return extracted.suffix.lower().strip()
        return domain

    return "unknown"


def _load_domain_list(filename: str, env_var: str) -> Tuple[str, ...]:
    """Load a newline-delimited domain/TLD list from services/data/.

    Blank lines and ``#`` comments are ignored; entries are lowercased. Set the
    *env_var* environment variable to point at a custom file and override the
    bundled default.
    """
    raw = os.environ.get(env_var, "").strip()
    path = Path(raw) if raw else (Path(__file__).resolve().parent / "data" / filename)
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError:
        return ()
    return tuple(
        s.lower() for line in lines if (s := line.strip()) and not s.startswith("#")
    )


# Domains associated with well-known services ("official" senders) and spam-prone
# TLDs. Sourced from data files so the heuristics can be tuned without code
# changes (override paths via OFFICIAL_DOMAINS_FILE / SUSPICIOUS_TLDS_FILE).
_OFFICIAL_DOMAIN_SUFFIXES: Tuple[str, ...] = _load_domain_list(
    "official_domains.txt", "OFFICIAL_DOMAINS_FILE"
)
_SUSPICIOUS_TLD_SUFFIXES: Tuple[str, ...] = _load_domain_list(
    "suspicious_tlds.txt", "SUSPICIOUS_TLDS_FILE"
)

# O(1) lookup sets built once at module load — used by _is_official_domain and
# _is_suspicious_domain to short-circuit the linear tuple scan in the common case.
_OFFICIAL_DOMAIN_SET: frozenset = frozenset(_OFFICIAL_DOMAIN_SUFFIXES)
_SUSPICIOUS_TLD_SET: frozenset = frozenset(_SUSPICIOUS_TLD_SUFFIXES)

# Maximum sender-set size for which an IMAP OR(FROM) search is generated.
# Above this limit A(all=True) is used to avoid overly complex IMAP queries.
_IMAP_SEARCH_SENDER_LIMIT: int = 20


def _domain_matches_suffix(domain: str, suffix: str) -> bool:
    d = domain.lower().strip()
    s = suffix.lower().strip()
    return d == s or d.endswith("." + s)


def _is_official_domain(domain: str) -> bool:
    if not domain or domain == "unknown":
        return False
    d = domain.lower().strip()
    # O(1) exact-match covers the vast majority of cases (e.g. "gmail.com").
    if d in _OFFICIAL_DOMAIN_SET:
        return True
    # Subdomain scan for cases like "mail.google.com".
    return any(d.endswith("." + s) for s in _OFFICIAL_DOMAIN_SUFFIXES)


def _is_suspicious_domain(domain: str) -> bool:
    if not domain or domain == "unknown":
        return False
    d = domain.lower()
    # Extract the final label (e.g. ".xyz" from "foo.bar.xyz") in O(1) then
    # check frozenset membership instead of 11 sequential endswith() calls.
    last_dot = d.rfind(".")
    if last_dot == -1:
        return False
    return d[last_dot:] in _SUSPICIOUS_TLD_SET


def _build_from_criteria(sender_set: set):
    """Return an IMAP search criterion matching any address in *sender_set*.

    Builds a server-side OR(FROM …) chain for small sets so the IMAP server
    returns only relevant envelopes.  Falls back to A(all=True) for large sets
    to avoid excessively long IMAP commands.  Callers must still apply a
    Python-side exact-match check as a correctness guard.
    """
    senders = list(sender_set)
    n = len(senders)
    if n == 0 or n > _IMAP_SEARCH_SENDER_LIMIT:
        return A(all=True)
    if n == 1:
        return A(from_=senders[0])
    result = A(from_=senders[0])
    for s in senders[1:]:
        result = OR(result, A(from_=s))
    return result


# ---------------------------------------------------------------------------
# Scoring tuning constants for _compute_rank_and_risk.
# rank_score orders senders (higher = more likely spam / less trusted); the
# multipliers below nudge the base spam_score up or down per signal. These are
# heuristics (not calibrated against a labelled dataset) — centralised here so
# they can be reviewed and tuned in one place. The exact values are locked by the
# golden tests in tests/test_analyzer.py.
# ---------------------------------------------------------------------------

# Rank multipliers (applied to the base spam_score).
_RANK_OFFICIAL_FACTOR = 0.18       # known official domain → strong down-weight
_RANK_HIGH_UNSUB_FACTOR = 0.52     # frequent List-Unsubscribe → likely legit bulk
_RANK_LOW_UNSUB_FACTOR = 1.18      # rarely offers unsubscribe → nudge up
_RANK_SUSPICIOUS_FACTOR = 1.28     # suspicious TLD (and not official) → nudge up
_RANK_DNS_TRUST_WEIGHT = 0.28      # scales the DNS-trust adjustment (±)
_RANK_VT_PER_FLAG = 0.13           # per-VirusTotal-flag increase …
_RANK_VT_CAP = 0.55                # … capped at this fraction

# Unsubscribe-ratio thresholds for the rank multipliers.
_UNSUB_RATIO_HIGH = 0.45           # ≥ → apply _RANK_HIGH_UNSUB_FACTOR
_UNSUB_RATIO_LOW = 0.12            # < → apply _RANK_LOW_UNSUB_FACTOR

# spam_risk label thresholds.
_RISK_VT_HIGH_FLAGS = 2            # ≥ VT flags → "high"
_RISK_LOW_UNSUB_RATIO = 0.42       # ≥ (or official) → "low"
_RISK_HIGH_UNSUB_RATIO = 0.15      # < (and not official, enough volume) → "high"
_RISK_HIGH_MIN_EMAILS = 2          # min volume for the low-unsub "high" rule
_RISK_HIGH_DNS_TRUST = -0.35       # ≤ (and not official) → "high"


def _compute_rank_and_risk(
    spam_score: float,
    email_count: int,
    unsub_ratio: float,
    domain: str,
    dns_trust_min: Optional[float] = None,
    vt_flag_total: Optional[int] = None,
) -> Tuple[float, str]:
    """
    rank_score: maior = mais provável spam / menos confiável → ordenar no topo.
    spam_risk: high | medium | low para exibição.
    """
    # Accept either a raw email address ("user@host") or an already-extracted
    # domain string ("host").  Avoids a redundant _extract_domain call when the
    # caller already stripped the domain (the common code path).
    domain = (
        _extract_domain(domain)
        if "@" in (domain or "")
        else (domain or "").lower().strip()
    )
    official = _is_official_domain(domain)
    suspicious = _is_suspicious_domain(domain)

    rank = float(spam_score)
    if official:
        rank *= _RANK_OFFICIAL_FACTOR
    if unsub_ratio >= _UNSUB_RATIO_HIGH:
        rank *= _RANK_HIGH_UNSUB_FACTOR
    elif unsub_ratio < _UNSUB_RATIO_LOW:
        rank *= _RANK_LOW_UNSUB_FACTOR
    if suspicious and not official:
        rank *= _RANK_SUSPICIOUS_FACTOR

    if dns_trust_min is not None:
        rank *= 1.0 - _RANK_DNS_TRUST_WEIGHT * dns_trust_min
    if vt_flag_total is not None and vt_flag_total > 0:
        rank *= 1.0 + min(_RANK_VT_CAP, _RANK_VT_PER_FLAG * vt_flag_total)

    # Rótulo: prioriza sinais de remetente legítimo (unsub + domínio conhecido).
    if vt_flag_total is not None and vt_flag_total >= _RISK_VT_HIGH_FLAGS:
        risk = "high"
    elif official or unsub_ratio >= _RISK_LOW_UNSUB_RATIO:
        risk = "low"
    elif suspicious or (
        not official
        and unsub_ratio < _RISK_HIGH_UNSUB_RATIO
        and email_count >= _RISK_HIGH_MIN_EMAILS
    ):
        risk = "high"
    elif (
        dns_trust_min is not None
        and dns_trust_min <= _RISK_HIGH_DNS_TRUST
        and not official
    ):
        risk = "high"
    else:
        risk = "medium"

    return rank, risk


def _clean_unsubscribe_link(raw_link: Any) -> Any:
    if not raw_link or not isinstance(raw_link, str):
        return raw_link

    http_links = re.findall(r"<(https?://[^>]+)>", raw_link)
    if http_links:
        return http_links[0]

    return raw_link.strip("<>").split(",")[0].strip()


# Pt/En keywords usados pelo fallback que varre corpos de e-mails quando o
# header List-Unsubscribe não está presente.
_UNSUB_KEYWORDS_RE = re.compile(
    r"(unsubscribe|opt[-\s]?out|descadastrar|cancelar\s+inscri\w+|"
    r"sair\s+da\s+lista|remover\s+da\s+lista|gerenciar\s+prefer\w+|"
    r"manage\s+preferences|email\s+preferences)",
    re.IGNORECASE,
)

# Captura <a href="..."> ... </a> mantendo href e texto âncora para match.
_UNSUB_ANCHOR_RE = re.compile(
    r'<a\b[^>]*?href\s*=\s*["\']([^"\']+)["\'][^>]*>(.{0,300}?)</a>',
    re.IGNORECASE | re.DOTALL,
)

# URL solta em texto plano.
_URL_RE = re.compile(r"https?://[^\s<>\"']+", re.IGNORECASE)


def _extract_unsubscribe_from_body(
    html: Optional[str], text: Optional[str]
) -> Optional[str]:
    """Procura link de unsubscribe no corpo (HTML ou texto) do e-mail.

    Estratégia:
      1. Em HTML: varre <a href=...>texto</a> e aceita se o href ou o texto
         âncora contiver uma palavra-chave de descadastro e o href for
         http(s) ou mailto.
      2. Em texto: procura uma URL próxima (±200 chars) a uma keyword.
    """
    if html:
        for match in _UNSUB_ANCHOR_RE.finditer(html):
            href = (match.group(1) or "").strip()
            anchor_text = (match.group(2) or "").strip()
            # Remove tags inline para comparar texto âncora limpo.
            anchor_clean = re.sub(r"<[^>]+>", " ", anchor_text)
            href_lower = href.lower()
            keyword_hit = bool(
                _UNSUB_KEYWORDS_RE.search(anchor_clean)
                or _UNSUB_KEYWORDS_RE.search(href_lower)
            )
            if keyword_hit and (
                href_lower.startswith(("http://", "https://", "mailto:"))
            ):
                return href

    if text:
        for m in _UNSUB_KEYWORDS_RE.finditer(text):
            window_start = max(0, m.start() - 200)
            window_end = min(len(text), m.end() + 200)
            window = text[window_start:window_end]
            url_match = _URL_RE.search(window)
            if url_match:
                return url_match.group(0).rstrip(".,);:\"'")

    return None


class EmailAnalyzer:
    def __init__(self, credentials: IMAPCredentials):
        self.credentials = credentials

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _resolve_folder(mailbox, candidates: List[str]) -> Optional[str]:
        """Return the first candidate folder name that exists on the server.

        Uses a set for O(1) membership tests instead of a list scan.
        """
        existing = {f.name for f in mailbox.folder.list()}
        for name in candidates:
            if name in existing:
                return name
        return None

    @staticmethod
    def _collect_uids(mailbox, sender_set: set) -> List[str]:
        """Collect UIDs of INBOX messages sent by any address in *sender_set*.

        Uses a server-side OR(FROM) search for small sets to reduce the number
        of envelopes the IMAP server returns.  A Python-side exact-match check
        is always applied as a correctness guard (IMAP FROM is a substring match
        and may return false positives for certain display-name formats).
        """
        criteria = _build_from_criteria(sender_set)
        uids = []
        for msg in mailbox.fetch(criteria, headers_only=True, mark_seen=False):
            from_email = (
                (msg.from_values.email or "").lower().strip() if msg.from_values else ""
            )
            if from_email in sender_set:
                uids.append(msg.uid)
        return uids

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def analyze(
        self, progress: Optional[Callable[[dict], None]] = None
    ) -> AnalysisResponse:
        """Orchestrate the analysis: fetch + group, enrich reputation, then score.

        The IMAP connection is opened once, kept for the header fetch and the
        best-effort unsubscribe body-scan, and closed before any external
        (DNS / VirusTotal) I/O begins.
        """
        criteria = self._build_criteria()

        # Single-pass IMAP fetch: headers only, never marks messages as read,
        # INBOX selected explicitly, connection closed before any external I/O.
        with MailBox(self.credentials.host).login(
            self.credentials.email, self.credentials.password.get_secret_value()
        ) as mailbox:
            mailbox.folder.set("INBOX")
            grouped, total = self._fetch_and_group(mailbox, criteria, progress)
            self._scan_unsub_fallback(mailbox, grouped, progress)

        # IMAP connection is now closed — all external I/O starts here.
        if progress:
            progress({"type": "progress", "phase": "imap_fetch", "fetched": total})

        if not total:
            return AnalysisResponse(
                total_emails_scanned=0,
                ignored_senders=[],
                health_score=100,
                source_grouping_mode=_SOURCE_GROUPING_MODE,
            )

        all_domains = self._collect_all_domains(grouped)
        use_vt = bool(os.environ.get("VIRUSTOTAL_API_KEY", "").strip())
        dns_cache, vt_cache = self._enrich_reputation(all_domains, use_vt, progress)

        # Persist updated reputation cache to disk in one write after all
        # parallel lookups have finished.
        flush_reputation_cache()

        ignored_senders, health_score = self._build_sender_stats(
            grouped, dns_cache, vt_cache, use_vt
        )

        return AnalysisResponse(
            total_emails_scanned=total,
            ignored_senders=ignored_senders,
            health_score=health_score,
            source_grouping_mode=_SOURCE_GROUPING_MODE,
        )

    # ------------------------------------------------------------------
    # analyze() stages
    # ------------------------------------------------------------------

    def _build_criteria(self):
        """Build the IMAP date-range search criterion from the credentials."""
        if self.credentials.start_date and self.credentials.end_date:
            return A(
                date_gte=self.credentials.start_date, date_lt=self.credentials.end_date
            )
        days = self.credentials.days_limit if self.credentials.days_limit else 30
        return A(date_gte=date.today() - timedelta(days=days))

    @staticmethod
    def _fetch_and_group(
        mailbox,
        criteria,
        progress: Optional[Callable[[dict], None]],
    ) -> Tuple[Dict[str, Dict[str, Any]], int]:
        """Single-pass fetch of INBOX headers, grouped by source_key.

        Returns ``(grouped, total)``. Headers only; never marks messages as read.
        """
        grouped: Dict[str, Dict[str, Any]] = {}
        total = 0
        # Per-request memoization of normalize_source: avoids repeated PSL
        # parses for the same (email, name) pair seen across many messages.
        _source_cache: Dict[Tuple[str, str], str] = {}

        for msg in mailbox.fetch(criteria, headers_only=True, mark_seen=False):
            total += 1
            # More granular progress updates for better UX:
            # - Every message for the first 20 (immediate feedback for small inboxes)
            # - Every 5 messages up to 100 (smooth progress for medium inboxes)
            # - Every 10 messages beyond that (avoid saturating the stream)
            should_report = (
                total <= 20 or (total <= 100 and total % 5 == 0) or total % 10 == 0
            )
            if progress and should_report:
                progress(
                    {"type": "progress", "phase": "imap_fetch", "fetched": total}
                )

            sender_email = (
                msg.from_values.email if msg.from_values else "unknown@unknown.com"
            )
            sender_name = (
                msg.from_values.name if msg.from_values else "Unknown Sender"
            )

            _key = (sender_email, sender_name)
            source_key = _source_cache.get(_key)
            if source_key is None:
                source_key = normalize_source(sender_email, sender_name)
                _source_cache[_key] = source_key

            is_read = 1 if "SEEN" in msg.flags else 0

            # Single dict lookup — avoids the redundant second .get() call
            # that the truthiness guard previously required.
            _unsub_vals = msg.headers.get("list-unsubscribe")
            list_unsub = _unsub_vals[0] if _unsub_vals else None

            sender_domain = _extract_domain(sender_email)

            entry = grouped.get(source_key)
            if entry is None:
                entry = {
                    "source_key": source_key,
                    "sender_name": sender_name,
                    "sender_email": sender_email,
                    "sender_emails_set": set(),
                    # domains_set is populated here so the post-fetch
                    # extraction pass and the per-group scoring pass are
                    # both eliminated — three _extract_domain calls reduced
                    # to one per unique (sender_email, source_key) pair.
                    "domains_set": set(),
                    "email_count": 0,
                    "read_sum": 0,
                    "unsub_count": 0,
                    "unsubscribe_link": list_unsub,
                    # UID da mensagem mais recente do grupo — usado pelo
                    # fallback de body-scan quando falta List-Unsubscribe.
                    "latest_uid": None,
                    "latest_date": None,
                }
                grouped[source_key] = entry

            entry["email_count"] += 1
            entry["read_sum"] += is_read
            if list_unsub:
                entry["unsub_count"] += 1
                if not entry["unsubscribe_link"]:
                    entry["unsubscribe_link"] = list_unsub
            entry["sender_emails_set"].add(sender_email)
            entry["domains_set"].add(sender_domain)
            if not entry["sender_name"] and sender_name:
                entry["sender_name"] = sender_name

            # Rastreia o UID da mensagem mais recente do grupo.
            msg_date = getattr(msg, "date", None)
            if entry["latest_date"] is None or (
                msg_date is not None and msg_date > entry["latest_date"]
            ):
                entry["latest_date"] = msg_date
                entry["latest_uid"] = msg.uid

        return grouped, total

    @staticmethod
    def _scan_unsub_fallback(
        mailbox,
        grouped: Dict[str, Dict[str, Any]],
        progress: Optional[Callable[[dict], None]],
    ) -> None:
        """Best-effort scan of the most recent message body for groups without a
        List-Unsubscribe header, still within the open IMAP connection.

        Capped to MAX_BODY_SCAN_TARGETS (default 30) sorted by email count
        descending — high-volume senders are prioritised so the cap never
        silently skips the most actionable senders. Never raises.
        """
        _max_body_scan = int(os.environ.get("MAX_BODY_SCAN_TARGETS", "30"))
        fallback_targets = sorted(
            [
                (sk, e["latest_uid"])
                for sk, e in grouped.items()
                if not e["unsubscribe_link"] and e["latest_uid"]
            ],
            key=lambda x: grouped[x[0]]["email_count"],
            reverse=True,
        )[:_max_body_scan]
        if fallback_targets:
            if progress:
                progress(
                    {
                        "type": "progress",
                        "phase": "unsub_scan",
                        "checked": 0,
                        "total": len(fallback_targets),
                    }
                )
            uid_to_key = {uid: sk for sk, uid in fallback_targets}
            uid_list = list(uid_to_key.keys())
            scanned = 0
            try:
                for body_msg in mailbox.fetch(
                    A(uid=",".join(uid_list)), mark_seen=False
                ):
                    sk = uid_to_key.get(body_msg.uid)
                    if not sk:
                        continue
                    found = _extract_unsubscribe_from_body(
                        getattr(body_msg, "html", None),
                        getattr(body_msg, "text", None),
                    )
                    if found:
                        grouped[sk]["unsubscribe_link"] = found
                    scanned += 1
                    # Report every scan for better granularity since body scans
                    # are capped to 30 messages — never too many events.
                    if progress:
                        progress(
                            {
                                "type": "progress",
                                "phase": "unsub_scan",
                                "checked": scanned,
                                "total": len(fallback_targets),
                            }
                        )
            except Exception:
                # Fallback é best-effort: nunca deve derrubar a análise.
                pass

    @staticmethod
    def _collect_all_domains(grouped: Dict[str, Dict[str, Any]]) -> set:
        """Unique sender domains across all groups (excluding 'unknown')."""
        all_domains: set = set()
        for g in grouped.values():
            all_domains.update(g["domains_set"])
        all_domains.discard("unknown")
        return all_domains

    @staticmethod
    def _enrich_reputation(
        all_domains: set,
        use_vt: bool,
        progress: Optional[Callable[[dict], None]],
    ) -> Tuple[Dict[str, Dict[str, Any]], Dict[str, Optional[Tuple[int, int]]]]:
        """Parallel DNS + optional VirusTotal lookups via a single shared pool.

        A unified future_meta dict lets one as_completed loop drain both DNS and
        VT results as they arrive — VT futures no longer sit idle until all DNS
        futures have been collected.
        """
        dns_cache: Dict[str, Dict[str, Any]] = {}
        vt_cache: Dict[str, Optional[Tuple[int, int]]] = {}

        if all_domains:
            n_domains = len(all_domains)
            max_workers = min(32, max(1, n_domains * (2 if use_vt else 1)))
            if progress:
                progress(
                    {
                        "type": "progress",
                        "phase": "dns_lookup",
                        "checked": 0,
                        "total": n_domains,
                    }
                )
            dns_checked = 0

            # Map each future → ("dns"|"vt", domain) so a single as_completed
            # loop handles both kinds without a serial drain order.
            future_meta: Dict = {}
            with ThreadPoolExecutor(max_workers=max_workers) as pool:
                for d in all_domains:
                    future_meta[pool.submit(lookup_domain_signals, d)] = ("dns", d)
                    if use_vt:
                        future_meta[pool.submit(virustotal_domain_flags, d)] = ("vt", d)

                for fut in as_completed(future_meta):
                    kind, d = future_meta[fut]
                    if kind == "dns":
                        try:
                            dns_cache[d] = fut.result()
                        except Exception:
                            dns_cache[d] = {
                                "mx": False,
                                "spf": "absent",
                                "dmarc": "absent",
                                "error": "lookup_failed",
                            }
                        dns_checked += 1
                        # Report every DNS check or every 5 VT checks (whichever completes)
                        # for more responsive progress feedback.
                        should_report_dns = dns_checked <= 20 or dns_checked % 5 == 0
                        if progress and should_report_dns:
                            progress(
                                {
                                    "type": "progress",
                                    "phase": "dns_lookup",
                                    "checked": dns_checked,
                                    "total": n_domains,
                                }
                            )
                    else:  # "vt"
                        try:
                            vt_cache[d] = fut.result()
                        except Exception:
                            vt_cache[d] = None

        return dns_cache, vt_cache

    @staticmethod
    def _build_sender_stats(
        grouped: Dict[str, Dict[str, Any]],
        dns_cache: Dict[str, Dict[str, Any]],
        vt_cache: Dict[str, Optional[Tuple[int, int]]],
        use_vt: bool,
    ) -> Tuple[List[SenderStats], int]:
        """Score each group, sort by rank score, and build the response rows.

        Returns ``(ignored_senders, health_score)``.
        """
        # Materialize and sort by rank score (O(k log k), k = number of groups).
        stats_rows: List[Dict[str, Any]] = []
        total_spam_score = 0.0

        for _, row in grouped.items():
            # HEURISTIC: open_rate is derived from the IMAP \Seen flag, which is a
            # weak proxy for engagement — recently-arrived legitimate mail is often
            # still unread, inflating spam_score. Treat the score as a ranking hint,
            # not a verdict (surfaced as such in the UI). A fuller signal would also
            # weigh message age / frequency; that is deliberately out of scope here.
            open_rate_ratio = (
                row["read_sum"] / row["email_count"] if row["email_count"] else 0.0
            )
            spam_score = row["email_count"] * (1 - open_rate_ratio) * 10
            total_spam_score += spam_score
            sender_emails_sorted = sorted(row["sender_emails_set"])

            # domains_set was built during the fetch loop — no re-extraction needed.
            domains = sorted(d for d in row["domains_set"] if d != "unknown")
            domain = domains[0] if domains else "unknown"

            if not domains:
                dns_trust_min = None
                vt_total = None
                domain_reputation = None
            else:
                trusts = [
                    dns_signals_to_trust(dns_cache[d])
                    for d in domains
                    if d in dns_cache
                ]
                dns_trust_min = min(trusts) if trusts else None

                vm: Optional[int] = None
                vs: Optional[int] = None
                vt_total: Optional[int] = None
                if use_vt:
                    vm, vs = 0, 0
                    for d in domains:
                        pair = vt_cache.get(d)
                        if pair:
                            vm = max(vm, pair[0])
                            vs = max(vs, pair[1])
                    vt_total = vm + vs

                primary = domains[0]
                primary_sig = dns_cache.get(primary, {})
                summary_pt = describe_domain_signals_pt(primary_sig)
                summary_en = describe_domain_signals_en(primary_sig)
                if len(domains) > 1:
                    summary_pt = f"{summary_pt} (+{len(domains) - 1} domínios)"
                    summary_en = f"{summary_en} (+{len(domains) - 1} domains)"
                if use_vt and vm is not None and vs is not None:
                    summary_pt = f"{summary_pt} · VT: mal={vm} sus={vs}"
                    summary_en = f"{summary_en} · VT: mal={vm} sus={vs}"

                domain_reputation = DomainReputation(
                    primary_domain=primary,
                    checked_domains=domains,
                    mx=primary_sig.get("mx"),
                    spf=str(primary_sig.get("spf"))
                    if primary_sig.get("spf") is not None
                    else None,
                    dmarc=str(primary_sig.get("dmarc"))
                    if primary_sig.get("dmarc") is not None
                    else None,
                    dns_trust=round(dns_trust_min, 4)
                    if dns_trust_min is not None
                    else None,
                    summary_pt=summary_pt,
                    summary_en=summary_en,
                    virustotal_malicious=vm if use_vt else None,
                    virustotal_suspicious=vs if use_vt else None,
                )

            unsub_ratio = (
                row["unsub_count"] / row["email_count"] if row["email_count"] else 0.0
            )
            rank_score, spam_risk = _compute_rank_and_risk(
                spam_score,
                row["email_count"],
                unsub_ratio,
                domain,
                dns_trust_min=dns_trust_min,
                vt_flag_total=vt_total,
            )
            stats_rows.append(
                {
                    "source_key": row["source_key"],
                    "sender_name": row["sender_name"] or row["source_key"],
                    "sender_email": row["sender_email"],
                    "sender_emails": sender_emails_sorted,
                    "email_count": row["email_count"],
                    "open_rate": open_rate_ratio,
                    "spam_score": spam_score,
                    "rank_score": rank_score,
                    "spam_risk": spam_risk,
                    "domain_reputation": domain_reputation,
                    "unsubscribe_link": _clean_unsubscribe_link(
                        row["unsubscribe_link"]
                    ),
                }
            )

        stats_rows.sort(key=lambda r: r["rank_score"], reverse=True)

        ignored_senders = [
            SenderStats(
                sender_name=row["sender_name"],
                sender_email=row["sender_email"],
                source_key=row["source_key"],
                sender_emails=row["sender_emails"],
                email_count=int(row["email_count"]),
                open_rate=round(row["open_rate"] * 100, 1),
                spam_score=round(row["spam_score"], 1),
                spam_risk=row["spam_risk"],
                domain_reputation=row["domain_reputation"],
                unsubscribe_link=row["unsubscribe_link"],
            )
            for row in stats_rows
        ]

        health_score = max(0, min(100, 100 - int(total_spam_score / 5)))
        return ignored_senders, health_score

    def delete_emails(self, sender_emails: List[str]) -> Dict[str, int]:
        sender_set = {
            sender.lower().strip()
            for sender in sender_emails
            if sender and sender.strip()
        }
        if not sender_set:
            return {"deleted": 0}

        with MailBox(self.credentials.host).login(
            self.credentials.email, self.credentials.password.get_secret_value()
        ) as mailbox:
            trash_folder = self._resolve_folder(
                mailbox,
                [
                    "[Gmail]/Trash",
                    "[Gmail]/Lixeira",
                    "Trash",
                    "Deleted Items",
                    "Deleted",
                    "Itens Excluídos",
                    "INBOX.Trash",
                ],
            )
            mailbox.folder.set("INBOX")
            uids = self._collect_uids(mailbox, sender_set)
            if uids:
                if trash_folder:
                    mailbox.move(uids, trash_folder)
                else:
                    mailbox.delete(uids)

        return {"deleted": len(uids)}

    def archive_emails(self, sender_emails: List[str]) -> Dict[str, int]:
        sender_set = {
            sender.lower().strip()
            for sender in sender_emails
            if sender and sender.strip()
        }
        if not sender_set:
            return {"archived": 0, "not_archived": 0}

        with MailBox(self.credentials.host).login(
            self.credentials.email, self.credentials.password.get_secret_value()
        ) as mailbox:
            archive_folder = self._resolve_folder(
                mailbox,
                [
                    "[Gmail]/All Mail",
                    "[Gmail]/Todos os e-mails",
                    "Archive",
                    "Arquivo",
                    "All Mail",
                ],
            )
            mailbox.folder.set("INBOX")
            uids = self._collect_uids(mailbox, sender_set)
            if uids:
                if archive_folder:
                    mailbox.move(uids, archive_folder)
                    return {"archived": len(uids), "not_archived": 0}
                return {"archived": 0, "not_archived": len(uids)}

        return {"archived": 0, "not_archived": 0}
