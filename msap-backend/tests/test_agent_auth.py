from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException

from app.api.dependencies.auth import get_current_agent


def make_agent(statut):
    return SimpleNamespace(
        keycloak_user_id="test-keycloak-user",
        statut=statut,
    )


def make_db(agent):
    db = MagicMock()
    db.scalar.return_value = agent
    return db


def test_active_agent_is_authorized():
    agent = make_agent("actif")

    result = get_current_agent(
        payload={"sub": "test-keycloak-user"},
        db=make_db(agent),
    )

    assert result is agent


@pytest.mark.parametrize(
    "statut",
    ["en_attente", "suspendu", "revoque"],
)
def test_inactive_agent_is_rejected(statut):
    agent = make_agent(statut)

    with pytest.raises(HTTPException) as exc_info:
        get_current_agent(
            payload={"sub": "test-keycloak-user"},
            db=make_db(agent),
        )

    assert exc_info.value.status_code == 403


def test_unknown_agent_is_rejected():
    with pytest.raises(HTTPException) as exc_info:
        get_current_agent(
            payload={"sub": "unknown-user"},
            db=make_db(None),
        )

    assert exc_info.value.status_code == 403
