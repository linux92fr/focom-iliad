-- FOCOM ILIAD - public contact requests
-- Apply once in the Neon SQL Editor against the production branch.

BEGIN;

CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  establishment TEXT,
  subject TEXT NOT NULL CHECK (
    subject IN ('rights', 'representation', 'campaign', 'membership', 'other')
  ),
  message TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'in_progress', 'resolved', 'spam')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx
  ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS contact_messages_status_idx
  ON contact_messages(status, created_at DESC);

DROP TRIGGER IF EXISTS set_contact_messages_updated_at ON contact_messages;
CREATE TRIGGER set_contact_messages_updated_at
BEFORE UPDATE ON contact_messages
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO schema_migrations(version)
VALUES ('202611211642_contact_messages')
ON CONFLICT (version) DO NOTHING;

COMMIT;
