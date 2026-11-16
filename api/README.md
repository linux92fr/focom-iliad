# FOCOM ILIAD API — Cloudflare Worker

API HTTP déployée sur Cloudflare Workers et connectée à Neon PostgreSQL.

## Endpoints initiaux

- `GET /health` : contrôle HTTP.
- `GET /health/db` : contrôle de connexion Neon.

## Secrets et variables

Dans Cloudflare > Worker > Settings > Variables and Secrets :

- Secret `DATABASE_URL` : chaîne de connexion Neon poolée (host contenant `-pooler`).
- Variable `CORS_ORIGIN` : origine exacte du site, par exemple `https://focom-iliad.fr`.

Ne jamais utiliser de préfixe `VITE_` pour le secret de base. Ne pas committer de vraie chaîne de connexion.

## Déploiement depuis GitHub

Connecter le dépôt `linux92fr/focom-iliad` à Cloudflare Workers Builds.
Configurer le répertoire racine sur `api`, puis utiliser le déploiement Wrangler depuis ce répertoire.

Le fichier `wrangler.jsonc` déclare l'entrée `worker.js`. Les secrets doivent être ajoutés dans le tableau de bord Cloudflare avant de tester `/health/db`.

## Sécurité et périmètre

Cette première version ne donne accès à aucune donnée métier. Elle vérifie seulement le service et la connexion SQL. Les routes de contenu, l'authentification, les contrôles d'accès et les migrations SQL seront ajoutés séparément, avec validation des règles d'accès avant toute exposition publique.
