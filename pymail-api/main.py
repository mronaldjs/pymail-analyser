import uuid
from fastapi import Request
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import AsyncIterator
from models.schemas import (
    IMAPCredentials,
    AnalysisResponse,
    DeleteRequest,
    HealthResponse,
    ReadyResponse,
)
from services.analyzer import EmailAnalyzer, _SOURCE_GROUPING_MODE
import uvicorn
import os
import logging

logger = logging.getLogger(__name__)


# CORS Setup - use environment variable or default to localhost
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8008").split(",")


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    logger.info("Source grouping mode: %s", _SOURCE_GROUPING_MODE)
    logger.info("Allowed CORS origins: %s", ",".join(allowed_origins))
    yield




app = FastAPI(title="Email Analysis API", lifespan=lifespan)

# Middleware para request_id
class RequestIDMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            headers = dict(scope.get("headers") or [])
            # Busca request_id no header ou gera um novo
            req_id = None
            for k, v in headers.items():
                if k == b"x-request-id":
                    req_id = v.decode()
                    break
            if not req_id:
                req_id = str(uuid.uuid4())
            scope["request_id"] = req_id
        await self.app(scope, receive, send)

app.add_middleware(RequestIDMiddleware)

# Readiness endpoint
@app.get("/ready", response_model=ReadyResponse)
async def ready() -> ReadyResponse:
    # In a real scenario, add checks for DB, cache, etc.
    return ReadyResponse(status="ready", source_grouping_mode=_SOURCE_GROUPING_MODE)



def _error_payload(exc: Exception, request: Request = None) -> tuple[int, dict]:
    message = str(exc).lower()

    auth_markers = (
        "auth",
        "authentication",
        "invalid credentials",
        "login",
        "username and password",
    )
    infra_markers = (
        "timed out",
        "timeout",
        "temporary failure",
        "network",
        "name or service not known",
        "nodename nor servname",
        "unreachable",
        "connection refused",
    )

    # request_id propagation
    request_id = None
    if request is not None:
        request_id = getattr(request, "request_id", None)
        if not request_id:
            # Tenta pegar do escopo
            request_id = request.scope.get("request_id")

    payload = {}
    if any(marker in message for marker in auth_markers):
        payload = {
            "detail": "Falha de autenticação IMAP. Verifique e-mail e senha de app.",
            "error_code": "IMAP_AUTH_FAILED",
        }
        if request_id:
            payload["request_id"] = request_id
        return 401, payload
    if any(marker in message for marker in infra_markers):
        payload = {
            "detail": "Servidor IMAP indisponível no momento. Tente novamente em instantes.",
            "error_code": "IMAP_UNAVAILABLE",
        }
        if request_id:
            payload["request_id"] = request_id
        return 503, payload

    payload = {
        "detail": "Falha ao processar a operação IMAP. Revise host, credenciais e permissões da conta.",
        "error_code": "IMAP_OPERATION_FAILED",
    }
    if request_id:
        payload["request_id"] = request_id
    return 400, payload

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def healthcheck() -> HealthResponse:
    return HealthResponse(status="ok", source_grouping_mode=_SOURCE_GROUPING_MODE)

from fastapi import Request as FastAPIRequest

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_inbox(credentials: IMAPCredentials, request: FastAPIRequest):
    try:
        analyzer = EmailAnalyzer(credentials)
        result = analyzer.analyze()
        return result
    except Exception as e:
        logger.exception("Error analyzing inbox")
        status_code, payload = _error_payload(e, request)
        return JSONResponse(status_code=status_code, content=payload)

@app.post("/delete")
async def delete_emails(request: DeleteRequest, req: FastAPIRequest):
    try:
        analyzer = EmailAnalyzer(request.credentials)
        result = analyzer.delete_emails(request.sender_emails)
        return result
    except Exception as e:
        logger.exception("Error deleting emails")
        status_code, payload = _error_payload(e, req)
        return JSONResponse(status_code=status_code, content=payload)

@app.post("/archive")
async def archive_emails(request: DeleteRequest, req: FastAPIRequest):
    try:
        analyzer = EmailAnalyzer(request.credentials)
        result = analyzer.archive_emails(request.sender_emails)
        return result
    except Exception as e:
        logger.exception("Error archiving emails")
        status_code, payload = _error_payload(e, req)
        return JSONResponse(status_code=status_code, content=payload)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
