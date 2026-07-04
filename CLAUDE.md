# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

PyMail Analyser is a two-app monorepo that connects to a mailbox over IMAP, scores "low-quality" senders (high volume + low open rate), and lets the user bulk archive/delete or unsubscribe. No database — everything is computed in-memory per request and credentials are never persisted.

- `pymail-api/` — FastAPI backend (IMAP fetch + heuristic scoring + optional domain reputation).
- `pymail-webapp/` — Next.js 16 (App Router) frontend, React 19, Tailwind v4, Shadcn/UI, React Query.

## Commands

Run everything from the repo root via the Makefile:

```bash
make test            # backend + frontend unit tests
make test-backend    # cd pymail-api && python -m pytest -q
make test-frontend   # cd pymail-webapp && npm run test:run  (vitest)
make test-e2e        # cd pymail-webapp && npm run test:e2e   (Playwright, mocked API)
```

Single test:

```bash
cd pymail-api && python -m pytest tests/test_analyzer.py::test_name -q
cd pymail-webapp && npx vitest run utils/__tests__/senderSelection.test.ts
```

Dev servers (Docker is the intended full-stack path — `docker-compose up --build`):

```bash
cd pymail-api  && uvicorn main:app --reload --port 8000   # or: python main.py
cd pymail-webapp && npm run dev                            # http://localhost:3000
cd pymail-webapp && npm run lint                           # eslint
cd pymail-webapp && npm run build
```

First E2E run needs `npx playwright install chromium`. CI (`.github/workflows/ci.yml`) runs backend pytest (Python 3.10), frontend vitest, and Playwright E2E on push/PR to `master`.

## Backend architecture

The whole pipeline lives in [pymail-api/services/analyzer.py](pymail-api/services/analyzer.py) inside `EmailAnalyzer.analyze()`. Understand these stages in order:

1. **Single IMAP pass** — one `MailBox` connection, `headers_only=True`, `mark_seen=False` (analysis must never mark mail as read). Messages are grouped in a dict keyed by `source_key`.
2. **`source_key` grouping** (`normalize_source`) — senders are collapsed to a provider/tenant identity (e.g. `newsletter@mail.google.com` → `google`) using a `tldextract` PSL extractor. The `NORMALIZE_SOURCE_INCLUDE_PRIVATE_DOMAINS` env var flips granularity between `provider` (default) and `tenant`; the active mode is exposed as `_SOURCE_GROUPING_MODE` and returned in `/health`, `/ready`, and every `AnalysisResponse`. This grouping is the core domain concept — a "sender" in the UI is a `source_key` group, not a single address, and `sender_emails` carries every real address in the group.
3. **Unsubscribe detection** — prefers the `List-Unsubscribe` header; groups without one get a best-effort body scan (`_extract_unsubscribe_from_body`) of their most recent message, capped by `MAX_BODY_SCAN_TARGETS` (default 30, highest-volume senders first). The body scan happens *inside* the IMAP connection and must never raise.
4. **Domain reputation** — after the IMAP connection closes, DNS (MX/SPF/DMARC via `dnspython`) and optional VirusTotal lookups run in a shared `ThreadPoolExecutor`; results feed [domain_reputation.py](pymail-api/services/domain_reputation.py), which has a disk-backed, thread-safe cache flushed once at the end.
5. **Scoring** — `spam_score = email_count * (1 - open_rate) * 10`. `_compute_rank_and_risk` multiplies that into a `rank_score` (sort key, higher = worse) and a `spam_risk` label (`high|medium|low`) using official-domain / suspicious-TLD lists, unsubscribe ratio, DNS trust, and VT flags. `health_score = 100 - total_spam_score/5` (clamped 0–100).

`delete_emails` / `archive_emails` re-open IMAP, resolve a real Trash/Archive folder from provider-specific candidate lists (`_resolve_folder`), and move UIDs there. `_collect_uids` uses a server-side `OR(FROM …)` search for small sender sets but **always re-checks the from-address in Python** because IMAP FROM is a substring match (false positives).

### Endpoints ([pymail-api/main.py](pymail-api/main.py))
- `POST /analyze` — synchronous `AnalysisResponse`.
- `POST /analyze/stream` — **the path the frontend actually uses.** Streams NDJSON: `{"type":"progress","phase":"imap_fetch|unsub_scan|dns_lookup",...}` lines then a final `{"type":"done","result":...}` or `{"type":"error",...}`. Progress is emitted from a worker thread via `run_coroutine_threadsafe` onto an asyncio queue.
- `POST /count`, `POST /delete`, `POST /archive`, `GET /health`, `GET /ready`.
- All errors funnel through `_error_payload`, which pattern-matches the exception message to an `error_code` (`IMAP_AUTH_FAILED`, `IMAP_UNAVAILABLE`, etc.) and propagates the `x-request-id` header. **Note:** user-facing `detail` strings here are in Portuguese.

## Frontend architecture

Entry is [app/page.tsx](pymail-webapp/app/page.tsx), a three-state machine driven by hooks: `LoginScreen` → `LoadingScreen` → `Dashboard`. State is composed from three hooks in [app/hooks/](pymail-webapp/app/hooks/):
- `useAnalyze` — POSTs to `/analyze/stream`, manually parses the NDJSON reader, and maps the three backend phases onto one weighted progress bar (fetch 60% / unsub 15% / DNS 25%) with ETA estimation.
- `useAction` — confirm/execute flow for bulk archive/delete + unsubscribe.
- `useSenderSelection` — selection tracked by `source_key` (see `getSenderKey` in [utils/senderSelection.ts](pymail-webapp/utils/senderSelection.ts)), which falls back to `sender_email` when no `source_key`.

Sorting/grouping is client-side and pure — [utils/senderSorting.ts](pymail-webapp/utils/senderSorting.ts). Provider host inference for the login form is in [utils/emailProviders.ts](pymail-webapp/utils/emailProviders.ts).

### Frontend conventions
- Path alias `@/*` → `pymail-webapp/*` (tsconfig + vitest). API types live in [types/api.ts](pymail-webapp/types/api.ts) and must stay in sync with `models/schemas.py`.
- Directory split to respect: reusable Shadcn primitives + providers are in top-level `components/` and `lib/`; feature components and hooks are under `app/`.
- `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`) points the client at the backend.

## Conventions & gotchas
- The codebase mixes English and Portuguese in comments and user-facing strings — match the surrounding file rather than normalizing.
- Backend has no linter/formatter config; keep the existing style (module-level `frozenset` lookup tables, heavy docstrings explaining perf choices).
- Backend env vars: `ALLOWED_ORIGINS`, `VIRUSTOTAL_API_KEY` (absent → VT disabled, app still works), `NORMALIZE_SOURCE_INCLUDE_PRIVATE_DOMAINS`, `MAX_BODY_SCAN_TARGETS`, `DOMAIN_REPUTATION_CACHE_FILE`, `DOMAIN_REPUTATION_{DNS,VT}_TTL_SECONDS`. See [pymail-api/.env.example](pymail-api/.env.example).
- Full architecture docs (auto-generated + hand-written) live under [docs/](docs/).
