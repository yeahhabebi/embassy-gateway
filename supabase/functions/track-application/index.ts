import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { passport_number, date_of_birth } = await req.json();

    // Validate required fields
    if (!passport_number || !date_of_birth) {
      return new Response(
        JSON.stringify({ error: 'Passport number and date of birth are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input formats
    const passportTrimmed = passport_number.trim();
    if (passportTrimmed.length < 5 || passportTrimmed.length > 20) {
      return new Response(
        JSON.stringify({ error: 'Invalid passport number format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date_of_birth)) {
      return new Response(
        JSON.stringify({ error: 'Invalid date format. Use YYYY-MM-DD' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Query for the application with exact match
    const { data, error } = await supabase
      .from('visa_applications')
      .select('id, application_number, first_name, last_name, nationality, visa_type, status, submission_date, intended_arrival_date, passport_number, date_of_birth')
      .eq('passport_number', passportTrimmed)
      .eq('date_of_birth', date_of_birth)
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to search for application' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Application not found', application: null }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return only limited, non-sensitive fields
    // Mask passport number for display (show last 4 characters only)
    const maskedPassport = '***' + data.passport_number.slice(-4);
    
    const safeApplication = {
      application_number: data.application_number,
      first_name: data.first_name,
      last_name: data.last_name,
      nationality: data.nationality,
      visa_type: data.visa_type,
      status: data.status,
      submission_date: data.submission_date,
      intended_arrival_date: data.intended_arrival_date,
      passport_number: maskedPassport,
      date_of_birth: data.date_of_birth,
    };

    console.log(`Application lookup successful for: ${maskedPassport}`);

    return new Response(
      JSON.stringify({ application: safeApplication }),
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