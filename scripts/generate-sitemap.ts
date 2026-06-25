// Generates public/sitemap.xml. Runs before `vite dev` / `vite build` (predev/prebuild)
// and is also invoked by scripts/verify-sitemap.ts after CMS edits.

import { writeFileSync } from "fs";
import { resolve } from "path";

export const BASE_URL = "https://www.bhiembassy.asia";

export interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const today = () => new Date().toISOString().slice(0, 10);

// Public, indexable routes. Admin, /dns-setup, and 404 are intentionally excluded.
export function getStaticEntries(lastmod: string): SitemapEntry[] {
  return [
    { path: "/", lastmod, changefreq: "weekly", priority: "1.0" },
    { path: "/about", lastmod, changefreq: "monthly", priority: "0.8" },
    { path: "/services", lastmod, changefreq: "monthly", priority: "0.9" },
    { path: "/requirements", lastmod, changefreq: "monthly", priority: "0.9" },
    { path: "/apply", lastmod, changefreq: "monthly", priority: "0.9" },
    { path: "/track", lastmod, changefreq: "monthly", priority: "0.7" },
    { path: "/contact", lastmod, changefreq: "monthly", priority: "0.8" },
  ];
}

export async function fetchCmsLastmod(): Promise<string | null> {
  const url = process.env.VITE_SUPABASE_URL ?? "https://obxqbuafuvgyyznmzeqi.supabase.co";
  const key =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ieHFidWFmdXZneXl6bm16ZXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MzYzNjMsImV4cCI6MjA3OTUxMjM2M30.YMb5luVLM30FBjQq34vgp76jghLg_mHs1BqCRJ2Vhs0";
  try {
    const res = await fetch(
      `${url}/rest/v1/cms_content?select=updated_at&order=updated_at.desc&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<{ updated_at?: string }>;
    return rows[0]?.updated_at?.slice(0, 10) ?? null;
  } catch {
    return null;
  }
}

export function generateSitemap(items: SitemapEntry[]): string {
  const urls = items.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
    ``,
  ].join("\n");
}

export async function buildSitemap(): Promise<{ xml: string; entries: SitemapEntry[]; lastmod: string }> {
  const cmsLastmod = await fetchCmsLastmod();
  const lastmod = cmsLastmod ?? today();
  const entries = getStaticEntries(lastmod);
  return { xml: generateSitemap(entries), entries, lastmod };
}

// CLI entry: run directly to write public/sitemap.xml.
const invokedDirectly = import.meta.url === `file://${process.argv[1]}`;
if (invokedDirectly) {
  buildSitemap().then(({ xml, entries, lastmod }) => {
    writeFileSync(resolve("public/sitemap.xml"), xml);
    console.log(`sitemap.xml written (${entries.length} entries, lastmod=${lastmod})`);
  });
}
