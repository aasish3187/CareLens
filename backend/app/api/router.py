from fastapi import APIRouter
from backend.app.api.health import router as health_router
from backend.app.api.documents import router as documents_router
from backend.app.api.patients import router as patients_router
from backend.app.api.abha import router as abha_router
from backend.app.api.fhir import router as fhir_router
from backend.app.api.extractions import router as extractions_router
from backend.app.api.eval import router as eval_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(documents_router)
api_router.include_router(patients_router)
api_router.include_router(abha_router)
api_router.include_router(fhir_router)
api_router.include_router(extractions_router)
api_router.include_router(eval_router)

