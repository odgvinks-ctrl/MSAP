from fastapi import APIRouter, Depends
from typing import Annotated
from app.api.dependencies.auth import get_current_agent
from app.models.agent import Agent

# Router pour l’authentification
router = APIRouter(prefix="/auth", tags=["Authentification"])

@router.get("/me")
def get_current_user(agent: Annotated[Agent, Depends(get_current_agent)]):
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

# Router pour les agents
agents_router = APIRouter(prefix="/agents", tags=["Agents"])

@agents_router.get("/")
def list_agents():
    return {"agents": ["agent1", "agent2"]}

@agents_router.get("/{agent_id}")
def get_agent(agent_id: int):
    return {"agent_id": agent_id, "name": f"Agent {agent_id}"}
