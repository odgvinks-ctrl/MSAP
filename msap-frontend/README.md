# MSAP · Portail d'administration

Frontend du portail d'administration de MSAP (Messagerie Souveraine de l'Administration Publique). La messagerie des agents est Element Web, habillé par `../element/config.json`.

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
| Agent sans droits | a.ouedraogo@mtd.msap.demo | refusé |
| Compte révoqué | a.barry@mae.msap.demo | refusé |
| Intrus non enrôlé | invite.externe@gmail.com | refusé et journalisé |

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
