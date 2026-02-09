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

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

interface ContactSubmission {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

const validateString = (str: string, minLen: number, maxLen: number): boolean => {
  if (typeof str !== 'string') return false;
  const trimmed = str.trim();
  return trimmed.length >= minLen && trimmed.length <= maxLen;
};

const sanitizeString = (str: string): string => {
  if (typeof str !== 'string') return '';
  return str.trim();
};

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
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";
    
    console.log(`[submit-contact] Request from IP: ${clientIp}`);
    
    let body: ContactSubmission;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { name, email, phone, subject, message } = body;

    const errors: string[] = [];
    
    if (!validateString(name, 2, 255)) {
      errors.push("Name must be between 2 and 255 characters");
    }
    if (!email || !validateEmail(email)) {
      errors.push("Valid email address is required");
    }
    if (phone && !validateString(phone, 0, 50)) {
      errors.push("Phone number is too long");
    }
    if (!validateString(subject, 3, 500)) {
      errors.push("Subject must be between 3 and 500 characters");
    }
    if (!validateString(message, 10, 2000)) {
      errors.push("Message must be between 10 and 2000 characters");
    }

    if (errors.length > 0) {
      console.log(`[submit-contact] Validation failed:`, errors);
      return new Response(
        JSON.stringify({ error: "Validation failed", details: errors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ipRateCheck = checkRateLimit(`ip:${clientIp}`);
    const emailRateCheck = checkRateLimit(`email:${email.toLowerCase()}`);
    
    if (!ipRateCheck.allowed) {
      console.log(`[submit-contact] Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later.", retryAfter: ipRateCheck.retryAfter }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(ipRateCheck.retryAfter) } }
      );
    }
    
    if (!emailRateCheck.allowed) {
      console.log(`[submit-contact] Rate limit exceeded for email: ${email}`);
      return new Response(
        JSON.stringify({ error: "Too many requests from this email. Please try again later.", retryAfter: emailRateCheck.retryAfter }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": String(emailRateCheck.retryAfter) } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: insertError } = await supabase
      .from("contact_messages")
      .insert({
        name: sanitizeString(name),
        email: sanitizeString(email).toLowerCase(),
        phone: phone ? sanitizeString(phone) : null,
        subject: sanitizeString(subject),
        message: sanitizeString(message),
      });

    if (insertError) {
      console.error(`[submit-contact] Database error:`, insertError);
      return new Response(
        JSON.stringify({ error: "Failed to submit message. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[submit-contact] Message submitted successfully from: ${email}`);
    
    return new Response(
      JSON.stringify({ success: true, message: "Your message has been submitted successfully." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error(`[submit-contact] Unexpected error:`, error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
