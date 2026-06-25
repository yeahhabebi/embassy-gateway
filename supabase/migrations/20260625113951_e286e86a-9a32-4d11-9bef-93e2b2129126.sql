
DROP POLICY IF EXISTS "Allow first anonymous super admin or authenticated self-insert" ON public.admin_users;

CREATE POLICY "Bootstrap first super admin only"
ON public.admin_users
FOR INSERT
WITH CHECK (
  (NOT public.has_any_admin())
  AND (auth.uid() IS NULL)
  AND (role = 'super_admin'::admin_role)
);

CREATE POLICY "Super admins can insert admin users"
ON public.admin_users
FOR INSERT
TO authenticated
WITH CHECK (public.is_super_admin(auth.uid()));
