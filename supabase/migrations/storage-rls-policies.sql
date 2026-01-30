-- Storage RLS Policies for avatars, project-images, and credential-docs buckets

-- AVATARS BUCKET
-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to update their own avatars
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access to avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- PROJECT-IMAGES BUCKET
-- Allow authenticated users to upload their own project images
CREATE POLICY "Users can upload own project images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to update their own project images
CREATE POLICY "Users can update own project images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'project-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their own project images
CREATE POLICY "Users can delete own project images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access to project images
CREATE POLICY "Public can view project images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-images');

-- CREDENTIAL-DOCS BUCKET
-- Allow authenticated users to upload their own credentials
CREATE POLICY "Users can upload own credentials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'credential-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to update their own credentials
CREATE POLICY "Users can update own credentials"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'credential-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their own credentials
CREATE POLICY "Users can delete own credentials"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'credential-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access to credentials
CREATE POLICY "Public can view credentials"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'credential-docs');
