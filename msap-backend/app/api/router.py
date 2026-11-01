from fastapi import APIRouter
from app.api.routes.health import router as health_router
from app.api.routes.auth import router as auth_router, agents_router
from app.api.routes.admin_agents import router as admin_agents_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(admin_agents_router)
api_router.include_router(agents_router)
