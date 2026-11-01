import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.api.dependencies.auth import get_current_agent
from app.core.database import get_db
from app.main import app


client = TestClient(app)


@pytest.fixture
def administrateur():
    return SimpleNamespace(
        id=uuid.uuid4(),
        role="super_admin",
        statut="actif",
    )


@pytest.fixture
def agent_ordinaire():
    return SimpleNamespace(
        id=uuid.uuid4(),
        role="agent",
        statut="actif",
    )


@pytest.fixture
def db_mock():
    db = MagicMock()
    app.dependency_overrides[get_db] = lambda: db
    yield db
    app.dependency_overrides.pop(get_db, None)


def test_lister_agents_accepte_super_admin(administrateur, db_mock):
    db_mock.scalars.return_value.all.return_value = []

    app.dependency_overrides[get_current_agent] = lambda: administrateur

    try:
        response = client.get("/admin/agents")

        assert response.status_code == 200
        assert response.json() == []
    finally:
        app.dependency_overrides.pop(get_current_agent, None)


def test_lister_agents_refuse_agent_ordinaire(agent_ordinaire):
    app.dependency_overrides[get_current_agent] = lambda: agent_ordinaire

    try:
        response = client.get("/admin/agents")

        assert response.status_code == 403
    finally:
        app.dependency_overrides.pop(get_current_agent, None)


def test_consulter_agent_absent_retourne_404(administrateur, db_mock):
    db_mock.get.return_value = None
    app.dependency_overrides[get_current_agent] = lambda: administrateur

    try:
        response = client.get(f"/admin/agents/{uuid.uuid4()}")

        assert response.status_code == 404
    finally:
        app.dependency_overrides.pop(get_current_agent, None)


def test_lister_agents_applique_pagination(administrateur, db_mock):
    db_mock.scalars.return_value.all.return_value = []
    app.dependency_overrides[get_current_agent] = lambda: administrateur

    try:
        response = client.get("/admin/agents?limite=10&decalage=5")

        assert response.status_code == 200
        statement = db_mock.scalars.call_args.args[0]
        assert statement is not None
    finally:
        app.dependency_overrides.pop(get_current_agent, None)


def test_lister_agents_refuse_limite_superieure_a_100(administrateur):
    app.dependency_overrides[get_current_agent] = lambda: administrateur

    try:
        response = client.get("/admin/agents?limite=101")

        assert response.status_code == 422
    finally:
        app.dependency_overrides.pop(get_current_agent, None)
