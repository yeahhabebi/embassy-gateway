
CREATE OR REPLACE FUNCTION public.generate_application_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  new_number TEXT;
  digits TEXT := '';
  i INTEGER;
BEGIN
  -- Generate 10 random digits
  FOR i IN 1..10 LOOP
    digits := digits || floor(random() * 10)::integer::text;
  END LOOP;
  new_number := 'BIH' || digits;
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM visa_applications WHERE application_number = new_number) LOOP
    digits := '';
    FOR i IN 1..10 LOOP
      digits := digits || floor(random() * 10)::integer::text;
    END LOOP;
    new_number := 'BIH' || digits;
  END LOOP;
  
  RETURN new_number;
END;
$function$;
