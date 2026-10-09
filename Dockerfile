# Multi-stage Dockerfile for CareLens Backend & Eval Suite
# Target Platforms: Render / Railway / Local Docker

FROM python:3.11-slim AS base

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONUTF8=1 \
    PORT=8000 \
    DEMO_MODE=true

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application and evaluation source code
COPY . /app

# Create non-root user for security best practices
RUN adduser --disabled-password --gecos "" carelensuser && \
    chown -R carelensuser:carelensuser /app
USER carelensuser

# Expose API port
EXPOSE 8000

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Launch production Uvicorn server
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
