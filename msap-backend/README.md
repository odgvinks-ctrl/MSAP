# MSAP Backend

API REST du projet MSAP.

## Technologies
- Python 3.12
- FastAPI
- Uvicorn
- Pydantic Settings
- Pytest
- HTTPX

## Installation
Créer un environnement virtuel :
python -m venv .venv

Installer les dépendances :
python -m pip install -r requirements.txt

## Lancement
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

## Documentation API
http://127.0.0.1:8000/docs

## Tests
python -m pytest -v
