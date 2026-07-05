import asyncio
import json
import logging
import logging.config
import os
import uuid
from contextlib import asynccontextmanager
from contextvars import ContextVar
from datetime import date, timedelta
from typing import AsyncGenerator, AsyncIterator, Optional

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from imap_tools import A, MailBox
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from models.schemas import (
    AnalysisResponse,
    DeleteRequest,
    HealthResponse,
    IMAPCredentials,
    ReadyResponse,
)
from services.analyzer import _SOURCE_GROUPING_MODE, EmailAnalyzer
from services.net_guard import HostNotAllowedError, validate_imap_host

logger = logging.getLogger(__name__)

# Rate limiter keyed by client IP; applied to the IMAP-proxy endpoints below.
limiter = Limiter(key_func=get_remote_address)

# Current request id, set by RequestIDMiddleware and injected into every log line
# so structured logs can be correlated per request (see _configure_logging).
request_id_ctx: ContextVar[str] = ContextVar("request_id", default="-")


class RequestIdLogFilter(logging.Filter):
    """Attach the active request_id (from the contextvar) to each log record."""

    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_ctx.get()
        return True


def _configure_logging() -> None:
    """Configure root logging with a request-id-aware formatter.

    Idempotent; called on app startup. Level is controlled by LOG_LEVEL (INFO).
    """
    level = os.getenv("LOG_LEVEL", "INFO").upper()
    logging.config.dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "filters": {"request_id": {"()": RequestIdLogFilter}},
            "formatters": {
                "default": {
                    "format": (
                        "%(asctime)s %(levelname)s [%(request_id)s] "
                        "%(name)s: %(message)s"
                    )
                }
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": "default",
                    "filters": ["request_id"],
                }
            },
            "root": {"level": level, "handlers": ["console"]},
        }
    )


# CORS Setup - use environment variable or default to localhost
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8008"
).split(",")


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    _configure_logging()
    logger.info("Source grouping mode: %s", _SOURCE_GROUPING_MODE)
    logger.info("Allowed CORS origins: %s", ",".join(allowed_origins))
    yield


app = FastAPI(title="Email Analysis API", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


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
            token = request_id_ctx.set(req_id)
            try:
                await self.app(scope, receive, send)
            finally:
                request_id_ctx.reset(token)
            return
        await self.app(scope, receive, send)


app.add_middleware(RequestIDMiddleware)


# Readiness endpoint
@app.get("/ready", response_model=ReadyResponse)
async def ready() -> ReadyResponse:
    # In a real scenario, add checks for DB, cache, etc.
    return ReadyResponse(
        status="ready",
        source_grouping_mode=_SOURCE_GROUPING_MODE,
        virustotal_enabled=bool(os.environ.get("VIRUSTOTAL_API_KEY", "").strip()),
    )


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
    if isinstance(exc, UnicodeEncodeError):
        payload = {
            "detail": "Senha IMAP contém caracteres não suportados pelo cliente. Use uma senha de app ASCII.",
            "error_code": "IMAP_PASSWORD_ENCODING_FAILED",
        }
        if request_id:
            payload["request_id"] = request_id
        return 400, payload

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


def _reject_disallowed_host(host: str, request: Request) -> Optional[JSONResponse]:
    """Return a 400 JSONResponse if *host* is not a public IMAP host, else None.

    Guards the IMAP-proxy endpoints against SSRF (see services/net_guard.py).
    """
    try:
        validate_imap_host(host)
        return None
    except HostNotAllowedError:
        request_id = request.scope.get("request_id")
        payload = {
            "detail": "IMAP host is not allowed. Use a public IMAP server hostname.",
            "error_code": "IMAP_HOST_NOT_ALLOWED",
        }
        if request_id:
            payload["request_id"] = request_id
        return JSONResponse(status_code=400, content=payload)


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "x-request-id"],
)


@app.get("/health", response_model=HealthResponse)
async def healthcheck() -> HealthResponse:
    return HealthResponse(status="ok", source_grouping_mode=_SOURCE_GROUPING_MODE)


@app.post("/count")
@limiter.limit("5/minute")
def count_emails(credentials: IMAPCredentials, request: Request):
    """Retorna a contagem total de emails no período especificado sem processá-los."""
    guard = _reject_disallowed_host(credentials.host, request)
    if guard is not None:
        return guard
    try:
        # Build IMAP date criteria (same logic as analyze)
        if credentials.start_date and credentials.end_date:
            criteria = A(date_gte=credentials.start_date, date_lt=credentials.end_date)
        else:
            days = credentials.days_limit if credentials.days_limit else 30
            criteria = A(date_gte=date.today() - timedelta(days=days))

        with MailBox(credentials.host).login(
            credentials.email, credentials.password.get_secret_value()
        ) as mailbox:
            mailbox.folder.set("INBOX")
            # Fetch UIDs only (fastest way to count)
            uids = mailbox.uids(criteria)
            total = len(uids)

        return {"total": total}
    except Exception as e:
        logger.exception("Error counting emails")
        status_code, payload = _error_payload(e, request)
        return JSONResponse(status_code=status_code, content=payload)


@app.post("/analyze", response_model=AnalysisResponse)
@limiter.limit("5/minute")
def analyze_inbox(credentials: IMAPCredentials, request: Request):
    guard = _reject_disallowed_host(credentials.host, request)
    if guard is not None:
        return guard
    try:
        analyzer = EmailAnalyzer(credentials)
        result = analyzer.analyze()
        return result
    except Exception as e:
        logger.exception("Error analyzing inbox")
        status_code, payload = _error_payload(e, request)
        return JSONResponse(status_code=status_code, content=payload)


@app.post("/analyze/stream")
@limiter.limit("5/minute")
async def analyze_stream(credentials: IMAPCredentials, request: Request):
    """Stream NDJSON progress events then the final AnalysisResponse.

    Each line is a JSON object terminated with a newline character:
      {"type":"progress","phase":"imap_fetch","fetched":N}
      {"type":"progress","phase":"dns_lookup","checked":K,"total":T}
      {"type":"done","result":{...AnalysisResponse...}}
      {"type":"error","status_code":N,"payload":{...}}
    """
    guard = _reject_disallowed_host(credentials.host, request)
    if guard is not None:
        return guard

    from fastapi.responses import StreamingResponse as _StreamingResponse

    loop = asyncio.get_running_loop()
    queue: asyncio.Queue[dict] = asyncio.Queue()

    def _progress(event: dict) -> None:
        # Called from worker thread — schedule onto the event loop safely.
        asyncio.run_coroutine_threadsafe(queue.put(event), loop)

    analyzer = EmailAnalyzer(credentials)

    async def _generate() -> AsyncGenerator[str, None]:
        async def _run() -> None:
            try:
                result = await loop.run_in_executor(
                    None, lambda: analyzer.analyze(progress=_progress)
                )
                await queue.put({"type": "done", "result": result.model_dump()})
            except Exception as exc:
                logger.exception("Error in /analyze/stream")
                status_code, payload = _error_payload(exc, request)
                await queue.put(
                    {"type": "error", "status_code": status_code, "payload": payload}
                )

        task = asyncio.create_task(_run())
        try:
            while True:
                event = await queue.get()
                yield json.dumps(event, ensure_ascii=False) + "\n"
                if event.get("type") in ("done", "error"):
                    break
        finally:
            if not task.done():
                task.cancel()

    return _StreamingResponse(
        _generate(),
        media_type="application/x-ndjson",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/delete")
@limiter.limit("5/minute")
def delete_emails(body: DeleteRequest, request: Request):
    guard = _reject_disallowed_host(body.credentials.host, request)
    if guard is not None:
        return guard
    try:
        analyzer = EmailAnalyzer(body.credentials)
        result = analyzer.delete_emails(body.sender_emails)
        return result
    except Exception as e:
        logger.exception("Error deleting emails")
        status_code, payload = _error_payload(e, request)
        return JSONResponse(status_code=status_code, content=payload)


@app.post("/archive")
@limiter.limit("5/minute")
def archive_emails(body: DeleteRequest, request: Request):
    guard = _reject_disallowed_host(body.credentials.host, request)
    if guard is not None:
        return guard
    try:
        analyzer = EmailAnalyzer(body.credentials)
        result = analyzer.archive_emails(body.sender_emails)
        return result
    except Exception as e:
        logger.exception("Error archiving emails")
        status_code, payload = _error_payload(e, request)
        return JSONResponse(status_code=status_code, content=payload)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
