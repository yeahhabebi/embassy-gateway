
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM authenticated, anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM authenticated, anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_any_admin() FROM authenticated, anon, PUBLIC;

DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit a contact message"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(name)) BETWEEN 1 AND 200
  AND length(trim(email)) BETWEEN 3 AND 320
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(trim(subject)) BETWEEN 1 AND 300
  AND length(trim(message)) BETWEEN 1 AND 5000
  AND (phone IS NULL OR length(phone) <= 50)
  AND is_read = false
  AND admin_notes IS NULL
);
