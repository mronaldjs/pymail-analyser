"""
Reputation check for the sender's domain (part after @).

- Public DNS (no API key required): MX, SPF (TXT), DMARC (_dmarc).
- Optional: VirusTotal v3 if VIRUSTOTAL_API_KEY environment variable is defined.

Limitations: This is not a substitute for antivirus or content analysis; it is an auxiliary signal.
"""

from __future__ import annotations

import json
import os
import re
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import dns.exception
import dns.resolver

__all__ = [
    "lookup_domain_signals",
    "dns_signals_to_trust",
    "virustotal_domain_flags",
    "describe_domain_signals_en",
    "flush_reputation_cache",
]

_CACHE_DEFAULT_FILE = (
    Path(__file__).resolve().parents[2] / ".cache" / "domain_reputation_cache.json"
)

# ---------------------------------------------------------------------------
# Thread-safety primitives and in-memory cache state
# ---------------------------------------------------------------------------

_cache_lock: threading.Lock = threading.Lock()
_in_memory_cache: Optional[Dict[str, Any]] = None
_cache_dirty: bool = False


# ---------------------------------------------------------------------------
# Disk I/O helpers (unchanged)
# ---------------------------------------------------------------------------


def _cache_file_path() -> Path:
    raw = os.environ.get("DOMAIN_REPUTATION_CACHE_FILE", "").strip()
    if raw:
        return Path(raw)
    return _CACHE_DEFAULT_FILE


def _load_cache() -> Dict[str, Any]:
    path = _cache_file_path()
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def _save_cache(data: Dict[str, Any]) -> None:
    # Atomic write: serialize to a temp file then os.replace() so a crash mid-write
    # never leaves a corrupt/partial cache. NOTE: this is process-local — running
    # multiple uvicorn workers/replicas would race on this file; scaling out needs
    # a shared cache (sqlite/redis) first. The prod image runs a single worker.
    path = _cache_file_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    tmp.replace(path)


# ---------------------------------------------------------------------------
# In-memory cache helpers
# ---------------------------------------------------------------------------


def _get_in_memory_cache() -> Dict[str, Any]:
    """
    Return the in-memory cache, lazy-loading from disk on the very first call.
    Must be called while holding ``_cache_lock``.
    """
    global _in_memory_cache
    if _in_memory_cache is None:
        _in_memory_cache = _load_cache()
    return _in_memory_cache


def _cache_get(key: str, ttl_seconds: int) -> Optional[Any]:
    with _cache_lock:
        cache = _get_in_memory_cache()
        record = cache.get(key)
    if not record or not isinstance(record, dict):
        return None
    ts = record.get("ts")
    if not isinstance(ts, (int, float)):
        return None
    if time.time() - float(ts) > ttl_seconds:
        return None
    return record.get("value")


def _cache_set(key: str, value: Any) -> None:
    global _cache_dirty
    with _cache_lock:
        cache = _get_in_memory_cache()
        cache[key] = {"ts": time.time(), "value": value}
        _cache_dirty = True


# ---------------------------------------------------------------------------
# Public flush function
# ---------------------------------------------------------------------------


def flush_reputation_cache() -> None:
    """
    Persist the in-memory cache to disk if it has been modified since the last
    flush (or since start-up).  Safe to call from any thread at any time.
    """
    global _cache_dirty
    with _cache_lock:
        if _cache_dirty and _in_memory_cache is not None:
            _save_cache(_in_memory_cache)
            _cache_dirty = False


# ---------------------------------------------------------------------------
# Private DNS / text helpers (unchanged)
# ---------------------------------------------------------------------------


def _txt_join(rdata: Any) -> str:
    parts: List[str] = []
    for item in rdata.strings:
        if isinstance(item, bytes):
            parts.append(item.decode("utf-8", errors="replace"))
        else:
            parts.append(str(item))
    return "".join(parts)


def _classify_spf(spf_lower: str) -> str:
    s = spf_lower.replace(" ", "")
    if "+all" in s or "?all" in s and "+all" in spf_lower:
        return "permissive"
    if "-all" in s or "~all" in s:
        return "strict"
    if "v=spf1" in spf_lower:
        return "present"
    return "absent"


def _parse_dmarc_policy(txt_lower: str) -> str:
    if "p=reject" in txt_lower:
        return "reject"
    if "p=quarantine" in txt_lower:
        return "quarantine"
    if "p=none" in txt_lower:
        return "none"
    if "v=dmarc1" in txt_lower:
        return "none"
    return "absent"


# ---------------------------------------------------------------------------
# Public API (unchanged)
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# Hardcoded trusted signals for well-known official domains.
# These organizations publish stable, maximally-strict DNS records that never
# regress — resolving them via DNS wastes 3 round trips per scan.
# ---------------------------------------------------------------------------

_HARDCODED_TRUSTED_DOMAINS: frozenset = frozenset({
    "gmail.com", "googlemail.com", "google.com",
    "outlook.com", "hotmail.com", "live.com", "msn.com",
    "microsoft.com",
    "icloud.com", "me.com", "mac.com", "apple.com",
    "yahoo.com", "yahoo.com.br",
    "proton.me", "protonmail.com",
    "amazon.com",
    "linkedin.com", "linkedinmail.com",
    "facebook.com", "meta.com",
    "paypal.com",
})

_HARDCODED_TRUSTED_SIGNAL: Dict[str, Any] = {
    "mx": True,
    "spf": "strict",
    "dmarc": "reject",
    "error": None,
}


def _is_hardcoded_trusted(domain: str) -> bool:
    d = domain.lower().strip()
    if d in _HARDCODED_TRUSTED_DOMAINS:
        return True
    # Subdomain check: e.g. "mail.google.com"
    return any(d.endswith("." + td) for td in _HARDCODED_TRUSTED_DOMAINS)


def lookup_domain_signals(domain: str) -> Dict[str, Any]:
    """
    Returns DNS signals. Keys: mx (bool), spf, dmarc (strings), error (optional).
    Well-known official domains are short-circuited with hardcoded trusted signals
    to avoid 3 DNS round trips per scan for the most common senders.
    """
    if not domain or domain == "unknown":
        return {"mx": False, "spf": "absent", "dmarc": "absent", "error": None}

    # Fast path: skip DNS for known-good official domains.
    if _is_hardcoded_trusted(domain):
        return _HARDCODED_TRUSTED_SIGNAL.copy()

    ttl = int(os.environ.get("DOMAIN_REPUTATION_DNS_TTL_SECONDS", "21600"))  # 6h
    cache_key = f"dns:{domain.lower().strip()}"
    cached = _cache_get(cache_key, ttl)
    if isinstance(cached, dict):
        return cached

    out: Dict[str, Any] = {
        "mx": False,
        "spf": "absent",
        "dmarc": "absent",
        "error": None,
    }

    # Configurable timeout — default 1.5s (down from 2.5s), cutting worst-case
    # per-domain latency from 15s to 9s for MX + TXT + _dmarc.TXT queries.
    timeout = float(os.environ.get("DNS_QUERY_TIMEOUT_SECONDS", "1.5"))
    resolver = dns.resolver.Resolver()
    resolver.timeout = timeout
    resolver.lifetime = timeout * 2

    def _safe_resolve(qname: str, rtype: str):
        try:
            return resolver.resolve(qname, rtype)
        except dns.resolver.NXDOMAIN:
            return None
        except dns.resolver.NoAnswer:
            return None
        except dns.resolver.NoNameservers:
            out["error"] = "no_nameservers"
            return None
        except dns.exception.DNSException as e:
            out["error"] = str(e)
            return None
        except Exception as e:
            out["error"] = str(e)
            return None

    ans_mx = _safe_resolve(domain, "MX")
    out["mx"] = bool(ans_mx)

    ans_txt = _safe_resolve(domain, "TXT")
    if ans_txt:
        for r in ans_txt:
            raw = _txt_join(r).lower()
            if "v=spf1" in raw:
                out["spf"] = _classify_spf(raw)
                break

    dmarc_host = f"_dmarc.{domain}"
    ans_dmarc = _safe_resolve(dmarc_host, "TXT")
    if ans_dmarc:
        for r in ans_dmarc:
            raw = _txt_join(r).lower()
            if "v=dmarc1" in raw:
                out["dmarc"] = _parse_dmarc_policy(raw)
                break

    _cache_set(cache_key, out)
    return out


def dns_signals_to_trust(sig: Dict[str, Any]) -> float:
    """
    -1.0 = muito suspeito (ausência de MX/SPF/DMARC ou SPF permissivo)
    +1.0 = forte sinal de operação de e-mail séria
    """
    t = 0.0
    if sig.get("mx"):
        t += 0.15
    spf = sig.get("spf") or "absent"
    if spf == "strict":
        t += 0.22
    elif spf == "present":
        t += 0.12
    elif spf == "permissive":
        t -= 0.4
    else:
        t -= 0.1

    dm = sig.get("dmarc") or "absent"
    if dm == "reject":
        t += 0.28
    elif dm == "quarantine":
        t += 0.18
    elif dm == "none":
        t += 0.06
    else:
        t -= 0.1

    if sig.get("error"):
        t -= 0.05

    return max(-1.0, min(1.0, t))


def virustotal_domain_flags(domain: str) -> Optional[Tuple[int, int]]:
    """
    (malicious, suspicious) segundo last_analysis_stats, ou None se sem chave/erro.
    """
    api_key = os.environ.get("VIRUSTOTAL_API_KEY", "").strip()
    if not api_key or not domain or domain == "unknown":
        return None
    ttl = int(os.environ.get("DOMAIN_REPUTATION_VT_TTL_SECONDS", "43200"))  # 12h
    cache_key = f"vt:{domain.lower().strip()}"
    cached = _cache_get(cache_key, ttl)
    if isinstance(cached, list) and len(cached) == 2:
        return int(cached[0]), int(cached[1])
    if isinstance(cached, tuple) and len(cached) == 2:
        return int(cached[0]), int(cached[1])

    safe_domain = re.sub(r"[^a-z0-9._-]", "", domain.lower())[:253]
    if safe_domain != domain.lower():
        return None
    url = f"https://www.virustotal.com/api/v3/domains/{safe_domain}"
    req = urllib.request.Request(url, headers={"x-apikey": api_key})
    try:
        with urllib.request.urlopen(req, timeout=12.0) as resp:
            body = json.loads(resp.read().decode("utf-8", errors="replace"))
        stats = (
            body.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
        )
        mal = int(stats.get("malicious", 0) or 0)
        sus = int(stats.get("suspicious", 0) or 0)
        _cache_set(cache_key, [mal, sus])
        return mal, sus
    except urllib.error.HTTPError as e:
        if e.code == 404:
            _cache_set(cache_key, [0, 0])
            return 0, 0
        return None
    except Exception:
        return None


def describe_domain_signals_pt(sig: Dict[str, Any]) -> str:
    mx = "sim" if sig.get("mx") else "não"
    spf = str(sig.get("spf") or "?")
    dm = str(sig.get("dmarc") or "?")
    parts = [f"MX:{mx}", f"SPF:{spf}", f"DMARC:{dm}"]
    if sig.get("error"):
        parts.append("erro DNS")
    return " · ".join(parts)


def describe_domain_signals_en(sig: Dict[str, Any]) -> str:
    mx = "yes" if sig.get("mx") else "no"
    spf = str(sig.get("spf") or "?")
    dm = str(sig.get("dmarc") or "?")
    parts = [f"MX:{mx}", f"SPF:{spf}", f"DMARC:{dm}"]
    if sig.get("error"):
        parts.append("DNS error")
    return " · ".join(parts)

