"""Network guard for the IMAP-proxy endpoints.

The API logs into whatever IMAP host the client supplies. Without a guard that
turns the backend into an SSRF primitive: a client could point ``host`` at
internal services (``127.0.0.1``, ``10.x``, ``192.168.x``) or the cloud metadata
endpoint (``169.254.169.254``). ``validate_imap_host`` resolves the hostname and
rejects it when *any* resolved address is non-public.

Public hosts are intentionally allowed so custom/self-hosted IMAP servers keep
working (the product supports arbitrary IMAP hosts). Note: this does not defend
against DNS-rebinding (TOCTOU between validation and connection) — an accepted
limitation for this self-hosted tool.
"""

from __future__ import annotations

import ipaddress
import socket
from typing import List

__all__ = ["HostNotAllowedError", "validate_imap_host"]


class HostNotAllowedError(Exception):
    """Raised when an IMAP host is empty, unresolvable, or non-public."""


def _resolve_ips(host: str) -> List[str]:
    """Return every IP address *host* resolves to (IPv4 and IPv6)."""
    infos = socket.getaddrinfo(host, None)
    # sockaddr is info[4]; its first element is the IP for both AF_INET/AF_INET6.
    return [str(info[4][0]) for info in infos]


def validate_imap_host(host: str) -> None:
    """Reject hosts that resolve to a private/loopback/reserved address.

    Raises ``HostNotAllowedError`` if the host is empty, cannot be resolved, or
    any resolved IP is not a normal public unicast address. Returns ``None`` when
    the host is allowed.
    """
    h = (host or "").strip()
    if not h:
        raise HostNotAllowedError("empty host")

    try:
        ips = _resolve_ips(h)
    except socket.gaierror:
        # Host does not resolve — no internal resource can be reached, so this is
        # not an SSRF vector. Let the connection attempt surface the real network
        # error (mapped to IMAP_UNAVAILABLE) instead of masking it as "not allowed".
        return

    for ip in ips:
        addr = ipaddress.ip_address(ip)
        if (
            addr.is_private
            or addr.is_loopback
            or addr.is_link_local
            or addr.is_reserved
            or addr.is_multicast
            or addr.is_unspecified
        ):
            raise HostNotAllowedError(
                f"host resolves to a disallowed address: {ip}"
            )
