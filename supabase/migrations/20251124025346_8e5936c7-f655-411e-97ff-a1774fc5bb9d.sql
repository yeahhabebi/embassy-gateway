-- Allow INSERT for authenticated users to create their admin record
-- This allows the setup page to work
CREATE POLICY "Allow authenticated users to insert their own admin record"
ON public.admin_users
FOR INSERT
WITH CHECK (id = auth.uid());

-- Allow super admins to manage other admins using security definer function
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = user_id AND role = 'super_admin'
  );
END;
$$;

-- Super admins can view all admin users
CREATE POLICY "Super admins can view all admin users"
ON public.admin_users
FOR SELECT
USING (is_super_admin(auth.uid()));

-- Super admins can update other admins
CREATE POLICY "Super admins can update admin users"
ON public.admin_users
FOR UPDATE
USING (is_super_admin(auth.uid()));

-- Super admins can delete other admins
CREATE POLICY "Super admins can delete admin users"
ON public.admin_users
FOR DELETE
USING (is_super_admin(auth.uid()));