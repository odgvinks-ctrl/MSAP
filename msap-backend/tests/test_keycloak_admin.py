import httpx
import pytest

from app.services.keycloak_admin import (
    KeycloakAdminError,
    KeycloakAdminService,
)


def mock_token():
    return httpx.Response(
        200,
        json={"access_token": "fake-test-token"},
        request=httpx.Request("POST", "http://test/token"),
    )


def test_create_user_success(monkeypatch):
    service = KeycloakAdminService()

    calls = {}

    def fake_post(*args, **kwargs):
        return mock_token()

    def fake_request(method, url, **kwargs):
        calls["method"] = method
        calls["url"] = url
        calls["headers"] = kwargs["headers"]
        calls["json"] = kwargs["json"]

        return httpx.Response(
            201,
            headers={"Location": "http://localhost:8080/admin/realms/MSAP/users/test-user-id"},
            request=httpx.Request(method, url),
        )

    monkeypatch.setattr("app.services.keycloak_admin.httpx.post", fake_post)
    monkeypatch.setattr("app.services.keycloak_admin.httpx.request", fake_request)

    user_id = service.create_user(
        username="test.agent",
        email="test.agent@example.test",
        first_name="Test",
        last_name="Agent",
    )

    assert user_id == "test-user-id"
    assert calls["method"] == "POST"
    assert calls["url"].endswith("/users")
    assert calls["headers"]["Authorization"] == "Bearer fake-test-token"
    assert calls["json"]["username"] == "test.agent"
    assert calls["json"]["requiredActions"] == [
        "UPDATE_PASSWORD",
        "CONFIGURE_TOTP",
    ]


def test_delete_user_success(monkeypatch):
    service = KeycloakAdminService()
    calls = {}

    monkeypatch.setattr(
        "app.services.keycloak_admin.httpx.post",
        lambda *args, **kwargs: mock_token(),
    )

    def fake_request(method, url, **kwargs):
        calls["method"] = method
        calls["url"] = url

        return httpx.Response(
            204,
            request=httpx.Request(method, url),
        )

    monkeypatch.setattr("app.services.keycloak_admin.httpx.request", fake_request)

    service.delete_user("test-user-id")

    assert calls["method"] == "DELETE"
    assert calls["url"].endswith("/users/test-user-id")


def test_token_failure_is_sanitized(monkeypatch):
    service = KeycloakAdminService()

    def fake_post(*args, **kwargs):
        request = httpx.Request("POST", "http://test/token")
        return httpx.Response(401, request=request)

    monkeypatch.setattr("app.services.keycloak_admin.httpx.post", fake_post)

    with pytest.raises(KeycloakAdminError) as exc_info:
        service.delete_user("test-user-id")

    assert str(exc_info.value) == (
        "Impossible d'obtenir un jeton auprès de Keycloak."
    )


def test_keycloak_403_is_sanitized(monkeypatch):
    service = KeycloakAdminService()

    monkeypatch.setattr(
        "app.services.keycloak_admin.httpx.post",
        lambda *args, **kwargs: mock_token(),
    )

    def fake_request(method, url, **kwargs):
        return httpx.Response(
            403,
            request=httpx.Request(method, url),
        )

    monkeypatch.setattr("app.services.keycloak_admin.httpx.request", fake_request)

    with pytest.raises(KeycloakAdminError) as exc_info:
        service.delete_user("test-user-id")

    assert str(exc_info.value) == (
        "Keycloak a refusé l'opération (HTTP 403)."
    )
