# FOCOM ILIAD — Portail syndical du groupe

Portail d'information et de représentation syndicale FO pour les salariés du groupe ILIAD.

**Domaine cible :** https://focom-iliad.fr

## Objectifs
- Centraliser les actualités, communications et campagnes FO à l'échelle du groupe ILIAD.
- Présenter les entités, entreprises et établissements couverts par le portail.
- Faciliter l'accès aux droits, accords, ressources pratiques et documents utiles.
- Rendre visibles les revendications, actions, consultations et mobilisations.
- Orienter les salariés vers leurs représentants et leurs sections syndicales.
- Prévoir une administration éditoriale structurée avec des droits adaptés.

## Organisation fonctionnelle
1. Accueil — actualités majeures et accès rapides.
2. Le groupe ILIAD — présentation du groupe et de ses entités.
3. Actualités — informations nationales, par entreprise et établissement.
4. Vos droits — fiches pratiques, accords et ressources.
5. Revendiquer et agir — campagnes, pétitions et mobilisations.
6. Vos représentants FO — élus, représentants et sections.
7. Adhérer / nous contacter — contact et orientation.

## Principes
- Identité visuelle FO cohérente et accessible.
- Navigation responsive.
- Contenus classés par entité, établissement, thème et date.
- Séparation entre informations publiques et contenus éventuellement réservés.
- Administration sécurisée et permissions contrôlées côté serveur.
- Respect du RGPD et minimisation des données.

## Périmètre
Projet indépendant du site FOCOM UES ILIAD existant. Celui-ci pourra être référencé comme une section du portail, sans migration ni modification de son dépôt.

Voir [docs/PROJECT_BRIEF.md](docs/PROJECT_BRIEF.md), [docs/ENTITIES.md](docs/ENTITIES.md) et [docs/ROADMAP.md](docs/ROADMAP.md).

## Neon Managed Auth

The React/Vite frontend uses Neon Managed Better Auth through `@neondatabase/auth`.

### Frontend environment

Set `VITE_NEON_AUTH_URL` in the Sevalla **Static Site** environment variables to the Auth URL for Neon project `focom-iliad`, branch `production`. This is the public Auth endpoint, not a database credential.

Never add `DATABASE_URL`, Neon API keys, or database passwords to frontend variables or GitHub.

### Auth routes

- `/auth/sign-up` — email and password registration with required email verification.
- `/auth/sign-in` — email and password sign-in.
- Neon Auth UI handles the configured verification-code flow.
- The session bar displays the authenticated user's name/email and offers sign-out.

New signups receive no editorial role. Editorial permissions remain controlled by the server-side `editorial_profiles` and `editorial_profile_entities` tables. Public signup is currently enabled by Neon Managed Auth; do not treat a successful signup as permission to access administration.

### Deployment and validation

The Static Site rebuilds from GitHub after the frontend commits. Configure `VITE_NEON_AUTH_URL` in Sevalla and trigger a redeploy. Then test sign-up with a real mailbox, complete the emailed verification code, sign in, and confirm the session bar shows the current user. A successful build alone does not prove live authentication.
