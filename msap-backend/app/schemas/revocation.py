from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.schemas.common import Schema


class RevocationStep(Schema):
    cle: str
    ok: bool
    detail: str | None = None


class RevocationRead(Schema):
    id: UUID
    agent_id: UUID
    auteur_id: UUID | None
    date: datetime
    motif: str
    appareils: int = Field(default=0, ge=0)
    salons: int = Field(default=0, ge=0)
    etapes: list[RevocationStep] = Field(default_factory=list)