-- FOCOM ILIAD — initial relational schema
-- Apply once in the Neon SQL Editor against the focom-iliad project.
-- This migration creates structure only; it inserts no personal data.

BEGIN;

CREATE TABLE IF NOT EXISTS entities (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  entity_type TEXT NOT NULL CHECK (
    entity_type IN ('company', 'subsidiary', 'ues', 'establishment', 'other')
  ),
  parent_id BIGINT REFERENCES entities(id) ON DELETE SET NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS entities_parent_id_idx ON entities(parent_id);
CREATE INDEX IF NOT EXISTS entities_active_idx ON entities(is_active);

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS editorial_profiles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  auth_user_id TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  global_role TEXT NOT NULL DEFAULT 'author'
    CHECK (global_role IN ('author', 'editor', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS editorial_profile_entities (
  profile_id BIGINT NOT NULL REFERENCES editorial_profiles(id) ON DELETE CASCADE,
  entity_id BIGINT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  entity_role TEXT NOT NULL DEFAULT 'author'
    CHECK (entity_role IN ('author', 'editor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (profile_id, entity_id)
);

CREATE INDEX IF NOT EXISTS editorial_profile_entities_entity_idx
  ON editorial_profile_entities(entity_id);

CREATE TABLE IF NOT EXISTS articles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT,
  body TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT,
  cover_image_alt TEXT,
  author_profile_id BIGINT REFERENCES editorial_profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'published', 'archived')),
  visibility TEXT NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'restricted')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status <> 'published' OR published_at IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS articles_status_published_idx
  ON articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS articles_author_idx ON articles(author_profile_id);

CREATE TABLE IF NOT EXISTS article_entities (
  article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  entity_id BIGINT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, entity_id)
);

CREATE INDEX IF NOT EXISTS article_entities_entity_idx ON article_entities(entity_id);

CREATE TABLE IF NOT EXISTS article_categories (
  article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, category_id)
);

CREATE INDEX IF NOT EXISTS article_categories_category_idx
  ON article_categories(category_id);

CREATE TABLE IF NOT EXISTS resources (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  resource_type TEXT NOT NULL DEFAULT 'document'
    CHECK (resource_type IN ('agreement', 'guide', 'document', 'link', 'other')),
  file_url TEXT,
  external_url TEXT,
  entity_id BIGINT REFERENCES entities(id) ON DELETE SET NULL,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  visibility TEXT NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'restricted')),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  verified_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (file_url IS NULL OR external_url IS NULL)
);

CREATE INDEX IF NOT EXISTS resources_publication_idx
  ON resources(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS resources_entity_idx ON resources(entity_id);
CREATE INDEX IF NOT EXISTS resources_category_idx ON resources(category_id);

CREATE TABLE IF NOT EXISTS campaigns (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT,
  body TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  cover_image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at >= starts_at)
);

CREATE TABLE IF NOT EXISTS campaign_entities (
  campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  entity_id BIGINT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  PRIMARY KEY (campaign_id, entity_id)
);

CREATE INDEX IF NOT EXISTS campaign_entities_entity_idx
  ON campaign_entities(entity_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'entities',
    'categories',
    'editorial_profiles',
    'articles',
    'resources',
    'campaigns'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I', table_name);
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
      table_name
    );
  END LOOP;
END;
$$;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO schema_migrations(version)
VALUES ('202611160001_initial_portal_schema')
ON CONFLICT (version) DO NOTHING;

COMMIT;
