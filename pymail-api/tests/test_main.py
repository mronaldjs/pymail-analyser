
from fastapi.testclient import TestClient

import main


client = TestClient(main.app)


def test_ready_returns_ready_and_mode():
    response = client.get("/ready")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ready"
    assert body["source_grouping_mode"] in {"provider", "tenant"}


def _valid_credentials_payload() -> dict:
    return {
        "host": "imap.example.com",
        "email": "user@example.com",
        "password": "app-password",
        "days_limit": 30,
    }


def test_healthcheck_returns_ok_and_mode():
    response = client.get("/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["source_grouping_mode"] in {"provider", "tenant"}


def test_analyze_auth_error_returns_structured_payload(monkeypatch):
    class FailingAnalyzer:
        def __init__(self, _credentials):
            pass

        def analyze(self):
            raise RuntimeError("Authentication failed")

    monkeypatch.setattr(main, "EmailAnalyzer", FailingAnalyzer)

    # Testa sem request_id
    response = client.post("/analyze", json=_valid_credentials_payload())
    assert response.status_code == 401
    body = response.json()
    assert body["error_code"] == "IMAP_AUTH_FAILED"
    assert isinstance(body["detail"], str)
    # Testa com request_id propagado
    custom_id = "test-req-123"
    response2 = client.post("/analyze", json=_valid_credentials_payload(), headers={"x-request-id": custom_id})
    assert response2.status_code == 401
    body2 = response2.json()
    assert body2["error_code"] == "IMAP_AUTH_FAILED"
    assert body2["request_id"] == custom_id


def test_analyze_unavailable_error_returns_structured_payload(monkeypatch):
    class FailingAnalyzer:
        def __init__(self, _credentials):
            pass

        def analyze(self):
            raise RuntimeError("connection timed out")

    monkeypatch.setattr(main, "EmailAnalyzer", FailingAnalyzer)

    # Testa sem request_id
    response = client.post("/analyze", json=_valid_credentials_payload())
    assert response.status_code == 503
    body = response.json()
    assert body["error_code"] == "IMAP_UNAVAILABLE"
    assert isinstance(body["detail"], str)
    # Testa com request_id propagado
    custom_id = "test-req-456"
    response2 = client.post("/analyze", json=_valid_credentials_payload(), headers={"x-request-id": custom_id})
    assert response2.status_code == 503
    body2 = response2.json()
    assert body2["error_code"] == "IMAP_UNAVAILABLE"
    assert body2["request_id"] == custom_id


def test_analyze_rejects_internal_host():
    """SSRF guard: a host resolving to a loopback/internal IP is rejected (400)."""
    payload = _valid_credentials_payload()
    payload["host"] = "127.0.0.1"

    response = client.post("/analyze", json=payload)

    assert response.status_code == 400
    body = response.json()
    assert body["error_code"] == "IMAP_HOST_NOT_ALLOWED"


def test_analyze_rejects_link_local_metadata_host():
    """SSRF guard: the cloud metadata endpoint (link-local) is rejected."""
    payload = _valid_credentials_payload()
    payload["host"] = "169.254.169.254"

    response = client.post("/analyze", json=payload)

    assert response.status_code == 400
    assert response.json()["error_code"] == "IMAP_HOST_NOT_ALLOWED"


def test_rate_limit_returns_429_after_threshold():
    """With the limiter enabled, the 6th request within the window is throttled."""
    main.limiter.enabled = True
    try:
        payload = _valid_credentials_payload()
        payload["host"] = "127.0.0.1"  # rejected by the guard → fast, no IMAP I/O

        statuses = [
            client.post("/analyze", json=payload).status_code for _ in range(6)
        ]
    finally:
        main.limiter.enabled = False

    # First 5 pass through to the guard (400); the 6th trips the 5/minute limit.
    assert statuses[:5] == [400, 400, 400, 400, 400]
    assert statuses[5] == 429


def test_analyze_dns_error_maps_to_host_unresolved(monkeypatch):
    """A DNS-resolution failure (empty/typo'd host) maps to IMAP_HOST_UNRESOLVED
    (400) with a 'check the host' message — not the misleading IMAP_UNAVAILABLE."""

    class FailingAnalyzer:
        def __init__(self, _credentials):
            pass

        def analyze(self):
            raise RuntimeError("[Errno -2] Name or service not known")

    monkeypatch.setattr(main, "EmailAnalyzer", FailingAnalyzer)

    response = client.post("/analyze", json=_valid_credentials_payload())
    assert response.status_code == 400
    assert response.json()["error_code"] == "IMAP_HOST_UNRESOLVED"