"""
main.py — FastAPI application entry point.
Configures the app, registers middleware, and includes all routers.
"""

import logging
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import HOST, PORT, MAX_FILE_SIZE_MB
from app.routers import convert

# ── Logging setup ─────────────────────────────────────────────────────────────
# Logs filenames and sizes only — never file content — for privacy.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="SecureConvert Backend",
    description="Local-only file conversion API. All processing happens on this machine.",
    version="1.0.0",
    # Disable docs in production builds — uncomment the lines below when packaging
    # docs_url=None,
    # redoc_url=None,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Only allow requests from the local Tauri frontend.
# The wildcard is safe here because the server is bound to 127.0.0.1 only.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Safe because it's bound to 127.0.0.1 locally
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ── Global error handler ──────────────────────────────────────────────────────
@app.exception_handler(RuntimeError)
async def runtime_error_handler(request: Request, exc: RuntimeError):
    logger.error("Conversion error on %s: %s", request.url.path, exc)
    return JSONResponse(status_code=500, content={"detail": str(exc)})

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(status_code=400, content={"detail": str(exc)})

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(convert.router)

# ── Health check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Simple health check endpoint.
    The Tauri frontend calls this on startup to confirm the sidecar is ready.
    """
    return {
        "status": "ok",
        "max_file_size_mb": MAX_FILE_SIZE_MB,
    }

# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    logger.info("Starting SecureConvert backend on %s:%d", HOST, PORT)
    uvicorn.run(
        app,
        host=HOST,
        port=PORT,
        reload=False,   # Never enable reload in the sidecar (production)
        log_level="info",
    )
