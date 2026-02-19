import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Rate limiting to prevent brute-force passport enumeration
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 10; // 10 attempts per window

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
      console.log(`[track-application] Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later.", retryAfter: ipRateCheck.retryAfter }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(ipRateCheck.retryAfter) } }
      );
    }

    let body: { passport_number?: string; date_of_birth?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { passport_number, date_of_birth } = body;

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

    const safeApplication = {
      application_number: data.application_number,
      first_name: data.first_name,
      last_name: data.last_name,
      nationality: data.nationality,
      visa_type: data.visa_type,
      status: data.status,
      submission_date: data.submission_date,
      intended_arrival_date: data.intended_arrival_date,
      passport_number: data.passport_number,
      date_of_birth: data.date_of_birth,
    };

    const maskedLog = '***' + data.passport_number.slice(-4);
    console.log(`Application lookup successful for: ${maskedLog}`);

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
