// Generates public/sitemap.xml. Runs before `vite dev` / `vite build` (predev/prebuild)
// and is also invoked by scripts/verify-sitemap.ts after CMS edits.

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import {
  BASE_URL,
  generateSitemap,
  getStaticEntries,
  type SitemapEntry,
} from "../src/lib/sitemap";

export { BASE_URL, generateSitemap, getStaticEntries };
export type { SitemapEntry };

const today = () => new Date().toISOString().slice(0, 10);

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

export async function buildSitemap(): Promise<{
  xml: string;
  entries: SitemapEntry[];
  lastmod: string;
}> {
  const cmsLastmod = await fetchCmsLastmod();
  const lastmod = cmsLastmod ?? today();
  const entries = getStaticEntries(lastmod);
  return { xml: generateSitemap(entries), entries, lastmod };
}

const invokedDirectly = import.meta.url === `file://${process.argv[1]}`;
if (invokedDirectly) {
  buildSitemap().then(({ xml, entries, lastmod }) => {
    writeFileSync(resolve("public/sitemap.xml"), xml);
    console.log(`sitemap.xml written (${entries.length} entries, lastmod=${lastmod})`);
  });
}
