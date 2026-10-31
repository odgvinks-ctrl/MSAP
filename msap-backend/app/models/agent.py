import uuid
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import Uuid

from app.core.database import Base


class Agent(Base):
    __tablename__ = "agents"

    __table_args__ = (
        CheckConstraint(
            "role IN ('super_admin', 'admin_ministeriel', 'responsable_groupe', 'agent')",
            name="ck_agents_role",
        ),
        CheckConstraint(
            "statut IN ('actif', 'en_attente', 'suspendu', 'revoque')",
            name="ck_agents_statut",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    matricule: Mapped[str] = mapped_column(String(60), unique=True, nullable=False)
    prenom: Mapped[str] = mapped_column(String(100), nullable=False)
    nom: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    telephone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    fonction: Mapped[str] = mapped_column(String(150), nullable=False)

    ministere_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("ministeres.id"), nullable=True, index=True
    )
    direction_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("directions.id"), nullable=True, index=True
    )

    role: Mapped[str] = mapped_column(String(40), nullable=False)
    statut: Mapped[str] = mapped_column(String(30), nullable=False, default="en_attente")

    # Identifiants externes : aucun mot de passe local
    keycloak_user_id: Mapped[str | None] = mapped_column(
        String(100), unique=True, nullable=True
    )
    matrix_user_id: Mapped[str | None] = mapped_column(
        String(255), unique=True, nullable=True
    )

    enrole_le: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    derniere_connexion: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
