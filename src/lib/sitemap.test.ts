import { describe, it, expect } from "vitest";
import { BASE_URL, generateSitemap, getStaticEntries } from "../../scripts/generate-sitemap";

describe("sitemap generator", () => {
  const lastmod = "2026-06-25";
  const entries = getStaticEntries(lastmod);
  const xml = generateSitemap(entries);

  it("includes every static route as a <loc>", () => {
    for (const e of entries) {
      expect(xml).toContain(`<loc>${BASE_URL}${e.path}</loc>`);
    }
  });

  it("stamps every entry with the supplied <lastmod>", () => {
    const occurrences = xml.split(`<lastmod>${lastmod}</lastmod>`).length - 1;
    expect(occurrences).toBe(entries.length);
  });

  it("produces a valid urlset envelope", () => {
    expect(xml.startsWith(`<?xml version="1.0" encoding="UTF-8"?>`)).toBe(true);
    expect(xml).toContain(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`);
    expect(xml.trim().endsWith(`</urlset>`)).toBe(true);
  });

  it("excludes admin and internal routes", () => {
    expect(xml).not.toContain("/admin");
    expect(xml).not.toContain("/dns-setup");
  });
});
