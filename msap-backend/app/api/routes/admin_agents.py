from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_agent
from app.core.database import get_db
from app.models.agent import Agent
from app.schemas.agent import AgentRead

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


@router.get("", response_model=list[AgentRead])
def lister_agents(
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
    return db.scalars(requete).all()


@router.get("/{agent_id}", response_model=AgentRead)
def consulter_agent(
    agent_id: UUID,
    administrateur: Annotated[Agent, Depends(exiger_super_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    agent = db.get(Agent, agent_id)

    if agent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent introuvable.",
        )

    return agent
