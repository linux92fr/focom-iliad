-- FOCOM ILIAD — catégories éditoriales initiales
-- À exécuter dans Neon SQL Editor.
BEGIN;
INSERT INTO categories (name, slug, description, sort_order, is_active)
VALUES
 ('Actualités', 'actualites', 'Informations et actualités du groupe.', 10, TRUE),
 ('Communiqués', 'communiques', 'Communiqués et prises de position FOCOM.', 20, TRUE),
 ('Revendications', 'revendications', 'Demandes et revendications syndicales.', 30, TRUE),
 ('Conditions de travail', 'conditions-de-travail', 'Organisation, charge et conditions de travail.', 40, TRUE),
 ('Rémunération', 'remuneration', 'Salaires, primes et rémunération.', 50, TRUE),
 ('Temps de travail', 'temps-de-travail', 'Horaires, durée du travail et congés.', 60, TRUE),
 ('Santé et sécurité', 'sante-securite', 'Santé, sécurité et prévention.', 70, TRUE),
 ('Mobilisation', 'mobilisation', 'Actions collectives, pétitions et mobilisations.', 80, TRUE),
 ('Vie des entités', 'vie-des-entites', 'Informations relatives aux sociétés et établissements.', 90, TRUE)
ON CONFLICT (slug) DO UPDATE SET
 name = EXCLUDED.name, description = EXCLUDED.description,
 sort_order = EXCLUDED.sort_order, is_active = TRUE, updated_at = NOW();
INSERT INTO schema_migrations(version)
VALUES ('202611160003_initial_editorial_categories')
ON CONFLICT (version) DO NOTHING;
COMMIT;