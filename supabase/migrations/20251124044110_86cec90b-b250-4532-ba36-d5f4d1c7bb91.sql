-- Create a sequence for visa application numbers
CREATE SEQUENCE IF NOT EXISTS visa_application_number_seq START 1;

-- Drop and recreate the generate_application_number function to use the sequence
DROP FUNCTION IF EXISTS public.generate_application_number();

CREATE OR REPLACE FUNCTION public.generate_application_number()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  -- Use nextval to get a unique, atomic counter value
  counter := nextval('visa_application_number_seq');
  new_number := 'VISA-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(counter::TEXT, 6, '0');
  RETURN new_number;
END;
$$;