from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "MSAP API"
    app_version: str = "0.1.0"
    environment: str = "development"
    cors_origins_raw: str = "http://localhost:5173"

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
