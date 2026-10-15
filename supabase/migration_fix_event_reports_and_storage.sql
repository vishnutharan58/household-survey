-- ==============================================================================
-- Migration: Fix Event Reports staff_name, CC Meetings images, and Storage RLS
-- ==============================================================================

-- 1. Ensure staff_name column exists on event_reports
ALTER TABLE public.event_reports 
ADD COLUMN IF NOT EXISTS staff_name TEXT;

-- 2. Ensure images column exists on cc_meetings_log
ALTER TABLE public.cc_meetings_log 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- 3. Ensure event-images storage bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4. Enable access for authenticated staff & public to upload and view event-images
DROP POLICY IF EXISTS "Allow public read storage event-images" ON storage.objects;
CREATE POLICY "Allow public read storage event-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

DROP POLICY IF EXISTS "Allow authenticated insert storage event-images" ON storage.objects;
CREATE POLICY "Allow authenticated insert storage event-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images');

DROP POLICY IF EXISTS "Allow anon insert storage event-images" ON storage.objects;
CREATE POLICY "Allow anon insert storage event-images"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'event-images');

DROP POLICY IF EXISTS "Allow authenticated update storage event-images" ON storage.objects;
CREATE POLICY "Allow authenticated update storage event-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-images');
