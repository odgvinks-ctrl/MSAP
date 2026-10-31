import uuid
from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Uuid

from app.core.database import Base


class Classification(Base):
    __tablename__ = "classifications"

    __table_args__ = (
        CheckConstraint("duree_minutes >= 0", name="ck_classification_duree_positive"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    niveau: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    duree_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    transfert_interdit: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    copie_interdite: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    accuse_lecture: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    filigrane: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    modifie_le: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    modifie_par_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("agents.id"), nullable=True
    )
