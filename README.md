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

| Bloc | Rôle | Technologie |
| --- | --- | --- |
| Messagerie des agents | Conversations, groupes, messages classifiés, fichiers, centre de sécurité | React + Vite (dossier `msap-frontend/`), chiffrement via matrix-js-sdk ; Element Web configuré en client de secours (dossier `element/`) |
| Serveur de messagerie | Stocke et relaie les événements chiffrés, ne voit jamais le contenu | Synapse (Matrix) + PostgreSQL |
| Identité | Comptes, mot de passe, second facteur TOTP, rôles | Keycloak, relié à Synapse en SSO OIDC |
| API d'administration | Enrôlement, révocation, audit, règles de classification | Node.js / Express |
| Portail d'administration | Interface des administrateurs | Même application React (dossier `msap-frontend/`) |

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
| Node.js | MIT | https://nodejs.org |
| Express | MIT | https://expressjs.com |
| React | MIT | https://react.dev |
| React Router | MIT | https://reactrouter.com |
| Vite | MIT | https://vite.dev |
| Lucide React | ISC | https://lucide.dev |
| Recharts | MIT | https://recharts.org |
| Inter, JetBrains Mono | OFL-1.1 | https://fontsource.org |

Le code de MSAP est publié sous licence **AGPL-3.0** (fichier `LICENSE`), compatible avec Element Web et Synapse.

**Niveau d'engagement : Étendre et adapter.** MSAP s'appuie sur Element Web, Synapse et Keycloak sans modifier leur cœur. Nous ajoutons la configuration souveraine, l'API d'administration, le portail et la classification des messages.

## Installation

Prérequis : Docker et Docker Compose, Node.js 20 ou plus.

```bash
git clone https://github.com/odgvinks-ctrl/MSAP.git
cd MSAP
docker compose up -d
```

Cette commande lance Synapse, PostgreSQL, Keycloak, Element Web et l'API d'administration. Le nom de domaine du serveur se règle dans `element/config.json` (`msap.local` par défaut) et dans le fichier `.env` de l'API.

Frontend (messagerie des agents et portail d'administration) :

```bash
cd msap-frontend
npm install
npm run dev
```

Sans fichier `.env`, le frontend démarre en **mode démonstration** avec des données fictives. Pour le relier à l'API, créer `msap-frontend/.env` avec `VITE_API_URL=http://localhost:8000`.

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

- Le serveur ne lit pas les messages, mais il voit des métadonnées : qui échange avec qui, dans quel salon, à quelle heure, et les adresses IP. Nous les réduisons en désactivant la fédération, en limitant la durée de conservation des journaux et en n'affichant dans le portail que des volumes agrégés.
- Les restrictions des messages classifiés (transfert, copie) sont appliquées par les applications MSAP et le serveur. Elles ne peuvent pas empêcher la photo d'un écran prise avec un autre appareil.
- La révocation coupe l'accès aux **nouveaux** messages. Les messages déjà déchiffrés sur un appareil perdu restent lisibles tant que cet appareil n'est pas effacé ou reconnecté au réseau.
- En mode démonstration, le frontend simule l'API : données dans le `localStorage`, jeton de session dans le `sessionStorage` de l'onglet. Le chiffrement de bout en bout réel n'est actif qu'une fois la messagerie branchée sur Synapse via matrix-js-sdk. En production, un cookie `HttpOnly` posé par l'API serait plus sûr.
- Interface en français. Le mooré et le dioula sont sélectionnables, mais seuls quelques libellés sont traduits ; la suite sera faite et relue avec des locuteurs natifs.
