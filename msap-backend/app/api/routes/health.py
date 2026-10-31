from fastapi import APIRouter

router = APIRouter(tags=["Santé"])


@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "msap-backend",
        "version": "0.1.0",
    }
