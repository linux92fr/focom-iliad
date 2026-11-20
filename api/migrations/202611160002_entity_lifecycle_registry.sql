-- FOCOM ILIAD — référentiel des entités et historique de réorganisation
-- À appliquer dans Neon SQL Editor après la migration initiale.
-- La date du 01/12/2026 et les absorptions reprennent les informations fournies ;
-- Assunet et Trax restent explicitement à confirmer.

BEGIN;

ALTER TABLE entities
  ADD COLUMN IF NOT EXISTS lifecycle_status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS effective_from DATE,
  ADD COLUMN IF NOT EXISTS effective_to DATE,
  ADD COLUMN IF NOT EXISTS absorbed_into_id BIGINT REFERENCES entities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS confirmation_note TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'entities_lifecycle_status_check'
  ) THEN
    ALTER TABLE entities ADD CONSTRAINT entities_lifecycle_status_check
      CHECK (lifecycle_status IN ('active', 'absorbed', 'pending_confirmation'));
  END IF;
END $$;

INSERT INTO entities (name, slug, entity_type, description, lifecycle_status, effective_from, effective_to, is_active, confirmation_note)
VALUES
  ('Iliad SA (holding)', 'iliad-sa-holding', 'company', 'Holding du groupe Iliad.', 'active', NULL, NULL, TRUE, NULL),
  ('Free SAS', 'free-sas', 'company', 'Société absorbante à compter du 1er décembre 2026, selon les informations communiquées.', 'active', DATE '2026-12-01', NULL, TRUE, NULL),
  ('Free Mobile', 'free-mobile', 'subsidiary', 'Entité indiquée comme absorbée par Free SAS à compter du 1er décembre 2026.', 'absorbed', NULL, DATE '2026-12-01', FALSE, NULL),
  ('Free Réseau', 'free-reseau', 'subsidiary', 'Entité indiquée comme absorbée par Free SAS à compter du 1er décembre 2026.', 'absorbed', NULL, DATE '2026-12-01', FALSE, NULL),
  ('Réseau Optique de France', 'reseau-optique-de-france', 'company', 'Entité indiquée comme absorbée par Free SAS à compter du 1er décembre 2026.', 'absorbed', NULL, DATE '2026-12-01', FALSE, NULL),
  ('Assunet', 'assunet', 'company', 'Périmètre à confirmer sur pièces.', 'pending_confirmation', NULL, NULL, FALSE, 'À confirmer par les documents'),
  ('Trax', 'trax', 'company', 'Périmètre à confirmer sur pièces.', 'pending_confirmation', NULL, NULL, FALSE, 'À confirmer par les documents'),
  ('Free Distributions (Boutiques Free)', 'free-distributions', 'company', 'Entité du groupe mentionnée dans les informations communiquées.', 'active', NULL, NULL, TRUE, NULL),
  ('Free Assistance', 'free-assistance', 'company', 'Entité du groupe mentionnée dans les informations communiquées.', 'active', NULL, NULL, TRUE, NULL),
  ('Iliad Italia', 'iliad-italia', 'subsidiary', 'Autre entité du groupe, indiquée comme non concernée par l’opération décrite.', 'active', NULL, NULL, TRUE, NULL),
  ('Play', 'play', 'subsidiary', 'Autre entité du groupe, indiquée comme non concernée par l’opération décrite.', 'active', NULL, NULL, TRUE, NULL),
  ('Scaleway', 'scaleway', 'subsidiary', 'Autre entité du groupe, indiquée comme non concernée par l’opération décrite.', 'active', NULL, NULL, TRUE, NULL),
  ('OpCore', 'opcore', 'subsidiary', 'Autre entité du groupe, indiquée comme non concernée par l’opération décrite.', 'active', NULL, NULL, TRUE, NULL),
  ('Free Pro', 'free-pro', 'subsidiary', 'Autre entité du groupe, indiquée comme non concernée par l’opération décrite.', 'active', NULL, NULL, TRUE, NULL),
  ('ITrust', 'itrust', 'subsidiary', 'Autre entité du groupe, indiquée comme non concernée par l’opération décrite.', 'active', NULL, NULL, TRUE, NULL),
  ('Stancer', 'stancer', 'subsidiary', 'Autre entité du groupe, indiquée comme non concernée par l’opération décrite.', 'active', NULL, NULL, TRUE, NULL)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  lifecycle_status = EXCLUDED.lifecycle_status,
  effective_from = EXCLUDED.effective_from,
  effective_to = EXCLUDED.effective_to,
  is_active = EXCLUDED.is_active,
  confirmation_note = EXCLUDED.confirmation_note,
  updated_at = NOW();

UPDATE entities child
SET absorbed_into_id = parent.id, updated_at = NOW()
FROM entities parent
WHERE child.slug IN ('free-mobile', 'free-reseau', 'reseau-optique-de-france')
  AND parent.slug = 'free-sas';

INSERT INTO schema_migrations(version)
VALUES ('202611160002_entity_lifecycle_registry')
ON CONFLICT (version) DO NOTHING;

COMMIT;
