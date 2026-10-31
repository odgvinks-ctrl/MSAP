from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.schemas.common import Schema


class ClassificationRead(Schema):
    id: UUID
    niveau: str
    duree_minutes: int
    transfert_interdit: bool
    copie_interdite: bool
    accuse_lecture: bool
    filigrane: bool
    modifie_le: datetime
    modifie_par_id: UUID | None


class ClassificationUpdate(Schema):
    duree_minutes: int | None = Field(default=None, ge=0)
    transfert_interdit: bool | None = None
    copie_interdite: bool | None = None
    accuse_lecture: bool | None = None
    filigrane: bool | None = None