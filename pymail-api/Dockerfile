# syntax=docker/dockerfile:1

# --- builder: install dependencies into an isolated virtualenv ---
# All runtime deps ship manylinux wheels (pydantic-core, etc.), so no compiler
# toolchain is needed — the old build-essential/pandas/numpy step is gone.
FROM python:3.10-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"

WORKDIR /app

RUN python -m venv /opt/venv

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# --- runtime: slim image with just the venv and the app code ---
FROM python:3.10-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# Run as an unprivileged user.
RUN useradd --create-home --uid 1000 appuser

COPY --from=builder /opt/venv /opt/venv
COPY . /app/
RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

# Single worker on purpose: the on-disk reputation cache is process-local
# (see services/domain_reputation.py). Scaling out needs a shared cache first.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
