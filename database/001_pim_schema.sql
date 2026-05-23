-- PIM Dynamic Record Views — Database Schema
-- Compatible with PostgreSQL 14+

-- ─── Classes ────────────────────────────────────────────────────────────────

CREATE TABLE pim_classes (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── Fields ─────────────────────────────────────────────────────────────────

CREATE TYPE field_type AS ENUM (
  'text', 'textarea', 'number', 'date', 'datetime',
  'boolean', 'image', 'relation', 'select', 'multiselect',
  'url', 'email', 'color'
);

CREATE TABLE pim_fields (
  id               SERIAL PRIMARY KEY,
  class_id         INTEGER      NOT NULL REFERENCES pim_classes(id) ON DELETE CASCADE,
  name             VARCHAR(255) NOT NULL,
  type             field_type   NOT NULL,
  required         BOOLEAN      NOT NULL DEFAULT FALSE,
  sort_order       INTEGER      NOT NULL DEFAULT 0,
  -- JSON config: options (for select), relation_class_id, validation rules, etc.
  meta             JSONB        NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fields_class_id ON pim_fields(class_id);

-- ─── Records ────────────────────────────────────────────────────────────────

CREATE TABLE pim_records (
  id          SERIAL PRIMARY KEY,
  class_id    INTEGER     NOT NULL REFERENCES pim_classes(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_records_class_id ON pim_records(class_id);

-- Field values stored as EAV (Entity-Attribute-Value) for flexibility
-- Use JSONB column for the value to handle all types without casting
CREATE TABLE pim_record_values (
  id         BIGSERIAL PRIMARY KEY,
  record_id  INTEGER     NOT NULL REFERENCES pim_records(id) ON DELETE CASCADE,
  field_id   INTEGER     NOT NULL REFERENCES pim_fields(id) ON DELETE CASCADE,
  -- Single JSONB column handles any type: string, number, bool, array, null
  value      JSONB,
  UNIQUE (record_id, field_id)
);

CREATE INDEX idx_rv_record_id ON pim_record_values(record_id);
CREATE INDEX idx_rv_field_id  ON pim_record_values(field_id);

-- ─── Views ──────────────────────────────────────────────────────────────────

CREATE TABLE pim_views (
  id          SERIAL       PRIMARY KEY,
  class_id    INTEGER      NOT NULL REFERENCES pim_classes(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  -- Grid config
  columns     SMALLINT     NOT NULL DEFAULT 12,
  row_height  SMALLINT     NOT NULL DEFAULT 60,
  -- Full layout serialized as JSON array of LayoutItem
  -- [{ fieldId, x, y, w, h, minW?, minH?, displayOptions? }]
  layout      JSONB        NOT NULL DEFAULT '[]',
  is_default  BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_views_class_id ON pim_views(class_id);

-- Only one default view per class
CREATE UNIQUE INDEX idx_views_default_per_class
  ON pim_views(class_id)
  WHERE is_default = TRUE;

-- ─── Trigger: updated_at auto-update ────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_classes_updated_at  BEFORE UPDATE ON pim_classes  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_fields_updated_at   BEFORE UPDATE ON pim_fields   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_records_updated_at  BEFORE UPDATE ON pim_records  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_views_updated_at    BEFORE UPDATE ON pim_views    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
