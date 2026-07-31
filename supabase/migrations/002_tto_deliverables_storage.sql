-- Public bucket for TTO report deliverables (PPT decks too large for git)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tto-deliverables',
  'tto-deliverables',
  true,
  524288000,
  ARRAY[
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "tto_deliverables_public_read" ON storage.objects;
CREATE POLICY "tto_deliverables_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'tto-deliverables');
