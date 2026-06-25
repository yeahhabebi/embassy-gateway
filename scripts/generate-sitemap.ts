// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
// Re-run automatically when routes change or CMS content is edited (dev/build hooks).

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://www.bhiembassy.asia";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const today = new Date().toISOString().slice(0, 10);

// Public, indexable routes. Admin, /dns-setup, and 404 are intentionally excluded.
const entries: SitemapEntry[] = [
  { path: "/", lastmod: today, changefreq: "weekly", priority: "1.0" },
  { path: "/about", lastmod: today, changefreq: "monthly", priority: "0.8" },
  { path: "/services", lastmod: today, changefreq: "monthly", priority: "0.9" },
  { path: "/requirements", lastmod: today, changefreq: "monthly", priority: "0.9" },
  { path: "/apply", lastmod: today, changefreq: "monthly", priority: "0.9" },
  { path: "/track", lastmod: today, changefreq: "monthly", priority: "0.7" },
  { path: "/contact", lastmod: today, changefreq: "monthly", priority: "0.8" },
];

// Pull lastmod from CMS so the sitemap refreshes whenever editable content changes.
async function fetchCmsLastmod(): Promise<string | null> {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
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

function generateSitemap(items: SitemapEntry[]) {
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

async function main() {
  const cmsLastmod = await fetchCmsLastmod();
  const finalEntries = cmsLastmod
    ? entries.map((e) => ({ ...e, lastmod: cmsLastmod }))
    : entries;

  writeFileSync(resolve("public/sitemap.xml"), generateSitemap(finalEntries));
  console.log(
    `sitemap.xml written (${finalEntries.length} entries, lastmod=${cmsLastmod ?? today})`,
  );
}

main();
