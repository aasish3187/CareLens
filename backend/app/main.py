import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from backend.app.core.config import settings
from backend.app.database import init_db
from backend.app.api.router import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("carelens")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for database initialization."""
    logger.info("Starting CareLens Backend Engine...")
    default_patient = init_db()
    logger.info(f"Database initialized. Seeded default patient: {default_patient.display_name} ({default_patient.abha_number})")
    yield
    logger.info("CareLens Backend Engine shut down cleanly.")

app = FastAPI(
    title="CareLens — AI-Powered Personal Health Copilot",
    description=(
        "Enterprise Health Copilot API for Altrix Labs Challenge. "
        "Provides Multimodal VLM Extraction, Evidence-Grounded Summaries, "
        "Interactive 3D Anatomical Organ Twin status, Polypharmacy Collision Detection, "
        "and ABDM NRCeS FHIR R4 Bundle Export with Mock ABHA Digital Health Card."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# GZip Compression for ultra-fast asset & API loading
app.add_middleware(GZipMiddleware, minimum_size=500)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routes under /api
app.include_router(api_router, prefix="/api")

from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse

# Mount built React/Vite UI at /app and /assets with full SPA fallback
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
assets_dir = FRONTEND_DIST / "assets"
if assets_dir.exists():
    app.mount("/app/assets", StaticFiles(directory=str(assets_dir)), name="app_assets")
    app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

@app.get("/")
async def root():
    if FRONTEND_DIST.exists():
        return FileResponse(FRONTEND_DIST / "index.html")
    return {
        "app": "CareLens",
        "description": "Evidence-First Personal Health Copilot",
        "version": "1.0.0",
        "documentation": "/docs",
        "health_check": "/api/health"
    }

@app.get("/app")
@app.get("/app/")
async def serve_app_root():
    if FRONTEND_DIST.exists():
        return FileResponse(FRONTEND_DIST / "index.html")
    return {"message": "Frontend not built. Run 'npm run build' in frontend/."}

@app.get("/app/{full_path:path}")
async def serve_app_spa(full_path: str):
    if not FRONTEND_DIST.exists():
        return RedirectResponse(url="/docs")
    target = FRONTEND_DIST / full_path
    if target.is_file():
        return FileResponse(target)
    return FileResponse(FRONTEND_DIST / "index.html")

@app.get("/{full_path:path}")
async def serve_spa_fallback(full_path: str):
    # Exclude system/API routes from SPA fallback
    if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path.startswith("openapi.json"):
        raise HTTPException(status_code=404, detail="Not Found")
    if not FRONTEND_DIST.exists():
        return RedirectResponse(url="/docs")
    target = FRONTEND_DIST / full_path
    if target.is_file():
        return FileResponse(target)
    return FileResponse(FRONTEND_DIST / "index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
