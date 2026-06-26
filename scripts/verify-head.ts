// Postbuild check: every prerendered route must have a unique <title>
// and a self-referencing <link rel="canonical">. Fails the build on
// duplicates, missing tags, or canonical/route mismatch.

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { resolve, join, relative } from "path";

const BASE_URL = "https://www.bhiembassy.asia";
const DIST = resolve("dist");

interface PageHead {
  file: string;
  route: string;
  title: string | null;
  canonical: string | null;
}

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, acc);
    else if (entry === "index.html") acc.push(p);
  }
  return acc;
}

function fileToRoute(file: string): string {
  const rel = relative(DIST, file).replace(/\\/g, "/");
  if (rel === "index.html") return "/";
  return "/" + rel.replace(/\/index\.html$/, "");
}

function extract(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

function main() {
  if (!existsSync(DIST)) {
    console.warn(`[verify-head] ${DIST} not found; skipping.`);
    return;
  }
  const files = walk(DIST);
  const pages: PageHead[] = files.map((file) => {
    const html = readFileSync(file, "utf8");
    return {
      file,
      route: fileToRoute(file),
      title: extract(html, /<title>([\s\S]*?)<\/title>/i),
      canonical: extract(
        html,
        /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i
      ),
    };
  });

  const errors: string[] = [];

  // Missing tags
  for (const p of pages) {
    if (!p.title) errors.push(`${p.route}: missing <title>`);
    if (!p.canonical) errors.push(`${p.route}: missing <link rel="canonical">`);
  }

  // Duplicate titles
  const byTitle = new Map<string, string[]>();
  for (const p of pages) {
    if (!p.title) continue;
    byTitle.set(p.title, [...(byTitle.get(p.title) ?? []), p.route]);
  }
  for (const [title, routes] of byTitle) {
    if (routes.length > 1) {
      errors.push(`duplicate <title> "${title}" on routes: ${routes.join(", ")}`);
    }
  }

  // Duplicate canonicals
  const byCanon = new Map<string, string[]>();
  for (const p of pages) {
    if (!p.canonical) continue;
    byCanon.set(p.canonical, [...(byCanon.get(p.canonical) ?? []), p.route]);
  }
  for (const [canon, routes] of byCanon) {
    if (routes.length > 1) {
      errors.push(`duplicate canonical "${canon}" on routes: ${routes.join(", ")}`);
    }
  }

  // Canonical must self-reference the route
  for (const p of pages) {
    if (!p.canonical) continue;
    const expected = `${BASE_URL}${p.route}`;
    const expectedAlt = p.route === "/" ? BASE_URL : `${expected}/`;
    if (p.canonical !== expected && p.canonical !== expectedAlt) {
      errors.push(
        `${p.route}: canonical "${p.canonical}" does not self-reference (expected "${expected}")`
      );
    }
  }

  if (errors.length) {
    console.error("[verify-head] FAILED:\n  - " + errors.join("\n  - "));
    process.exit(1);
  }

  console.log(
    `[verify-head] OK — ${pages.length} route(s), all titles and canonicals unique and self-referencing.`
  );
}

main();
