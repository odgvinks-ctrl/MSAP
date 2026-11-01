from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.audit_model import Audit
from app.schemas.audit import AuditRead
from app.database import get_db

router = APIRouter(prefix="/audit", tags=["audit"])

# Consulter toutes les entrées du journal
@router.get("/", response_model=list[AuditRead])
def list_audit(db: Session = Depends(get_db)):
    audits = db.query(Audit).order_by(Audit.date_action.desc()).all()
    return audits

# Consulter une entrée spécifique
@router.get("/{audit_id}", response_model=AuditRead)
def get_audit(audit_id: str, db: Session = Depends(get_db)):
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Entrée d’audit introuvable")
    return audit

# Ajouter une entrée manuellement (utile pour tests ou actions spéciales)
@router.post("/", response_model=AuditRead)
def create_audit(action: str, motif: str, auteur_id: str | None = None, db: Session = Depends(get_db)):
    new_audit = Audit(
        auteur_id=auteur_id,
        action=action,
        date_action=datetime.utcnow(),
        motif=motif,
    )
    db.add(new_audit)
    db.commit()
    db.refresh(new_audit)
    return new_audit
