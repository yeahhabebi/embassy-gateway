import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 3;

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

const validateString = (str: unknown, minLen: number, maxLen: number): boolean => {
  if (typeof str !== "string") return false;
  const trimmed = str.trim();
  return trimmed.length >= minLen && trimmed.length <= maxLen;
};

const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
};

const validateDate = (dateStr: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(Date.parse(dateStr));
};

const sanitize = (str: string): string => (typeof str === "string" ? str.trim() : "");

const VALID_VISA_TYPES = ["tourist", "business", "student", "work", "transit", "diplomatic"];
const VALID_GENDERS = ["male", "female", "other"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const ipCheck = checkRateLimit(`ip:${clientIp}`);
    if (!ipCheck.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many applications submitted. Please try again later.", retryAfter: ipCheck.retryAfter }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const errors: string[] = [];

    // Personal info
    if (!validateString(body.first_name, 1, 100)) errors.push("First name is required (max 100 chars)");
    if (!validateString(body.last_name, 1, 100)) errors.push("Last name is required (max 100 chars)");
    if (!body.email || !validateEmail(body.email as string)) errors.push("Valid email is required");
    if (!validateString(body.phone, 5, 30)) errors.push("Valid phone number is required");
    if (!body.gender || !VALID_GENDERS.includes((body.gender as string).toLowerCase())) errors.push("Valid gender is required");
    if (!body.date_of_birth || !validateDate(body.date_of_birth as string)) errors.push("Valid date of birth is required");
    if (!validateString(body.nationality, 2, 100)) errors.push("Nationality is required");
    if (!validateString(body.address, 5, 500)) errors.push("Address is required");
    if (!validateString(body.city, 2, 100)) errors.push("City is required");
    if (!validateString(body.country, 2, 100)) errors.push("Country is required");

    // Passport
    if (!validateString(body.passport_number, 5, 20)) errors.push("Valid passport number is required");
    if (!body.passport_issue_date || !validateDate(body.passport_issue_date as string)) errors.push("Passport issue date is required");
    if (!body.passport_expiry_date || !validateDate(body.passport_expiry_date as string)) errors.push("Passport expiry date is required");
    if (!validateString(body.passport_issue_country, 2, 100)) errors.push("Passport issue country is required");

    // Travel
    if (!body.visa_type || !VALID_VISA_TYPES.includes(body.visa_type as string)) errors.push("Valid visa type is required");
    if (!body.intended_arrival_date || !validateDate(body.intended_arrival_date as string)) errors.push("Intended arrival date is required");
    if (!validateString(body.purpose_of_visit, 10, 1000)) errors.push("Purpose of visit is required (min 10 chars)");

    if (errors.length > 0) {
      return new Response(JSON.stringify({ error: "Validation failed", details: errors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check for duplicate passport + same day submission
    const emailCheck = checkRateLimit(`email:${(body.email as string).toLowerCase()}`);
    if (!emailCheck.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many applications from this email. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data, error: insertError } = await supabase
      .from("visa_applications")
      .insert({
        first_name: sanitize(body.first_name as string),
        last_name: sanitize(body.last_name as string),
        email: sanitize(body.email as string).toLowerCase(),
        phone: sanitize(body.phone as string),
        gender: (body.gender as string).toLowerCase(),
        date_of_birth: body.date_of_birth as string,
        nationality: sanitize(body.nationality as string),
        address: sanitize(body.address as string),
        city: sanitize(body.city as string),
        country: sanitize(body.country as string),
        postal_code: body.postal_code ? sanitize(body.postal_code as string) : null,
        passport_number: sanitize(body.passport_number as string),
        passport_issue_date: body.passport_issue_date as string,
        passport_expiry_date: body.passport_expiry_date as string,
        passport_issue_country: sanitize(body.passport_issue_country as string),
        visa_type: body.visa_type as string,
        intended_arrival_date: body.intended_arrival_date as string,
        intended_departure_date: body.intended_departure_date ? (body.intended_departure_date as string) : null,
        duration_of_stay: body.duration_of_stay ? Number(body.duration_of_stay) : null,
        purpose_of_visit: sanitize(body.purpose_of_visit as string),
        notes: body.notes ? sanitize(body.notes as string) : null,
      })
      .select("application_number")
      .single();

    if (insertError) {
      console.error("[submit-application] DB error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to submit application. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[submit-application] Application submitted: ${data.application_number}`);

    return new Response(
      JSON.stringify({
        success: true,
        application_number: data.application_number,
        message: "Your visa application has been submitted successfully.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[submit-application] Unexpected error:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
