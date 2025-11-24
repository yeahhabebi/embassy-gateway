-- Fix admin_users RLS to allow first admin setup from public client

-- 1) Drop existing INSERT policy that only allows authenticated inserts
DROP POLICY IF EXISTS "Allow authenticated users to insert their own admin record" ON public.admin_users;

-- 2) Create a SECURITY DEFINER helper to check if any admin exists
CREATE OR REPLACE FUNCTION public.has_any_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM admin_users);
END;
$$;

-- 3) New INSERT policy:
--    - If no admin exists yet and the request is anonymous (no auth.uid()),
--      allow creating the FIRST admin row, but only with role = 'super_admin'.
--    - Otherwise, require an authenticated user inserting a row for themselves.
CREATE POLICY "Allow first anonymous super admin or authenticated self-insert"
ON public.admin_users
FOR INSERT
WITH CHECK (
  (NOT public.has_any_admin() AND auth.uid() IS NULL AND role = 'super_admin')
  OR
  (auth.uid() IS NOT NULL AND id = auth.uid())
);
