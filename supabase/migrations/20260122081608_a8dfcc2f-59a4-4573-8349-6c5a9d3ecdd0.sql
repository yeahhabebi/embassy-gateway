-- Fix 1: Remove the public SELECT policy that exposes all visa applications
DROP POLICY IF EXISTS "Anyone can view with passport and DOB" ON public.visa_applications;

-- Fix 2: Remove unrestricted INSERT on application_documents 
DROP POLICY IF EXISTS "Anyone can upload documents" ON public.application_documents;

-- Fix 3: Remove unrestricted storage upload policy
DROP POLICY IF EXISTS "Anyone can upload visa documents" ON storage.objects;