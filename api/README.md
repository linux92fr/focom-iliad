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

## Première migration de base de données

Le schéma initial est dans `migrations/202611160001_initial_portal_schema.sql`.

Il crée les tables :
- `entities` : sociétés, filiales, UES et établissements, avec hiérarchie facultative.
- `categories` : rubriques éditoriales.
- `editorial_profiles` et `editorial_profile_entities` : profils éditoriaux et périmètres d'intervention, prêts à être reliés à l'identifiant Better Auth.
- `articles`, `article_entities`, `article_categories` : actualités et leurs rattachements.
- `resources` : accords, fiches pratiques, documents et liens.
- `campaigns` et `campaign_entities` : campagnes et entités concernées.
- `schema_migrations` : suivi de la migration appliquée.

### Application manuelle initiale

1. Ouvrir le projet Neon `focom-iliad`.
2. Ouvrir le SQL Editor sur la branche `production` et la base par défaut.
3. Copier le contenu complet du fichier de migration depuis GitHub.
4. Exécuter le script une seule fois.
5. Vérifier que la requête se termine sans erreur et que la table `schema_migrations` contient `202611160001_initial_portal_schema`.

Cette migration crée uniquement la structure : aucune donnée personnelle ni compte administrateur n'est ajouté.

**Important :** les routes de lecture/écriture métier ne sont pas encore exposées. Garder l'accès PostgreSQL exclusivement côté Worker. Avant d'ouvrir l'administration, ajouter l'authentification et les contrôles d'autorisation côté serveur, puis définir les règles de visibilité des contenus réservés.
