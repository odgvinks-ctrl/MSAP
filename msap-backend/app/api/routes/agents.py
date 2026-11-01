from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime
import secrets
import uuid

from app.schemas.agent import AgentCreate, AgentRead, AgentUpdate, AgentCreatedResponse
from app.models.agent_model import Agent
from app.models.audit_event import AuditEvent
from app.core.database import get_db

router = APIRouter(prefix="/agents", tags=["agents"])

# Enrôlement d’un agent
@router.post("/enrole", response_model=AgentCreatedResponse)
def enrole_agent(agent_data: AgentCreate, request: Request, db: Session = Depends(get_db)):
    if agent_data.role in ["super_admin", "admin_ministeriel"]:
        raise HTTPException(status_code=403, detail="Rôle réservé au super administrateur")

    new_agent = Agent(
        matricule=agent_data.matricule,
        prenom=agent_data.prenom,
        nom=agent_data.nom,
        email=agent_data.email,
        telephone=agent_data.telephone,
        fonction=agent_data.fonction,
        ministere_id=agent_data.ministere_id,
        direction_id=agent_data.direction_id,
        role=agent_data.role,
        statut="en_attente",
        enrole_le=datetime.utcnow(),
    )
    db.add(new_agent)
    db.commit()
    db.refresh(new_agent)

    code_activation = secrets.token_hex(4)
    expire_dans_heures = 72

    audit = AuditEvent(
        auteur_id=None,  # à remplacer par l’admin connecté
        action="Enrôlement agent",
        cible_id=str(new_agent.id),
        resultat="succès",
        details={"email": new_agent.email, "role": new_agent.role},
        ip=request.client.host,
    )
    db.add(audit)
    db.commit()

    return AgentCreatedResponse(
        agent=new_agent,
        code_activation=code_activation,
        expire_dans_heures=expire_dans_heures,
    )

# Mise à jour d’un agent
@router.patch("/{agent_id}", response_model=AgentRead)
def update_agent(agent_id: str, update_data: AgentUpdate, request: Request, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent introuvable")

    if update_data.fonction:
        agent.fonction = update_data.fonction
    if update_data.telephone:
        agent.telephone = update_data.telephone
    if update_data.direction_id:
        agent.direction_id = update_data.direction_id
    if update_data.role:
        if update_data.role in ["super_admin", "admin_ministeriel"]:
            raise HTTPException(status_code=403, detail="Rôle réservé au super administrateur")
        agent.role = update_data.role

    db.commit()
    db.refresh(agent)

    audit = AuditEvent(
        auteur_id=None,
        action="Mise à jour agent",
        cible_id=str(agent.id),
        resultat="succès",
        details={"email": agent.email},
        ip=request.client.host,
    )
    db.add(audit)
    db.commit()

    return agent

# Suspension d’un agent
@router.post("/{agent_id}/suspend", response_model=AgentRead)
def suspend_agent(agent_id: str, request: Request, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent introuvable")

    agent.statut = "suspendu"
    db.commit()
    db.refresh(agent)

    audit = AuditEvent(
        auteur_id=None,
        action="Suspension agent",
        cible_id=str(agent.id),
        resultat="succès",
        details={"email": agent.email},
        ip=request.client.host,
    )
    db.add(audit)
    db.commit()

    return agent

# Révocation d’un agent
@router.post("/{agent_id}/revoque", response_model=AgentRead)
def revoke_agent(agent_id: str, request: Request, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent introuvable")

    agent.statut = "revoque"
    db.commit()
    db.refresh(agent)

    audit = AuditEvent(
        auteur_id=None,
        action="Révocation agent",
        cible_id=str(agent.id),
        resultat="succès",
        details={"email": agent.email},
        ip=request.client.host,
    )
    db.add(audit)
    db.commit()

    return agent
