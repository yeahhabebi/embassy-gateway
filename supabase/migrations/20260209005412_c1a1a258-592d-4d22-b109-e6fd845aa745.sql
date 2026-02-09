-- Remove permissive INSERT policies that use WITH CHECK (true)
-- These are no longer needed since inserts go through edge functions with service role

DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone can submit visa application" ON public.visa_applications;