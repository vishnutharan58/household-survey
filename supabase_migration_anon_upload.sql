BEGIN;
DROP POLICY IF EXISTS "Auth Users Upload" ON storage.objects;
CREATE POLICY "Anon Users Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'event-images' );
COMMIT;
