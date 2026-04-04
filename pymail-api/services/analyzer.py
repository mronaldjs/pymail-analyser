from datetime import date, timedelta
from typing import List, Dict, Any, Tuple, Optional
import os
from imap_tools import MailBox, A
from models.schemas import (
    IMAPCredentials,
    SenderStats,
    AnalysisResponse,
    DomainReputation,
)
from services.domain_reputation import (
    lookup_domain_signals,
    dns_signals_to_trust,
    virustotal_domain_flags,
    describe_domain_signals_pt,
)
import re


def _extract_domain(email: str) -> str:
    if not email or "@" not in email:
        return "unknown"
    return email.split("@", 1)[1].lower().strip()


def normalize_source(sender_email: str, sender_name: str) -> str:
    email = (sender_email or "").lower().strip()
    name = (sender_name or "").lower().strip()
    domain = _extract_domain(email)

    linkedin_signals = ["linkedin", "lnkd"]
    if any(signal in email for signal in linkedin_signals) or any(signal in name for signal in linkedin_signals):
        return "linkedin"

    if domain and domain != "unknown":
        parts = domain.split(".")
        if len(parts) >= 2:
            return parts[-2]
        return domain

    return "unknown"


# Domínios/hosts frequentemente associados a serviços conhecidos (remetentes “oficiais”).
_OFFICIAL_DOMAIN_SUFFIXES: Tuple[str, ...] = (
    "gmail.com",
    "googlemail.com",
    "google.com",
    "outlook.com",
    "hotmail.com",
    "live.com",
    "msn.com",
    "icloud.com",
    "me.com",
    "mac.com",
    "yahoo.com",
    "yahoo.com.br",
    "proton.me",
    "protonmail.com",
    "microsoft.com",
    "apple.com",
    "amazon.com",
    "paypal.com",
    "linkedin.com",
    "linkedinmail.com",
    "facebook.com",
    "meta.com",
    "instagram.com",
    "twitter.com",
    "x.com",
    "github.com",
    "slack.com",
    "zoom.us",
    "netflix.com",
    "spotify.com",
    "stripe.com",
    "gov.br",
    "jus.br",
    "ufg.br",
    "discente.ufg.br",
)

# TLDs frequentemente usados em spam / domínios descartáveis (heurística).
_SUSPICIOUS_TLD_SUFFIXES: Tuple[str, ...] = (
    ".xyz",
    ".top",
    ".click",
    ".bid",
    ".loan",
    ".gq",
    ".tk",
    ".ml",
    ".cf",
    ".ga",
    ".pw",
    ".zip",
)


def _domain_matches_suffix(domain: str, suffix: str) -> bool:
    d = domain.lower().strip()
    s = suffix.lower().strip()
    return d == s or d.endswith("." + s)


def _is_official_domain(domain: str) -> bool:
    if not domain or domain == "unknown":
        return False
    return any(_domain_matches_suffix(domain, s) for s in _OFFICIAL_DOMAIN_SUFFIXES)


def _is_suspicious_domain(domain: str) -> bool:
    if not domain or domain == "unknown":
        return False
    d = domain.lower()
    return any(d.endswith(tld) for tld in _SUSPICIOUS_TLD_SUFFIXES)


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
    official = _is_official_domain(domain)
    suspicious = _is_suspicious_domain(domain)

    rank = float(spam_score)
    if official:
        rank *= 0.18
    if unsub_ratio >= 0.45:
        rank *= 0.52
    elif unsub_ratio < 0.12:
        rank *= 1.18
    if suspicious and not official:
        rank *= 1.28

    if dns_trust_min is not None:
        rank *= 1.0 - 0.28 * dns_trust_min
    if vt_flag_total is not None and vt_flag_total > 0:
        rank *= 1.0 + min(0.55, 0.13 * vt_flag_total)

    # Rótulo: prioriza sinais de remetente legítimo (unsub + domínio conhecido).
    if vt_flag_total is not None and vt_flag_total >= 2:
        risk = "high"
    elif official or unsub_ratio >= 0.42:
        risk = "low"
    elif suspicious or (not official and unsub_ratio < 0.15 and email_count >= 2):
        risk = "high"
    elif dns_trust_min is not None and dns_trust_min <= -0.35 and not official:
        risk = "high"
    else:
        risk = "medium"

    return rank, risk


def _clean_unsubscribe_link(raw_link: Any) -> Any:
    if not raw_link or not isinstance(raw_link, str):
        return raw_link

    http_links = re.findall(r'<(https?://[^>]+)>', raw_link)
    if http_links:
        return http_links[0]

    return raw_link.strip('<>').split(',')[0].strip()

class EmailAnalyzer:
    def __init__(self, credentials: IMAPCredentials):
        self.credentials = credentials

    def analyze(self) -> AnalysisResponse:
        # 1. Connect to IMAP
        with MailBox(self.credentials.host).login(self.credentials.email, self.credentials.password) as mailbox:
            # 2. Fetch headers - support both days_limit and custom date range
            if self.credentials.start_date and self.credentials.end_date:
                # Custom date range
                criteria = A(date_gte=self.credentials.start_date, date_lt=self.credentials.end_date)
            else:
                # Default to days_limit
                days = self.credentials.days_limit if self.credentials.days_limit else 30
                criteria = A(date_gte=date.today() - timedelta(days=days))
            
            # Fetching messages
            messages = []
            for msg in mailbox.fetch(criteria, bulk=True):
                sender_email = msg.from_values.email if msg.from_values else "unknown@unknown.com"
                sender_name = msg.from_values.name if msg.from_values else "Unknown Sender"
                messages.append({
                    "sender_email": sender_email,
                    "sender_name": sender_name,
                    "source_key": normalize_source(sender_email, sender_name),
                    "is_read": 1 if 'SEEN' in msg.flags else 0,
                    "list_unsubscribe": msg.headers.get('list-unsubscribe', [None])[0] if msg.headers.get('list-unsubscribe') else None
                })

        if not messages:
            return AnalysisResponse(total_emails_scanned=0, ignored_senders=[], health_score=100)

        # 3. Single-pass aggregation (O(n)) using hash map
        grouped: Dict[str, Dict[str, Any]] = {}
        for item in messages:
            source_key = item["source_key"]
            entry = grouped.get(source_key)
            if not entry:
                entry = {
                    "source_key": source_key,
                    "sender_name": item["sender_name"],
                    "sender_email": item["sender_email"],
                    "sender_emails_set": set(),
                    "email_count": 0,
                    "read_sum": 0,
                    "unsub_count": 0,
                    "unsubscribe_link": item["list_unsubscribe"],
                }
                grouped[source_key] = entry

            entry["email_count"] += 1
            entry["read_sum"] += item["is_read"]
            if item["list_unsubscribe"]:
                entry["unsub_count"] += 1
            entry["sender_emails_set"].add(item["sender_email"])
            if not entry["sender_name"] and item["sender_name"]:
                entry["sender_name"] = item["sender_name"]
            if not entry["unsubscribe_link"] and item["list_unsubscribe"]:
                entry["unsubscribe_link"] = item["list_unsubscribe"]

        all_domains = {
            _extract_domain(addr)
            for g in grouped.values()
            for addr in g["sender_emails_set"]
        }
        all_domains.discard("unknown")

        dns_cache: Dict[str, Dict[str, Any]] = {
            d: lookup_domain_signals(d) for d in sorted(all_domains)
        }

        use_vt = bool(os.environ.get("VIRUSTOTAL_API_KEY", "").strip())
        vt_cache: Dict[str, Optional[Tuple[int, int]]] = {}
        if use_vt:
            for d in sorted(all_domains):
                vt_cache[d] = virustotal_domain_flags(d)

        # 4. Materialize and sort by score (O(k log k), k = number of groups)
        stats_rows: List[Dict[str, Any]] = []
        total_spam_score = 0.0
        for _, row in grouped.items():
            open_rate_ratio = row["read_sum"] / row["email_count"] if row["email_count"] else 0.0
            spam_score = row["email_count"] * (1 - open_rate_ratio) * 10
            total_spam_score += spam_score
            sender_emails_sorted = sorted(row["sender_emails_set"])
            rep_email = sender_emails_sorted[0] if sender_emails_sorted else row["sender_email"]
            domain = _extract_domain(rep_email)

            domains = sorted(
                {
                    _extract_domain(addr)
                    for addr in row["sender_emails_set"]
                    if _extract_domain(addr) != "unknown"
                }
            )
            if not domains:
                dns_trust_min = None
                vt_total = None
                domain_reputation = None
            else:
                trusts = [dns_signals_to_trust(dns_cache[d]) for d in domains]
                dns_trust_min = min(trusts)

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
                summary = describe_domain_signals_pt(primary_sig)
                if len(domains) > 1:
                    summary = f"{summary} (+{len(domains) - 1} domínios)"
                if use_vt and vm is not None and vs is not None:
                    summary = f"{summary} · VT: mal={vm} sus={vs}"

                domain_reputation = DomainReputation(
                    primary_domain=primary,
                    checked_domains=domains,
                    mx=primary_sig.get("mx"),
                    spf=str(primary_sig.get("spf")) if primary_sig.get("spf") is not None else None,
                    dmarc=str(primary_sig.get("dmarc")) if primary_sig.get("dmarc") is not None else None,
                    dns_trust=round(dns_trust_min, 4) if dns_trust_min is not None else None,
                    summary_pt=summary,
                    virustotal_malicious=vm if use_vt else None,
                    virustotal_suspicious=vs if use_vt else None,
                )

            unsub_ratio = row["unsub_count"] / row["email_count"] if row["email_count"] else 0.0
            rank_score, spam_risk = _compute_rank_and_risk(
                spam_score,
                row["email_count"],
                unsub_ratio,
                domain,
                dns_trust_min=dns_trust_min,
                vt_flag_total=vt_total,
            )
            stats_rows.append({
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
                "unsubscribe_link": _clean_unsubscribe_link(row["unsubscribe_link"]),
            })

        stats_rows.sort(key=lambda row: row["rank_score"], reverse=True)

        # 5. Format Response
        ignored_senders = []
        for row in stats_rows:
            ignored_senders.append(SenderStats(
                sender_name=row["sender_name"],
                sender_email=row["sender_email"],
                source_key=row["source_key"],
                sender_emails=row["sender_emails"],
                email_count=int(row["email_count"]),
                open_rate=round(row["open_rate"] * 100, 1),  # Convert to percentage
                spam_score=round(row["spam_score"], 1),
                spam_risk=row["spam_risk"],
                domain_reputation=row["domain_reputation"],
                unsubscribe_link=row["unsubscribe_link"]
            ))

        # Calculate overall health score (inverse of total spam score, normalized roughly)
        health_score = max(0, min(100, 100 - int(total_spam_score / 5)))  # Arbitrary scaling for demo

        return AnalysisResponse(
            total_emails_scanned=len(messages),
            ignored_senders=ignored_senders,
            health_score=health_score
        )

    def delete_emails(self, sender_emails: List[str]) -> Dict[str, int]:
        sender_set = {sender.lower().strip() for sender in sender_emails if sender}
        if not sender_set:
            return {"deleted": 0}

        deleted_count = 0
        with MailBox(self.credentials.host).login(self.credentials.email, self.credentials.password) as mailbox:
            # Try to find the Trash folder
            trash_folder = None
            possible_trash_names = ['[Gmail]/Trash', '[Gmail]/Lixeira', 'Trash', 'Deleted Items', 'Deleted', 'Itens Excluídos', 'INBOX.Trash']
            
            # Get list of folders
            folders = [f.name for f in mailbox.folder.list()]
            
            for name in possible_trash_names:
                if name in folders:
                    trash_folder = name
                    break
            
            # Single fetch pass (batch): collect all matching UIDs once.
            mailbox.folder.set('INBOX')
            uids = []
            for msg in mailbox.fetch(A(all=True), headers_only=True):
                from_email = (msg.from_values.email or "").lower().strip() if msg.from_values else ""
                if from_email in sender_set:
                    uids.append(msg.uid)

            if uids:
                if trash_folder:
                    # Move to Trash is the most reliable "Delete" for Gmail
                    mailbox.move(uids, trash_folder)
                else:
                    # Fallback to standard delete (flag \Deleted)
                    mailbox.delete(uids)
                deleted_count = len(uids)
        
        return {"deleted": deleted_count}

    def archive_emails(self, sender_emails: List[str]) -> Dict[str, int]:
        sender_set = {sender.lower().strip() for sender in sender_emails if sender}
        if not sender_set:
            return {"archived": 0}

        archived_count = 0
        with MailBox(self.credentials.host).login(self.credentials.email, self.credentials.password) as mailbox:
            # Try to find the Archive/All Mail folder
            archive_folder = None
            possible_archive_names = ['[Gmail]/All Mail', '[Gmail]/Todos os e-mails', 'Archive', 'Arquivo', 'All Mail']
            
            # Get list of folders
            folders = [f.name for f in mailbox.folder.list()]
            
            for name in possible_archive_names:
                if name in folders:
                    archive_folder = name
                    break
            
            # Single fetch pass in INBOX to avoid one IMAP query per sender.
            mailbox.folder.set('INBOX')
            uids = []
            for msg in mailbox.fetch(A(all=True), headers_only=True):
                from_email = (msg.from_values.email or "").lower().strip() if msg.from_values else ""
                if from_email in sender_set:
                    uids.append(msg.uid)

            if uids:
                if archive_folder:
                    # Move to Archive/All Mail
                    mailbox.move(uids, archive_folder)
                else:
                    # If no archive folder exists, fallback to delete from INBOX context
                    mailbox.delete(uids)
                archived_count = len(uids)
        
        return {"archived": archived_count}
