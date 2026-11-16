# FOCOM ILIAD API

Backend Node.js isolé du site statique React/Vite.

## Endpoints initiaux

- `GET /health` : vérifie que le service HTTP répond.
- `GET /health/db` : vérifie la connexion PostgreSQL Neon.

Les réponses ne révèlent jamais la chaîne de connexion ni les détails internes d'une erreur SQL.

## Variables d'environnement

- `DATABASE_URL` : chaîne de connexion Neon **poolée** (hôte contenant `-pooler`), conservée uniquement dans les variables secrètes du service backend.
- `CORS_ORIGIN` : origine exacte du frontend autorisée, par exemple `https://focom-iliad.fr`.
- `PORT` : fourni automatiquement par l'hébergeur.

Ne jamais préfixer `DATABASE_URL` par `VITE_` et ne jamais la placer dans le code frontend.

## Déploiement Sevalla

Créer une nouvelle application Node.js distincte du Static Site actuel, reliée au même dépôt GitHub :

- Répertoire / Root directory : `api`
- Build command : aucune (dépendances installées par `npm install`)
- Start command : `npm start`
- Port : variable d'environnement `PORT` fournie par Sevalla.

Configurer les variables secrètes avant le premier déploiement.

## Périmètre

Cette première version est volontairement limitée aux contrôles de santé. Elle ne contient pas encore d'authentification, d'API de contenu ni de tables métier. Ces éléments seront ajoutés après validation de la connexion Neon et définition des règles d'accès.
