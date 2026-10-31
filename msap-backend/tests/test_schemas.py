import pytest
from pydantic import ValidationError

from app.schemas import (
    AgentCreate,
    AgentUpdate,
    ClassificationUpdate,
    RevocationRead,
    VerificationRequest,
)


def donnees_agent_valides():
    return {
        "matricule": "MSAP-001",
        "prenom": "Aminata",
        "nom": "Sawadogo",
        "email": "aminata@example.org",
        "telephone": "+22670000000",
        "fonction": "Administratrice",
        "role": "admin_ministeriel",
    }


def test_agent_create_accepte_donnees_valides():
    agent = AgentCreate(**donnees_agent_valides())

    assert agent.matricule == "MSAP-001"
    assert agent.role == "admin_ministeriel"


def test_agent_create_refuse_email_invalide():
    donnees = donnees_agent_valides()
    donnees["email"] = "adresse-invalide"

    with pytest.raises(ValidationError):
        AgentCreate(**donnees)


def test_agent_create_refuse_role_inconnu():
    donnees = donnees_agent_valides()
    donnees["role"] = "super_utilisateur"

    with pytest.raises(ValidationError):
        AgentCreate(**donnees)


def test_agent_update_accepte_modification_partielle():
    modification = AgentUpdate(fonction="Directeur informatique")

    assert modification.fonction == "Directeur informatique"
    assert modification.role is None


def test_agent_update_refuse_champ_inconnu():
    with pytest.raises(ValidationError):
        AgentUpdate(nom="Nouveau nom")


def test_verification_accepte_code_a_six_chiffres():
    verification = VerificationRequest(
        jeton_temporaire="jeton-temporaire-test",
        code="123456",
    )

    assert verification.code == "123456"


@pytest.mark.parametrize("code", ["12345", "1234567", "abcdef", "12 456"])
def test_verification_refuse_code_invalide(code):
    with pytest.raises(ValidationError):
        VerificationRequest(
            jeton_temporaire="jeton-temporaire-test",
            code=code,
        )


def test_classification_refuse_duree_negative():
    with pytest.raises(ValidationError):
        ClassificationUpdate(duree_minutes=-1)


def test_revocation_utilise_compteurs_par_defaut():
    revocation = RevocationRead(
        id="00000000-0000-0000-0000-000000000001",
        agent_id="00000000-0000-0000-0000-000000000002",
        auteur_id=None,
        date="2026-10-31T10:00:00Z",
        motif="Fin des fonctions",
    )

    assert revocation.appareils == 0
    assert revocation.salons == 0
    assert revocation.etapes == []