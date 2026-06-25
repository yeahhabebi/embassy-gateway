// Public sitemap endpoint. Pulls the latest CMS update_at on every request so
// <lastmod> is always current — no file writes, no rebuilds required.

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const BASE_URL = "https://www.bhiembassy.asia";

interface Entry {
  path: string;
  changefreq: "weekly" | "monthly";
  priority: string;
}

// Public, indexable routes. Admin/internal routes are excluded.
const ROUTES: Entry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/services", changefreq: "monthly", priority: "0.9" },
  { path: "/requirements", changefreq: "monthly", priority: "0.9" },
  { path: "/apply", changefreq: "monthly", priority: "0.9" },
  { path: "/track", changefreq: "monthly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.8" },
];

function buildXml(lastmod: string): string {
  const urls = ROUTES.map(
    (r) =>
      `  <url>\n    <loc>${BASE_URL}${r.path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`,
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const today = new Date().toISOString().slice(0, 10);
  let lastmod = today;

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data } = await supabase
      .from("cms_content")
      .select("updated_at")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data?.updated_at) lastmod = String(data.updated_at).slice(0, 10);
  } catch (err) {
    console.error("sitemap: failed to fetch CMS lastmod, falling back to today", err);
  }

  return new Response(buildXml(lastmod), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/xml; charset=utf-8",
      // Edge-cache for 5 min, allow stale for 1h while revalidating.
      "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
    },
  });
});
