from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import Field

from app.schemas.common import Schema


class AuditEventRead(Schema):
    id: UUID
    date: datetime
    auteur_id: UUID | None
    action: str
    cible_id: str | None
    resultat: str
    details: dict[str, Any] = Field(default_factory=dict)
    ip: str | None