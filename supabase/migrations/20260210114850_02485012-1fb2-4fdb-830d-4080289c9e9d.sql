-- Add INSERT policy for admins on visa_applications
CREATE POLICY "Admins can insert applications"
ON public.visa_applications
FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

-- Add INSERT policy for admins on application_documents
CREATE POLICY "Admins can insert documents"
ON public.application_documents
FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

-- Add UPDATE policy for admins on application_documents
CREATE POLICY "Admins can update documents"
ON public.application_documents
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));