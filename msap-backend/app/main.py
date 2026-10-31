from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="API de gestion et d'administration de la plateforme MSAP.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(api_router)


@app.get("/", tags=["Accueil"])
def root():
    return {
        "message": "Bienvenue sur l'API MSAP",
        "documentation": "/docs",
        "version": settings.app_version,
    }
