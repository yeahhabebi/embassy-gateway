-- Restrict SECURITY DEFINER function execute to roles that actually need them.
-- has_any_admin() is no longer used by any client path (admin setup removed).
REVOKE EXECUTE ON FUNCTION public.has_any_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_any_admin() TO service_role;

-- Allow public contact form submissions (rate-limited by the submit-contact edge function which uses service role,
-- but add an explicit policy so the table's RLS posture is intentional and not a silent failure).
CREATE POLICY "Anyone can submit a contact message"
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Storage policies for visa-documents: admins can INSERT/UPDATE via the Storage API.
CREATE POLICY "Admins can upload visa documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'visa-documents' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update visa documents"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'visa-documents' AND public.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'visa-documents' AND public.is_admin(auth.uid()));

-- Storage policies for bank-receipt: admin-only access (bucket currently has no policies at all).
CREATE POLICY "Admins can view bank receipts"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'bank-receipt' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can upload bank receipts"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'bank-receipt' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update bank receipts"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'bank-receipt' AND public.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'bank-receipt' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete bank receipts"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'bank-receipt' AND public.is_admin(auth.uid()));