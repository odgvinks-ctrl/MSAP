import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Uuid

from app.core.database import Base


class Ministere(Base):
    __tablename__ = "ministeres"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    nom: Mapped[str] = mapped_column(String(160), nullable=False)
    sigle: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    responsable_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid,
        ForeignKey("agents.id", use_alter=True, name="fk_ministeres_responsable_agents"),
        nullable=True,
    )
    cree_le: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
