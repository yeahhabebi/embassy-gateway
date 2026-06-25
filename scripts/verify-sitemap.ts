// Regenerates public/sitemap.xml and verifies every expected <loc> and a fresh <lastmod>
// are present. Run after a CMS edit:  bunx tsx scripts/verify-sitemap.ts
// Exits non-zero if anything is missing so it can gate a publish step.

import { writeFileSync, readFileSync } from "fs";
import { resolve } from "path";
import { BASE_URL, buildSitemap } from "./generate-sitemap";

async function main() {
  const { xml, entries, lastmod } = await buildSitemap();
  const out = resolve("public/sitemap.xml");
  writeFileSync(out, xml);

  const written = readFileSync(out, "utf8");
  const errors: string[] = [];

  for (const e of entries) {
    const loc = `<loc>${BASE_URL}${e.path}</loc>`;
    if (!written.includes(loc)) errors.push(`missing url: ${loc}`);
  }
  const lastmodTag = `<lastmod>${lastmod}</lastmod>`;
  if (!written.includes(lastmodTag)) errors.push(`missing lastmod: ${lastmodTag}`);

  if (errors.length) {
    console.error("❌ sitemap verification failed:");
    for (const err of errors) console.error("  -", err);
    process.exit(1);
  }
  console.log(
    `✅ sitemap verified — ${entries.length} urls, lastmod=${lastmod} (reflects latest CMS edit)`,
  );
}

main().catch((err) => {
  console.error("verify-sitemap crashed:", err);
  process.exit(1);
});
