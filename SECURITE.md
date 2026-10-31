# Note de sécurité · MSAP

Ce document décrit ce que MSAP protège, contre quelles menaces, avec quels mécanismes, et ce qu'il ne protège pas. Chaque mécanisme est marqué :

- **[Démontré]** : présent dans le dépôt et testable aujourd'hui (mode démonstration du frontend, tests automatisés) ;
- **[Cible]** : prévu dans l'architecture de production (Synapse, Keycloak, API FastAPI), pas encore déployé dans ce dépôt.

## 1. Ce que nous protégeons

| Bien | Pourquoi il est sensible |
| --- | --- |
| Contenu des messages et des fichiers | Informations de service, parfois confidentielles |
| Comptes des agents | Un compte volé donne accès aux conversations de l'administration |
| Droits d'administration | Permettent d'enrôler et de révoquer des agents |
| Journal d'audit | Preuve de qui a fait quoi, doit rester fiable |
| Métadonnées | Qui échange avec qui, quand, depuis où |

## 2. Menaces et protections

| Menace | Protection | État |
| --- | --- | --- |
| Personne extérieure qui tente de se connecter | Aucune inscription libre : seuls les agents enrôlés par un administrateur peuvent se connecter. Toute tentative refusée est journalisée avec l'adresse utilisée. | [Démontré] |
| Vol ou devinette du mot de passe | Second facteur obligatoire (code TOTP à 6 chiffres, application d'authentification). Aucun jeton de session n'est délivré avant la vérification du code. Les codes invalides sont journalisés. | [Démontré] ; TOTP réel par Keycloak [Cible] |
| Agent qui quitte l'administration ou perd son téléphone | Révocation en un appel : compte désactivé, sessions et jetons fermés, appareils supprimés, retrait des salons, compte bloqué. La session ouverte de l'agent est coupée immédiatement. | [Démontré] dans le portail ; exécution sur Keycloak et Synapse [Cible] |
| Agent qui tente d'accéder au portail | Contrôle du rôle côté interface et côté API : un agent reçoit un refus (403) et est renvoyé vers sa messagerie. | [Démontré] |
| Administrateur ministériel qui dépasse son périmètre | Il ne voit, n'enrôle, ne modifie et ne révoque que les agents de son ministère. Les règles de classification sont réservées au super administrateur. Un administrateur ne peut pas se révoquer lui-même. | [Démontré] |
| Jeton de session volé ou inventé | Jeton refusé s'il est inconnu ou si le compte n'est plus actif ; le jeton est effacé du navigateur et la session fermée. Jeton conservé dans l'onglet (`sessionStorage`), pas dans le stockage permanent. | [Démontré] ; cookie `HttpOnly` [Cible] |
| Serveur compromis ou administrateur système curieux | Chiffrement de bout en bout Matrix (Olm/Megolm, bibliothèque vodozemac) : le serveur relaie les messages sans pouvoir les lire. Après une révocation, les clés de groupe sont renouvelées. | [Cible] |
| Interception sur le réseau | TLS sur toutes les connexions ; fédération Matrix désactivée (pas d'échange avec des serveurs extérieurs). | [Cible] |
| Fuite d'un message sensible par un destinataire | Classification des messages (Standard, Diffusion restreinte, Confidentiel) : transfert interdit, copie interdite, expiration automatique, accusé de lecture obligatoire, filigrane nominatif. Règles fixées par le super administrateur. | [Démontré] dans l'interface |
| Dépendance à un service étranger | Tout est auto-hébergé : pas de service tiers, polices et bibliothèques intégrées au projet, logiciels open source vérifiables. | [Démontré] pour le frontend |
| Action d'administration contestée | Journal d'audit : enrôlement, révocation, suspension, changement de rôle, modification des règles et connexions refusées, avec l'auteur, la date, le motif et l'adresse IP. | [Démontré] |

**Aucune cryptographie maison.** L'équipe n'a écrit aucun algorithme de chiffrement. Le chiffrement repose uniquement sur des bibliothèques auditées (vodozemac, TLS).

## 3. Vérification

27 tests automatisés (`msap-frontend`, commande `npm test`) vérifient les protections marquées [Démontré] : refus des intrus et des comptes révoqués ou suspendus, second facteur obligatoire, refus des jetons absents ou inventés, interdiction du portail aux agents, limitation au ministère, règles réservées au super administrateur, coupure immédiate de la session d'un agent révoqué, journalisation.

Ces tests ont révélé une faille pendant le sprint : un administrateur ministériel pouvait consulter la fiche d'un agent d'un autre ministère, car le contrôle de périmètre était fait après la lecture. La faille est corrigée et le test la surveille désormais. L'API réelle doit appliquer le même contrôle sur `GET /admin/agents/{id}`.

## 4. Limites assumées

- **Le mode démonstration n'est pas sécurisé.** Il simule l'API dans le navigateur avec des comptes fictifs, un mot de passe et un code connus. Il sert à montrer le parcours, pas à être déployé.
- **Synapse et Keycloak ne sont pas encore déployés dans ce dépôt**, et les routes métier de l'API FastAPI sont en cours. Le chiffrement de bout en bout et le TOTP réel ne sont donc pas encore actifs.
- **Les contrôles côté interface ne suffisent pas.** En production, chaque contrôle d'accès doit être refait par l'API, qui reste la seule autorité.
- **Métadonnées visibles par le serveur** : qui échange avec qui, quand, et les adresses IP. Nous les réduisons (fédération désactivée, conservation limitée des journaux, statistiques agrégées dans le portail) sans pouvoir les supprimer.
- **Les restrictions de copie et de transfert** ne protègent que dans les applications MSAP. Elles n'empêchent pas une photo de l'écran prise avec un autre appareil. Le filigrane nominatif permet d'en retrouver l'auteur.
- **Un appareil perdu** garde les messages déjà déchiffrés tant qu'il n'est pas effacé ou reconnecté au réseau. La révocation coupe seulement l'accès aux nouveaux messages.
- **Le second facteur TOTP** ne protège pas contre un agent qui donne son code à un fraudeur (hameçonnage en temps réel). Des clés de sécurité matérielles (FIDO2/WebAuthn), gérées par Keycloak, seraient l'étape suivante.
