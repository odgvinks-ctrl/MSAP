from uuid import UUID

from pydantic import Field

from app.schemas.common import Schema


class DirectionSummary(Schema):
    id: UUID
    nom: str
    sigle: str


class MinistereRead(Schema):
    id: UUID
    nom: str
    sigle: str
    responsable_id: UUID | None
    directions: list[DirectionSummary] = Field(default_factory=list)