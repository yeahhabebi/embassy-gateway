
-- Add unique constraints to prevent duplicate application_number and passport_number
CREATE UNIQUE INDEX IF NOT EXISTS idx_visa_applications_application_number_unique 
ON public.visa_applications (application_number);

CREATE UNIQUE INDEX IF NOT EXISTS idx_visa_applications_passport_number_unique 
ON public.visa_applications (passport_number);
