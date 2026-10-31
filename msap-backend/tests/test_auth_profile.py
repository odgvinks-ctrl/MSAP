import uuid
from types import SimpleNamespace
from unittest.mock import MagicMock

from fastapi.testclient import TestClient

from app.api.dependencies.auth import get_current_agent
from app.main import app


client = TestClient(app)


def test_auth_me_returns_database_agent_profile():
    agent = SimpleNamespace(
        id=uuid.uuid4(),
        matricule="MSAP-TEST-001",
        prenom="Dieudonné",
        nom="Test",
        email="agent.test@example.com",
        fonction="Agent de démonstration",
        role="agent",
        statut="actif",
        ministere_id=None,
        direction_id=None,
    )

    app.dependency_overrides[get_current_agent] = lambda: agent

    try:
        response = client.get("/auth/me")

        assert response.status_code == 200

        data = response.json()
        assert data["matricule"] == "MSAP-TEST-001"
        assert data["prenom"] == "Dieudonné"
        assert data["nom"] == "Test"
        assert data["role"] == "agent"
        assert data["statut"] == "actif"
        assert data["ministere_id"] is None
        assert data["direction_id"] is None

    finally:
        app.dependency_overrides.clear()
