from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import Field

from app.schemas.common import Schema


AgentRole = Literal[
    "super_admin",
    "admin_ministeriel",
    "responsable_groupe",
    "agent",
]

AgentStatus = Literal[
    "actif",
    "en_attente",
    "suspendu",
    "revoque",
]


class AgentCreate(Schema):
    matricule: str = Field(min_length=1, max_length=60)
    prenom: str = Field(min_length=1, max_length=100)
    nom: str = Field(min_length=1, max_length=100)
    email: str = Field(
        min_length=5,
        max_length=255,
        pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$",
    )
    telephone: str | None = Field(default=None, max_length=30)
    fonction: str = Field(min_length=1, max_length=150)
    ministere_id: UUID | None = None
    direction_id: UUID | None = None
    role: AgentRole


class AgentUpdate(Schema):
    fonction: str | None = Field(default=None, min_length=1, max_length=150)
    direction_id: UUID | None = None
    role: AgentRole | None = None
    telephone: str | None = Field(default=None, max_length=30)


class AgentRead(Schema):
    id: UUID
    matricule: str
    prenom: str
    nom: str
    email: str
    telephone: str | None
    fonction: str
    ministere_id: UUID | None
    direction_id: UUID | None
    role: AgentRole
    statut: AgentStatus
    enrole_le: datetime
    derniere_connexion: datetime | None
    appareils: int = Field(default=0, ge=0)
    salons: int = Field(default=0, ge=0)


class AgentCreatedResponse(Schema):
    agent: AgentRead
    code_activation: str
    expire_dans_heures: int = Field(ge=1)