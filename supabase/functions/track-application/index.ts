import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://id-preview--ff6a760a-54c1-47aa-9520-39f08e1eff6a.lovable.app",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

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

    if (!passport_number || !date_of_birth) {
      return new Response(
        JSON.stringify({ error: 'Passport number and date of birth are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const passportTrimmed = passport_number.trim();
    if (passportTrimmed.length < 5 || passportTrimmed.length > 20) {
      return new Response(
        JSON.stringify({ error: 'Invalid passport number format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date_of_birth)) {
      return new Response(
        JSON.stringify({ error: 'Invalid date format. Use YYYY-MM-DD' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

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
      { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  }
});
