
-- Add new values to the visa_status enum
ALTER TYPE public.visa_status ADD VALUE IF NOT EXISTS 'documents_incomplete';
ALTER TYPE public.visa_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE public.visa_status ADD VALUE IF NOT EXISTS 'visa_fee_pending';
ALTER TYPE public.visa_status ADD VALUE IF NOT EXISTS 'visa_fee_paid';
ALTER TYPE public.visa_status ADD VALUE IF NOT EXISTS 'issue';
