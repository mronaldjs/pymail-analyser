
def test_ready_returns_ready_and_mode():
    response = client.get("/ready")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ready"
    assert body["source_grouping_mode"] in {"provider", "tenant"}
from fastapi.testclient import TestClient

import main


client = TestClient(main.app)


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