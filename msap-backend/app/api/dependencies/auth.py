from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_access_token
from app.models.agent import Agent


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_token_payload(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
) -> dict:
    """
    Extrait et vérifie le Bearer token Keycloak.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentification requise.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return verify_access_token(credentials.credentials)


def get_current_agent(
    payload: Annotated[dict, Depends(get_current_token_payload)],
    db: Annotated[Session, Depends(get_db)],
) -> Agent:
    """
    Vérifie que l'identité Keycloak correspond à un agent MSAP actif.
    """
    keycloak_user_id = payload["sub"]

    statement = select(Agent).where(
        Agent.keycloak_user_id == keycloak_user_id
    )

    agent = db.scalar(statement)

    if agent is None or agent.statut != "actif":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès refusé : agent MSAP absent ou inactif.",
        )

    return agent
