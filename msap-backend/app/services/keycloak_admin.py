from typing import Any

import httpx

from app.core.config import settings


class KeycloakAdminError(Exception):
    """Erreur contrôlée lors d'une opération d'administration Keycloak."""


class KeycloakAdminService:
    def __init__(self, timeout: float = 10.0) -> None:
        self.timeout = timeout
        self.base_url = settings.keycloak_admin_base_url.rstrip("/")
        self.token_url = (
            f"{settings.keycloak_issuer.rstrip('/')}"
            "/protocol/openid-connect/token"
        )

    def _get_access_token(self) -> str:
        try:
            response = httpx.post(
                self.token_url,
                data={
                    "grant_type": "client_credentials",
                    "client_id": settings.keycloak_admin_client_id,
                    "client_secret": settings.keycloak_admin_client_secret,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=self.timeout,
            )
            response.raise_for_status()
            token = response.json().get("access_token")

            if not isinstance(token, str) or not token:
                raise KeycloakAdminError(
                    "Keycloak n'a pas fourni de jeton d'administration valide."
                )

            return token

        except KeycloakAdminError:
            raise
        except (httpx.HTTPError, ValueError, TypeError):
            raise KeycloakAdminError(
                "Impossible d'obtenir un jeton auprès de Keycloak."
            ) from None

    def _request(
        self,
        method: str,
        path: str,
        **kwargs: Any,
    ) -> httpx.Response:
        token = self._get_access_token()

        try:
            headers = {
                **kwargs.pop("headers", {}),
                "Authorization": f"Bearer {token}",
            }
            response = httpx.request(
                method,
                f"{self.base_url}/{path.lstrip('/')}",
                headers=headers,
                timeout=self.timeout,
                **kwargs,
            )
            response.raise_for_status()
            return response

        except httpx.HTTPStatusError as exc:
            status_code = exc.response.status_code
            raise KeycloakAdminError(
                f"Keycloak a refusé l'opération (HTTP {status_code})."
            ) from None
        except httpx.HTTPError:
            raise KeycloakAdminError(
                "La communication avec Keycloak a échoué."
            ) from None

    def create_user(
        self,
        *,
        username: str,
        email: str,
        first_name: str,
        last_name: str,
    ) -> str:
        response = self._request(
            "POST",
            "/users",
            json={
                "username": username,
                "email": email,
                "firstName": first_name,
                "lastName": last_name,
                "enabled": True,
                "emailVerified": False,
                "requiredActions": ["UPDATE_PASSWORD", "CONFIGURE_TOTP"],
            },
        )

        location = response.headers.get("Location", "")
        user_id = location.rstrip("/").split("/")[-1]

        if not user_id:
            raise KeycloakAdminError(
                "Keycloak n'a pas retourné l'identifiant du nouvel utilisateur."
            )

        return user_id

    def delete_user(self, user_id: str) -> None:
        self._request("DELETE", f"/users/{user_id}")


keycloak_admin = KeycloakAdminService()
