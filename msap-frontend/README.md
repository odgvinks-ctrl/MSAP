# MSAP · Frontend

Frontend de MSAP (Messagerie Souveraine de l'Administration Publique). Une seule application React contient deux espaces :

- **la messagerie des agents** (`/messages`, `/groupes`, `/annuaire`, `/fichiers`, `/enregistres`, `/securite`, `/parametres`) : conversations, groupes institutionnels, messages classifiés (Standard, Diffusion restreinte, Confidentiel), pièces jointes, messages vocaux, centre de sécurité avec bouton d'urgence ;
- **le portail d'administration** (`/`, `/agents`, `/enrolement`, `/revocations`, `/classifications`, `/ministeres`, `/roles`, `/audit`) : réservé aux rôles `super_admin` et `admin_ministeriel`.

Après la connexion, un agent arrive sur `/messages`, un administrateur sur `/`. Un administrateur passe d'un espace à l'autre par le menu. Element Web, habillé par `../element/config.json`, reste disponible comme client Matrix de secours.

## Lancer le projet

```bash
npm install
npm run dev
```

Sans fichier `.env`, le portail fonctionne en **mode démonstration** : les données viennent de `src/api/base.js` et sont gardées dans le navigateur. Pour le brancher sur l'API d'administration, créer `.env` :

```bash
VITE_API_URL=http://localhost:8000
```

## Comptes de démonstration (fictifs)

Mot de passe `msap2026`, code de second facteur `123456`.

| Compte | Adresse | Résultat |
| --- | --- | --- |
| Super administrateur | i.sawadogo@mtd.msap.demo | accès complet |
| Administratrice ministérielle | f.sankara@men.msap.demo | limitée au MEN |
| Agente | a.ouedraogo@mtd.msap.demo | messagerie, refusée sur le portail |
| Agent à révoquer | h.diallo@mfp.msap.demo | messagerie, sert à montrer la révocation en direct |
| Compte révoqué | a.barry@mae.msap.demo | refusé |
| Intrus non enrôlé | invite.externe@gmail.com | refusé et journalisé |

## Démonstration de la révocation en direct

La session est gardée par onglet. Ouvrir un onglet connecté avec `h.diallo@mfp.msap.demo` (messagerie), un autre avec `i.sawadogo@mtd.msap.demo` (portail). Révoquer Hamidou Diallo depuis le portail : en quelques secondes son onglet est déconnecté, et les autres membres de ses groupes voient le message « accès révoqué · clés du groupe renouvelées ».

## Technologies et licences

| Technologie | Licence | Projet |
| --- | --- | --- |
| React 19 | MIT | https://react.dev |
| React Router 7 | MIT | https://reactrouter.com |
| Vite 8 | MIT | https://vite.dev |
| Lucide React | ISC | https://lucide.dev |
| Recharts 3 | MIT | https://recharts.org |
| Inter, JetBrains Mono (Fontsource) | OFL-1.1 | https://fontsource.org |

Code publié sous licence AGPL-3.0 (fichier `LICENSE` à la racine du dépôt).
