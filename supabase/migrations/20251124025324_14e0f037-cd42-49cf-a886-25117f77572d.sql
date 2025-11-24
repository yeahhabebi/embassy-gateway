-- Fix RLS on admin_users to avoid infinite recursion and allow safe admin checks
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing recursive policies
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON public.admin_users;

-- Allow each authenticated user to read only their own admin record
CREATE POLICY "Admins can view their own admin record"
ON public.admin_users
FOR SELECT
USING (id = auth.uid());