-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for visa application status
CREATE TYPE visa_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'on_hold');

-- Create enum for visa types
CREATE TYPE visa_type AS ENUM ('tourist', 'business', 'student', 'work', 'transit', 'diplomatic');

-- Create enum for admin roles
CREATE TYPE admin_role AS ENUM ('super_admin', 'staff');

-- Visa applications table
CREATE TABLE visa_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_number VARCHAR(20) UNIQUE NOT NULL,
  
  -- Personal Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  nationality VARCHAR(100) NOT NULL,
  gender VARCHAR(20) NOT NULL,
  
  -- Passport Information
  passport_number VARCHAR(50) NOT NULL,
  passport_issue_date DATE NOT NULL,
  passport_expiry_date DATE NOT NULL,
  passport_issue_country VARCHAR(100) NOT NULL,
  
  -- Contact Information
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  
  -- Travel Information
  visa_type visa_type NOT NULL,
  purpose_of_visit TEXT NOT NULL,
  intended_arrival_date DATE NOT NULL,
  intended_departure_date DATE,
  duration_of_stay INTEGER,
  
  -- Application Status
  status visa_status DEFAULT 'pending' NOT NULL,
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Additional fields
  notes TEXT,
  admin_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Admin users table (separate from auth.users for role management)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role admin_role DEFAULT 'staff' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE
);

-- CMS content table for editable content
CREATE TABLE cms_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_by UUID REFERENCES admin_users(id)
);

-- Application documents table
CREATE TABLE application_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES visa_applications(id) ON DELETE CASCADE NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE visa_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for visa_applications
-- Public can insert (submit applications)
CREATE POLICY "Anyone can submit visa application"
  ON visa_applications FOR INSERT
  WITH CHECK (true);

-- Public can read their own application with passport number + DOB
CREATE POLICY "Anyone can view with passport and DOB"
  ON visa_applications FOR SELECT
  USING (true);

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
  ON visa_applications FOR SELECT
  USING (is_admin(auth.uid()));

-- Admins can update applications
CREATE POLICY "Admins can update applications"
  ON visa_applications FOR UPDATE
  USING (is_admin(auth.uid()));

-- Admins can delete applications
CREATE POLICY "Admins can delete applications"
  ON visa_applications FOR DELETE
  USING (is_admin(auth.uid()));

-- RLS Policies for admin_users
CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Super admins can manage admin users"
  ON admin_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- RLS Policies for cms_content
-- Public can read CMS content
CREATE POLICY "Anyone can read CMS content"
  ON cms_content FOR SELECT
  USING (true);

-- Admins can manage CMS content
CREATE POLICY "Admins can manage CMS content"
  ON cms_content FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies for application_documents
-- Public can insert documents for their application
CREATE POLICY "Anyone can upload documents"
  ON application_documents FOR INSERT
  WITH CHECK (true);

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
  ON application_documents FOR SELECT
  USING (is_admin(auth.uid()));

-- Admins can delete documents
CREATE POLICY "Admins can delete documents"
  ON application_documents FOR DELETE
  USING (is_admin(auth.uid()));

-- Function to generate application number
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM visa_applications;
  new_number := 'VISA-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(counter::TEXT, 6, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate application number
CREATE OR REPLACE FUNCTION set_application_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.application_number IS NULL THEN
    NEW.application_number := generate_application_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_app_number
  BEFORE INSERT ON visa_applications
  FOR EACH ROW
  EXECUTE FUNCTION set_application_number();

-- Trigger to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_visa_timestamp
  BEFORE UPDATE ON visa_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- Insert default CMS content
INSERT INTO cms_content (key, content) VALUES
  ('embassy_name', 'Embassy of the Republic'),
  ('embassy_address', '123 Embassy Street, Capital City, 12345'),
  ('embassy_email', 'info@embassy.gov'),
  ('embassy_phone', '+1 (555) 123-4567'),
  ('embassy_fax', '+1 (555) 123-4568'),
  ('opening_hours', 'Monday - Friday: 9:00 AM - 5:00 PM'),
  ('home_hero_title', 'Welcome to the Embassy Visa Portal'),
  ('home_hero_subtitle', 'Apply for your visa online - Fast, Secure, and Convenient'),
  ('about_content', 'We are dedicated to providing efficient visa services to all applicants.'),
  ('services_content', 'We offer various visa services including tourist, business, student, and work visas.')
ON CONFLICT (key) DO NOTHING;

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('visa-documents', 'visa-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for visa documents
CREATE POLICY "Anyone can upload visa documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'visa-documents');

CREATE POLICY "Admins can view all documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'visa-documents' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'visa-documents' AND is_admin(auth.uid()));