# MSAP · Messagerie Souveraine de l'Administration Publique

> La communication institutionnelle, en toute confiance.

Projet présenté au sprint technique pré-hackathon du **Hackathon 226 – Édition 2026** (MTDPCE – DGTD), challenge « La messagerie souveraine de l'administration ».

## Concept

Les agents publics échangent chaque jour des informations de service sur des messageries grand public dont les serveurs échappent à l'État. MSAP leur offre une messagerie instantanée aussi simple qu'une application du marché, mais :

- **chiffrée de bout en bout** : le serveur relaie les messages et les fichiers sans pouvoir les lire ;
- **hébergée par l'État** : tout s'installe sur une infrastructure maîtrisée, sans service tiers ;
- **réservée aux agents enrôlés** : aucune inscription libre, second facteur obligatoire ;
- **pilotée par l'administration** : un portail permet d'enrôler un agent, de **révoquer ses accès en quelques secondes** (départ, perte du téléphone) et de suivre chaque opération dans un journal d'audit.

**Innovation mise en avant : la classification des messages.** Chaque message porte un niveau (Standard, Diffusion restreinte, Confidentiel) avec ses règles : expiration automatique, transfert interdit, copie interdite, accusé de lecture obligatoire, filigrane nominatif. Les règles sont définies par les administrateurs dans le portail.

## Architecture

| Bloc | Rôle | Technologie | État au rendu |
| --- | --- | --- | --- |
| Messagerie des agents | Conversations, groupes, messages classifiés, fichiers, centre de sécurité | React + Vite (`msap-frontend/`) ; Element Web configuré en client de secours (`element/config.json`) | Fonctionnelle en mode démonstration |
| Portail d'administration | Enrôlement, révocation, audit, règles de classification | Même application React (`msap-frontend/`) | Fonctionnel en mode démonstration |
| API d'administration | Seule à détenir les accès d'administration de Keycloak et Synapse | Python, FastAPI, SQLAlchemy, Alembic (`msap-backend/`) | Socle livré : configuration, modèles de données, migrations, schémas validés, route `/health`, tests ; routes métier en cours |
| Serveur de messagerie | Stocke et relaie les événements chiffrés, ne voit jamais le contenu | Synapse (Matrix) + PostgreSQL | Architecture cible, non déployée dans ce dépôt |
| Identité | Comptes, mot de passe, second facteur TOTP, rôles | Keycloak, relié à Synapse en SSO OIDC | Architecture cible, non déployée dans ce dépôt |

Le **mode démonstration** du frontend simule l'API (`msap-frontend/src/api/base.js`) avec exactement les routes, les rôles et les contrôles d'accès prévus pour l'API réelle. Il permet au jury de tester tout le parcours sans serveur.

Le frontend ne parle qu'à l'API (routes `/auth`, `/agents`, `/messagerie`…). Le portail ne parle qu'à l'API d'administration. L'API est la seule à détenir les accès d'administration de Keycloak et de Synapse.

**Révocation immédiate.** Un seul appel du portail déclenche, côté serveur : désactivation du compte Keycloak, fermeture des sessions et jetons, suppression des appareils Matrix, retrait de tous les salons (les clés de groupe Megolm sont alors renouvelées, l'agent ne peut plus lire les nouveaux messages), puis blocage du compte Matrix. Chaque révocation est consignée avec son auteur et son motif.

**Protocole de chiffrement.** Matrix Olm/Megolm, implémenté par la bibliothèque vodozemac (utilisée par Element et par matrix-js-sdk). L'équipe n'a développé aucune cryptographie.

## Technologies et licences

| Composant | Licence | Projet |
| --- | --- | --- |
| Element Web | AGPL-3.0 | https://github.com/element-hq/element-web |
| matrix-js-sdk | Apache-2.0 | https://github.com/matrix-org/matrix-js-sdk |
| Synapse | AGPL-3.0 | https://github.com/element-hq/synapse |
| vodozemac (Olm/Megolm) | Apache-2.0 | https://github.com/matrix-org/vodozemac |
| Keycloak | Apache-2.0 | https://www.keycloak.org |
| PostgreSQL | PostgreSQL License | https://www.postgresql.org |
| Docker Compose | Apache-2.0 | https://github.com/docker/compose |
| Python | PSF License | https://www.python.org |
| FastAPI | MIT | https://fastapi.tiangolo.com |
| Uvicorn | BSD-3-Clause | https://www.uvicorn.org |
| SQLAlchemy, Alembic | MIT | https://www.sqlalchemy.org |
| Pydantic | MIT | https://docs.pydantic.dev |
| psycopg | LGPL-3.0 | https://www.psycopg.org |
| PyJWT | MIT | https://github.com/jpadilla/pyjwt |
| pytest, HTTPX | MIT, BSD-3-Clause | https://pytest.org |
| Node.js | MIT | https://nodejs.org |
| React | MIT | https://react.dev |
| React Router | MIT | https://reactrouter.com |
| Vite | MIT | https://vite.dev |
| Vitest | MIT | https://vitest.dev |
| Testing Library | MIT | https://testing-library.com |
| jsdom | MIT | https://github.com/jsdom/jsdom |
| Lucide React | ISC | https://lucide.dev |
| Recharts | MIT | https://recharts.org |
| Inter, JetBrains Mono | OFL-1.1 | https://fontsource.org |

Le code de MSAP est publié sous licence **AGPL-3.0** (fichier `LICENSE`), compatible avec Element Web et Synapse.

**Niveau d'engagement : Étendre et adapter.** MSAP s'appuie sur Element Web, Synapse et Keycloak sans modifier leur cœur. Nous ajoutons la configuration souveraine, l'API d'administration, le portail et la classification des messages.

## Installation

### 1. Messagerie et portail (parcours à tester)

Prérequis : Node.js 20 ou plus.

```bash
git clone https://github.com/odgvinks-ctrl/MSAP.git
cd MSAP/msap-frontend
npm install
npm run dev
```

Ouvrir http://localhost:5173 et se connecter avec un compte de démonstration ci-dessous. Sans fichier `.env`, le frontend démarre en mode démonstration.

Tests automatisés de sécurité (27 tests, Vitest) : `npm test`. Ils vérifient le refus des intrus, des comptes révoqués ou suspendus et des mauvais mots de passe, le second facteur obligatoire, le refus des requêtes sans jeton ou avec un jeton inventé, l'interdiction du portail aux agents, la limitation d'un administrateur ministériel à son ministère, la fermeture immédiate de la session d'un agent révoqué et la journalisation des refus et des révocations.

### 2. API d'administration (socle)

Prérequis : Python 3.12, Docker.

```bash
cd MSAP/msap-backend
cp .env.example .env
docker compose up -d
python -m venv .venv
source .venv/bin/activate        # Windows : .venv\Scripts\activate
python -m pip install -r requirements.txt
python -m alembic upgrade head
python -m uvicorn app.main:app --reload --port 8000
python -m pytest -v
```

`docker compose` lance PostgreSQL, Alembic crée les tables (ministères, directions, agents, classifications, révocations, journal d'audit). La documentation de l'API est servie sur http://localhost:8000/docs. Les 14 tests de l'API (pytest) vérifient la route de santé et la validation des données entrantes.

## Comptes de démonstration fictifs

Mot de passe `msap2026`, code de second facteur `123456` en mode démonstration.

| Compte | Adresse | Comportement attendu |
| --- | --- | --- |
| Super administrateur | i.sawadogo@mtd.msap.demo | Accès complet au portail |
| Administratrice ministérielle | f.sankara@men.msap.demo | Limitée au ministère de l'Éducation |
| Agente | a.ouedraogo@mtd.msap.demo | Messagerie, refusée sur le portail |
| Agent à révoquer | h.diallo@mfp.msap.demo | Messagerie, déconnecté en direct quand on le révoque |
| Compte révoqué | a.barry@mae.msap.demo | Refusé partout |
| Intrus non enrôlé | invite.externe@gmail.com | Refusé et journalisé |

Toutes les données sont fictives. Aucune donnée ni aucun compte réel n'est utilisé.

## Limites connues

La note de sécurité complète (menaces, protections, limites) est dans [`SECURITE.md`](SECURITE.md).

- Le serveur ne lit pas les messages, mais il voit des métadonnées : qui échange avec qui, dans quel salon, à quelle heure, et les adresses IP. Nous les réduisons en désactivant la fédération, en limitant la durée de conservation des journaux et en n'affichant dans le portail que des volumes agrégés.
- Les restrictions des messages classifiés (transfert, copie) sont appliquées par les applications MSAP et le serveur. Elles ne peuvent pas empêcher la photo d'un écran prise avec un autre appareil.
- La révocation coupe l'accès aux **nouveaux** messages. Les messages déjà déchiffrés sur un appareil perdu restent lisibles tant que cet appareil n'est pas effacé ou reconnecté au réseau.
- Synapse et Keycloak ne sont pas encore déployés dans ce dépôt, et les routes métier de l'API FastAPI sont en cours. Le parcours complet est démontré par le mode démonstration du frontend.
- En mode démonstration, le frontend simule l'API : données dans le `localStorage`, jeton de session dans le `sessionStorage` de l'onglet. Le chiffrement de bout en bout réel n'est actif qu'une fois la messagerie branchée sur Synapse via matrix-js-sdk. En production, un cookie `HttpOnly` posé par l'API serait plus sûr.
- Interface en français. Le mooré et le dioula sont sélectionnables, mais seuls quelques libellés sont traduits ; la suite sera faite et relue avec des locuteurs natifs.
