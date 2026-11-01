from ipaddress import ip_address
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_agent
from app.core.database import get_db
from app.models.agent import Agent
from app.schemas.agent import AgentRead
from app.services.audit import AuditService

router = APIRouter(prefix="/admin/agents", tags=["Administration - Agents"])


def exiger_super_admin(
    agent: Annotated[Agent, Depends(get_current_agent)],
) -> Agent:
    if agent.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé au super administrateur.",
        )
    return agent


def obtenir_ip_client(request: Request) -> str | None:
    """Retourne une IP valide sans faire confiance aux en-têtes proxy."""
    if request.client is None:
        return None

    try:
        return str(ip_address(request.client.host))
    except ValueError:
        return None


@router.get("", response_model=list[AgentRead])
def lister_agents(
    request: Request,
    administrateur: Annotated[Agent, Depends(exiger_super_admin)],
    db: Annotated[Session, Depends(get_db)],
    limite: int = Query(default=50, ge=1, le=100),
    decalage: int = Query(default=0, ge=0),
):
    requete = (
        select(Agent)
        .order_by(Agent.enrole_le.desc())
        .offset(decalage)
        .limit(limite)
    )
    agents = db.scalars(requete).all()

    AuditService.enregistrer_independant(
        action="consultation_liste_agents",
        resultat="succes",
        auteur_id=administrateur.id,
        details={"limite": limite, "decalage": decalage},
        ip=obtenir_ip_client(request),
    )

    return agents


@router.get("/{agent_id}", response_model=AgentRead)
def consulter_agent(
    agent_id: UUID,
    request: Request,
    administrateur: Annotated[Agent, Depends(exiger_super_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    agent = db.get(Agent, agent_id)

    if agent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent introuvable.",
        )

    AuditService.enregistrer_independant(
        action="consultation_agent",
        resultat="succes",
        auteur_id=administrateur.id,
        cible_id=str(agent_id),
        ip=obtenir_ip_client(request),
    )

    return agent
