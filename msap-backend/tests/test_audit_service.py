from unittest.mock import MagicMock
from uuid import uuid4

import pytest

from app.services.audit import AuditService


def test_enregistrer_ajoute_un_evenement():
    db = MagicMock()
    auteur_id = uuid4()

    evenement = AuditService.enregistrer(
        db,
        action="CONSULTATION_AGENT",
        resultat="SUCCES",
        auteur_id=auteur_id,
        cible_id="agent-test",
        details={"module": "administration"},
        ip="127.0.0.1",
    )

    db.add.assert_called_once_with(evenement)
    assert evenement.auteur_id == auteur_id
    assert evenement.action == "CONSULTATION_AGENT"
    assert evenement.resultat == "SUCCES"
    assert evenement.cible_id == "agent-test"
    assert evenement.details == {"module": "administration"}
    assert evenement.ip == "127.0.0.1"


def test_secrets_exclus_des_details():
    db = MagicMock()

    evenement = AuditService.enregistrer(
        db,
        action="TEST_SECURITE",
        resultat="SUCCES",
        details={
            "module": "auth",
            "password": "secret-test",
            "access_token": "token-test",
            "nested": {
                "client_secret": "secret-client",
                "information": "conservee",
            },
        },
    )

    assert evenement.details == {
        "module": "auth",
        "nested": {"information": "conservee"},
    }


def test_auteur_et_ip_peuvent_etre_absents():
    db = MagicMock()

    evenement = AuditService.enregistrer(
        db,
        action="EVENEMENT_SYSTEME",
        resultat="SUCCES",
    )

    assert evenement.auteur_id is None
    assert evenement.ip is None


def test_adresse_ip_invalide_refusee():
    db = MagicMock()

    with pytest.raises(ValueError, match="Adresse IP invalide"):
        AuditService.enregistrer(
            db,
            action="TEST",
            resultat="SUCCES",
            ip="adresse-invalide",
        )

    db.add.assert_not_called()


def test_action_trop_longue_refusee():
    db = MagicMock()

    with pytest.raises(ValueError):
        AuditService.enregistrer(
            db,
            action="A" * 101,
            resultat="SUCCES",
        )

    db.add.assert_not_called()


def test_resultat_trop_long_refuse():
    db = MagicMock()

    with pytest.raises(ValueError):
        AuditService.enregistrer(
            db,
            action="TEST",
            resultat="R" * 31,
        )

    db.add.assert_not_called()


def test_service_ne_valide_pas_la_transaction():
    db = MagicMock()

    AuditService.enregistrer(
        db,
        action="TEST_TRANSACTION",
        resultat="SUCCES",
    )

    db.commit.assert_not_called()
    db.flush.assert_not_called()


def test_enregistrer_independant_valide_sa_transaction(monkeypatch):
    db = MagicMock()
    monkeypatch.setattr("app.services.audit.SessionLocal", lambda: db)

    resultat = AuditService.enregistrer_independant(
        action="CONSULTATION_AGENT",
        resultat="succes",
    )

    assert resultat is True
    db.add.assert_called_once()
    db.commit.assert_called_once()
    db.rollback.assert_not_called()
    db.close.assert_called_once()


def test_enregistrer_independant_annule_si_commit_echoue(monkeypatch):
    db = MagicMock()
    db.commit.side_effect = RuntimeError("Erreur de base de donnees")
    monkeypatch.setattr("app.services.audit.SessionLocal", lambda: db)

    resultat = AuditService.enregistrer_independant(
        action="CONSULTATION_AGENT",
        resultat="succes",
    )

    assert resultat is False
    db.rollback.assert_called_once()
    db.close.assert_called_once()


def test_enregistrer_independant_ne_propage_pas_erreur_de_session(monkeypatch):
    db = MagicMock()
    db.add.side_effect = RuntimeError("Erreur d'enregistrement")
    monkeypatch.setattr("app.services.audit.SessionLocal", lambda: db)

    resultat = AuditService.enregistrer_independant(
        action="CONSULTATION_AGENT",
        resultat="succes",
    )

    assert resultat is False
    db.rollback.assert_called_once()
    db.close.assert_called_once()
