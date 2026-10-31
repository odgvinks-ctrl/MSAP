from pydantic import Field

from app.schemas.common import Schema


class LoginRequest(Schema):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=1, max_length=256)


class TemporaryTokenResponse(Schema):
    jeton_temporaire: str


class VerificationRequest(Schema):
    jeton_temporaire: str = Field(min_length=1)
    code: str = Field(pattern=r"^\d{6}$")


class AccessTokenResponse(Schema):
    access_token: str
    token_type: str = "bearer"