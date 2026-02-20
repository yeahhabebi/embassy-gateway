
-- Make non-mandatory fields nullable for visa_applications
ALTER TABLE public.visa_applications
  ALTER COLUMN email DROP NOT NULL,
  ALTER COLUMN phone DROP NOT NULL,
  ALTER COLUMN gender DROP NOT NULL,
  ALTER COLUMN nationality DROP NOT NULL,
  ALTER COLUMN passport_issue_date DROP NOT NULL,
  ALTER COLUMN passport_expiry_date DROP NOT NULL,
  ALTER COLUMN passport_issue_country DROP NOT NULL,
  ALTER COLUMN address DROP NOT NULL,
  ALTER COLUMN city DROP NOT NULL,
  ALTER COLUMN visa_type DROP NOT NULL,
  ALTER COLUMN purpose_of_visit DROP NOT NULL,
  ALTER COLUMN intended_arrival_date DROP NOT NULL;

-- Set default for visa_type so it can be omitted
ALTER TABLE public.visa_applications ALTER COLUMN visa_type SET DEFAULT 'tourist'::visa_type;

-- Set default empty strings won't work for nullable, so just allow nulls
