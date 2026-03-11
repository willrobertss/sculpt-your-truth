DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
  DROP POLICY IF EXISTS "Public can read videos" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update own videos" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload posters" ON storage.objects;
  DROP POLICY IF EXISTS "Public can read posters" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update own posters" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload thumbnails" ON storage.objects;
  DROP POLICY IF EXISTS "Public can read thumbnails" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update own thumbnails" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Public can read avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Users can upload to own video folder" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Anyone can read videos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'videos');
CREATE POLICY "Users can update own video files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own video files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'videos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload to own poster folder" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'posters' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Anyone can read posters" ON storage.objects FOR SELECT TO public USING (bucket_id = 'posters');
CREATE POLICY "Users can update own poster files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'posters' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload to own thumbnail folder" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'thumbnails' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Anyone can read thumbnails" ON storage.objects FOR SELECT TO public USING (bucket_id = 'thumbnails');
CREATE POLICY "Users can update own thumbnail files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'thumbnails' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload to own avatar folder" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Anyone can read avatars" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');
CREATE POLICY "Users can update own avatar files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)