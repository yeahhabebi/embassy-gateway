import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Allowed file types and max size (5MB)
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const applicationId = formData.get('application_id') as string | null;
    const documentType = formData.get('document_type') as string | null;
    const passportNumber = formData.get('passport_number') as string | null;
    const dateOfBirth = formData.get('date_of_birth') as string | null;

    // Validate required fields
    if (!file || !applicationId || !documentType || !passportNumber || !dateOfBirth) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: file, application_id, document_type, passport_number, date_of_birth' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Allowed: PDF, JPG, PNG' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 5MB' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate document type
    const validDocTypes = ['passport', 'photo', 'proof_of_funds', 'travel_itinerary', 'accommodation', 'invitation_letter', 'other'];
    if (!validDocTypes.includes(documentType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid document type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify the application exists and matches the provided credentials
    const { data: application, error: appError } = await supabase
      .from('visa_applications')
      .select('id')
      .eq('id', applicationId)
      .eq('passport_number', passportNumber.trim())
      .eq('date_of_birth', dateOfBirth)
      .maybeSingle();

    if (appError) {
      console.error('Database error:', appError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify application' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!application) {
      return new Response(
        JSON.stringify({ error: 'Application not found or credentials do not match' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${applicationId}/${documentType}_${timestamp}_${sanitizedFileName}`;

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('visa-documents')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload document' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create record in application_documents table
    const { data: docRecord, error: docError } = await supabase
      .from('application_documents')
      .insert({
        application_id: applicationId,
        document_type: documentType,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
      })
      .select()
      .single();

    if (docError) {
      console.error('Document record error:', docError);
      // Try to delete the uploaded file if record creation fails
      await supabase.storage.from('visa-documents').remove([filePath]);
      return new Response(
        JSON.stringify({ error: 'Failed to save document record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Document uploaded successfully: ${filePath}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        document: {
          id: docRecord.id,
          document_type: docRecord.document_type,
          file_name: docRecord.file_name,
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});