
-- Allow authenticated users to upload to posters bucket
CREATE POLICY "Authenticated users can upload posters"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'posters');

-- Allow authenticated users to upload to thumbnails bucket
CREATE POLICY "Authenticated users can upload thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'thumbnails');

-- Allow public read on posters
CREATE POLICY "Public can read posters"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'posters');

-- Allow public read on thumbnails
CREATE POLICY "Public can read thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'thumbnails');

-- Allow users to update their own uploads
CREATE POLICY "Users can update own posters"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'posters');

CREATE POLICY "Users can update own thumbnails"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'thumbnails');
