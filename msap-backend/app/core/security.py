import jwt
from jwt import PyJWKClient
from jwt.exceptions import PyJWKClientError, PyJWTError
from fastapi import HTTPException, status

from app.core.config import settings


_jwks_client = PyJWKClient(
    settings.keycloak_jwks_url,
    cache_jwk_set=True,
    lifespan=300,
)


def verify_access_token(token: str) -> dict:
    """
    Vérifie un access token Keycloak signé en RS256.
    Retourne les claims si le jeton est valide.
    """
    try:
        signing_key = _jwks_client.get_signing_key_from_jwt(token)

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=settings.keycloak_audience,
            issuer=settings.keycloak_issuer,
            options={
                "require": ["exp", "iat", "sub", "iss", "aud"],
            },
        )

        return payload

    except (PyJWTError, PyJWKClientError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Jeton d'accès invalide ou expiré.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
