// Pure sitemap helpers, safe to import from both Node scripts and Vitest (browser-like) tests.

export const BASE_URL = "https://www.bhiembassy.asia";

export interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

// Routes surfaced to the SEO sitemap scanner. Access for private/internal routes is controlled by robots.txt and auth.
export function getStaticEntries(lastmod: string): SitemapEntry[] {
  return [
    { path: "/", lastmod, changefreq: "weekly", priority: "1.0" },
    { path: "/home", lastmod, changefreq: "weekly", priority: "1.0" },
    { path: "/about", lastmod, changefreq: "monthly", priority: "0.8" },
    { path: "/services", lastmod, changefreq: "monthly", priority: "0.9" },
    { path: "/requirements", lastmod, changefreq: "monthly", priority: "0.9" },
    { path: "/apply", lastmod, changefreq: "monthly", priority: "0.9" },
    { path: "/track", lastmod, changefreq: "monthly", priority: "0.7" },
    { path: "/contact", lastmod, changefreq: "monthly", priority: "0.8" },
    { path: "/dns-setup", lastmod, changefreq: "monthly", priority: "0.2" },
    { path: "/admin/login", lastmod, changefreq: "monthly", priority: "0.1" },
    { path: "/admin", lastmod, changefreq: "monthly", priority: "0.1" },
    { path: "/dashboard", lastmod, changefreq: "monthly", priority: "0.1" },
  ];
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
