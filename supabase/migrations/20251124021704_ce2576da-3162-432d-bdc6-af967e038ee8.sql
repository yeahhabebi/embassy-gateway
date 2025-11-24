-- Update visa status enum to match new requirements
-- First, drop the default constraint
ALTER TABLE visa_applications ALTER COLUMN status DROP DEFAULT;

-- Rename old enum
ALTER TYPE visa_status RENAME TO visa_status_old;

-- Create new enum with updated values
CREATE TYPE visa_status AS ENUM ('processing', 'in_progress', 'approved', 'rejected');

-- Update existing applications to new status values
ALTER TABLE visa_applications 
  ALTER COLUMN status TYPE visa_status 
  USING (
    CASE status::text
      WHEN 'pending' THEN 'processing'::visa_status
      WHEN 'under_review' THEN 'in_progress'::visa_status
      WHEN 'on_hold' THEN 'processing'::visa_status
      ELSE status::text::visa_status
    END
  );

-- Set new default
ALTER TABLE visa_applications ALTER COLUMN status SET DEFAULT 'processing'::visa_status;

-- Drop old enum
DROP TYPE visa_status_old;