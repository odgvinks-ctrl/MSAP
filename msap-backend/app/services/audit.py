import logging
from collections.abc import Mapping
from ipaddress import ip_address
from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.audit_event import AuditEvent


logger = logging.getLogger(__name__)

_SENSITIVE_KEYS = {
    "password",
    "mot_de_passe",
    "token",
    "access_token",
    "refresh_token",
    "secret",
    "client_secret",
    "authorization",
    "credentials",
    "otp",
}


def _sanitize_details(value: Any) -> Any:
    """Retire récursivement les champs sensibles des détails d'audit."""
    if isinstance(value, Mapping):
        return {
            str(key): _sanitize_details(item)
            for key, item in value.items()
            if str(key).lower() not in _SENSITIVE_KEYS
        }

    if isinstance(value, (list, tuple)):
        return [_sanitize_details(item) for item in value]

    if value is None or isinstance(value, (str, int, float, bool)):
        return value

    return str(value)[:500]


class AuditService:
    """Service d'enregistrement des événements d'audit MSAP."""

    @staticmethod
    def enregistrer(
        db: Session,
        *,
        action: str,
        resultat: str,
        auteur_id: UUID | None = None,
        cible_id: str | None = None,
        details: Mapping[str, Any] | None = None,
        ip: str | None = None,
    ) -> AuditEvent:
        if not action or len(action) > 100:
            raise ValueError("L'action doit contenir entre 1 et 100 caractères.")

        if not resultat or len(resultat) > 30:
            raise ValueError("Le résultat doit contenir entre 1 et 30 caractères.")

        if cible_id is not None and len(cible_id) > 100:
            raise ValueError("L'identifiant de la cible dépasse 100 caractères.")

        if ip is not None:
            try:
                ip = str(ip_address(ip))
            except ValueError as exc:
                raise ValueError("Adresse IP invalide.") from exc

        evenement = AuditEvent(
            auteur_id=auteur_id,
            action=action,
            cible_id=cible_id,
            resultat=resultat,
            details=_sanitize_details(details or {}),
            ip=ip,
        )

        db.add(evenement)
        return evenement

    @staticmethod
    def enregistrer_independant(
        *,
        action: str,
        resultat: str,
        auteur_id: UUID | None = None,
        cible_id: str | None = None,
        details: Mapping[str, Any] | None = None,
        ip: str | None = None,
    ) -> bool:
        """Enregistre et valide un événement dans sa propre transaction."""
        db = SessionLocal()

        try:
            AuditService.enregistrer(
                db,
                action=action,
                resultat=resultat,
                auteur_id=auteur_id,
                cible_id=cible_id,
                details=details,
                ip=ip,
            )
            db.commit()
            return True

        except Exception:
            db.rollback()
            logger.exception("Échec de l'enregistrement d'un événement d'audit.")
            return False

        finally:
            db.close()
