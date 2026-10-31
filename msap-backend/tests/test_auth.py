from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_remains_public():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_auth_me_rejects_missing_token():
    response = client.get("/auth/me")

    assert response.status_code == 401
    assert response.json()["detail"] == "Authentification requise."


def test_auth_me_rejects_malformed_token():
    response = client.get(
        "/auth/me",
        headers={"Authorization": "Bearer faux-jeton-invalide"},
    )

    assert response.status_code == 401
