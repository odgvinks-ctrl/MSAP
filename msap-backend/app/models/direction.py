import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Uuid

from app.core.database import Base


class Direction(Base):
    __tablename__ = "directions"

    __table_args__ = (
        UniqueConstraint("ministere_id", "sigle", name="uq_direction_ministere_sigle"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    nom: Mapped[str] = mapped_column(String(160), nullable=False)
    sigle: Mapped[str] = mapped_column(String(30), nullable=False)
    ministere_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("ministeres.id"), nullable=False, index=True
    )
    cree_le: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
