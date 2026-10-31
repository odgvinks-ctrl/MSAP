from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "MSAP API"
    app_version: str = "0.1.0"
    environment: str = "development"
    cors_origins_raw: str = "http://localhost:5173"

    db_name: str = "msap_db"
    db_user: str = "msap_user"
    db_password: str
    db_host: str = "localhost"
    db_port: int = 5433

    # Keycloak / OpenID Connect
    keycloak_issuer: str = "http://localhost:8080/realms/MSAP"
    keycloak_audience: str = "msap-api"
    keycloak_jwks_url: str = "http://localhost:8080/realms/MSAP/protocol/openid-connect/certs"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="MSAP_",
        extra="ignore",
    )

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_origins_raw.split(",")
            if origin.strip()
        ]


settings = Settings()
