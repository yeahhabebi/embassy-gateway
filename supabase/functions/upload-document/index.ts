import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Rate limiting to prevent storage exhaustion
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 20; // 20 uploads per hour

const checkRateLimit = (key: string): { allowed: boolean; retryAfter?: number } => {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }
  
  entry.count++;
  return { allowed: true };
};

Deno.serve(async (req) => {

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

    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    const ipRateCheck = checkRateLimit(`ip:${clientIp}`);
    if (!ipRateCheck.allowed) {
      console.log(`[upload-document] Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ error: "Too many upload requests. Please try again later.", retryAfter: ipRateCheck.retryAfter }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(ipRateCheck.retryAfter) } }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const applicationId = formData.get('application_id') as string | null;
    const documentType = formData.get('document_type') as string | null;
    const passportNumber = formData.get('passport_number') as string | null;
    const dateOfBirth = formData.get('date_of_birth') as string | null;

    if (!file || !applicationId || !documentType || !passportNumber || !dateOfBirth) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: file, application_id, document_type, passport_number, date_of_birth' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Allowed: PDF, JPG, PNG' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Magic-byte verification — the client-supplied MIME type cannot be trusted.
    const headerBytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const matchesMagic = (() => {
      // PDF: %PDF
      if (headerBytes[0] === 0x25 && headerBytes[1] === 0x50 && headerBytes[2] === 0x44 && headerBytes[3] === 0x46) {
        return file.type === 'application/pdf';
      }
      // JPEG: FF D8 FF
      if (headerBytes[0] === 0xff && headerBytes[1] === 0xd8 && headerBytes[2] === 0xff) {
        return file.type === 'image/jpeg' || file.type === 'image/jpg';
      }
      // PNG: 89 50 4E 47 0D 0A 1A 0A
      if (
        headerBytes[0] === 0x89 && headerBytes[1] === 0x50 && headerBytes[2] === 0x4e && headerBytes[3] === 0x47 &&
        headerBytes[4] === 0x0d && headerBytes[5] === 0x0a && headerBytes[6] === 0x1a && headerBytes[7] === 0x0a
      ) {
        return file.type === 'image/png';
      }
      return false;
    })();

    if (!matchesMagic) {
      return new Response(
        JSON.stringify({ error: 'File contents do not match the declared file type.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 5MB' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validDocTypes = ['passport', 'photo', 'proof_of_funds', 'travel_itinerary', 'accommodation', 'invitation_letter', 'other'];
    if (!validDocTypes.includes(documentType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid document type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

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

    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${applicationId}/${documentType}_${timestamp}_${sanitizedFileName}`;

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
