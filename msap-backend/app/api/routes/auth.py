from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies.auth import get_current_agent
from app.models.agent import Agent


router = APIRouter(prefix="/auth", tags=["Authentification"])


@router.get("/me")
def get_current_user(
    agent: Annotated[Agent, Depends(get_current_agent)],
):
    return {
        "id": str(agent.id),
        "matricule": agent.matricule,
        "prenom": agent.prenom,
        "nom": agent.nom,
        "email": agent.email,
        "fonction": agent.fonction,
        "role": agent.role,
        "statut": agent.statut,
        "ministere_id": str(agent.ministere_id) if agent.ministere_id else None,
        "direction_id": str(agent.direction_id) if agent.direction_id else None,
    }
