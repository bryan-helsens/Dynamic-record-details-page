-- Useful query patterns for the PIM API layer

-- Get a record with all field values as a flat JSON object
-- Returns: { id, classId, values: { "fieldId": value, ... } }
SELECT
  r.id,
  r.class_id AS "classId",
  COALESCE(
    jsonb_object_agg(rv.field_id::TEXT, rv.value) FILTER (WHERE rv.field_id IS NOT NULL),
    '{}'::jsonb
  ) AS values
FROM pim_records r
LEFT JOIN pim_record_values rv ON rv.record_id = r.id
WHERE r.id = $1
GROUP BY r.id;

-- Get all views for a class with layout parsed
SELECT
  v.id,
  v.class_id   AS "classId",
  v.name,
  v.description,
  v.columns,
  v.row_height AS "rowHeight",
  v.layout,
  v.is_default AS "isDefault",
  v.created_at AS "createdAt",
  v.updated_at AS "updatedAt"
FROM pim_views v
WHERE v.class_id = $1
ORDER BY v.is_default DESC, v.created_at ASC;

-- Upsert a record value
INSERT INTO pim_record_values (record_id, field_id, value)
VALUES ($1, $2, $3::jsonb)
ON CONFLICT (record_id, field_id) DO UPDATE
  SET value = EXCLUDED.value;

-- Validate a layout item references a valid field for the class
SELECT EXISTS (
  SELECT 1 FROM pim_fields
  WHERE id = $1 AND class_id = $2
) AS valid;
