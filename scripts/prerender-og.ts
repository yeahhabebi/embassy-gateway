// Postbuild: emit per-route HTML files under dist/ with route-specific
// og:title / og:description / og:url / canonical baked into the static head.
// This gives non-JS social crawlers (Slack, LinkedIn, Facebook) per-page previews.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, join } from "path";

const BASE_URL = "https://www.bhiembassy.asia";
const DIST = resolve("dist");
const SITE_NAME = "Embassy of Bosnia and Herzegovina - New Delhi";

interface RouteMeta {
  path: string;       // route path, e.g. "/about"
  title: string;      // final <title> (includes brand)
  description: string;
}

const routes: RouteMeta[] = [
  {
    path: "/",
    title: "Embassy of Bosnia and Herzegovina in New Delhi, India",
    description:
      "Official Embassy of Bosnia and Herzegovina in New Delhi. Visas, consular services, and BiH-India bilateral relations.",
  },
  {
    path: "/about",
    title: "About Bosnia and Herzegovina | BiH Embassy India",
    description:
      "Learn about Bosnia and Herzegovina — its history, culture, geography, and diplomatic relations with India.",
  },
  {
    path: "/services",
    title: "Consular Services | BiH Embassy India",
    description:
      "BiH Embassy consular services in New Delhi: visa applications, document legalisation, passport services, civil registration, and trade facilitation.",
  },
  {
    path: "/apply",
    title: "Visa Applications | BiH Embassy India",
    description:
      "Public online visa applications are currently unavailable. Please contact the Embassy of Bosnia and Herzegovina for assistance.",
  },
  {
    path: "/requirements",
    title: "Visa Requirements & Documents | BiH Embassy India",
    description:
      "Bosnia and Herzegovina visa requirements: passport, photos, financial proof, travel insurance. For tourist, business, student, and work visa applicants.",
  },
  {
    path: "/contact",
    title: "Contact Us – Embassy of Bosnia and Herzegovina",
    description:
      "Contact the Embassy of Bosnia and Herzegovina in New Delhi: address, phone, email, and office hours for visa and consular inquiries.",
  },
  {
    path: "/track",
    title: "Track Your Visa Application | BiH Embassy India",
    description:
      "Track your Bosnia and Herzegovina visa application status online. Enter your passport number and date of birth to check the current status.",
  },
];

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function patchHead(html: string, meta: RouteMeta): string {
  const url = `${BASE_URL}${meta.path}`;
  const title = escapeHtml(meta.title);
  const desc = escapeHtml(meta.description);
  const u = escapeHtml(url);

  let out = html;

  // <title>
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);

  // meta name="description"
  out = out.replace(
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${desc}" />`
  );

  // canonical
  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(out)) {
    out = out.replace(
      /<link\s+rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${u}" />`
    );
  } else {
    out = out.replace(/<\/head>/i, `  <link rel="canonical" href="${u}" />\n</head>`);
  }

  // og:title / og:description / og:url / og:site_name
  const ogReplace = (prop: string, content: string) => {
    const re = new RegExp(
      `<meta\\s+property=["']${prop}["'][^>]*>`,
      "i"
    );
    const tag = `<meta property="${prop}" content="${content}" />`;
    if (re.test(out)) {
      out = out.replace(re, tag);
    } else {
      out = out.replace(/<\/head>/i, `  ${tag}\n</head>`);
    }
  };
  ogReplace("og:title", title);
  ogReplace("og:description", desc);
  ogReplace("og:url", u);
  ogReplace("og:site_name", escapeHtml(SITE_NAME));
  ogReplace("og:type", "website");

  // twitter
  const twReplace = (name: string, content: string) => {
    const re = new RegExp(`<meta\\s+name=["']${name}["'][^>]*>`, "i");
    const tag = `<meta name="${name}" content="${content}" />`;
    if (re.test(out)) {
      out = out.replace(re, tag);
    } else {
      out = out.replace(/<\/head>/i, `  ${tag}\n</head>`);
    }
  };
  twReplace("twitter:title", title);
  twReplace("twitter:description", desc);
  twReplace("twitter:card", "summary_large_image");

  return out;
}

function main() {
  const indexPath = join(DIST, "index.html");
  if (!existsSync(indexPath)) {
    console.warn(`[prerender-og] ${indexPath} not found; skipping.`);
    return;
  }
  const baseHtml = readFileSync(indexPath, "utf8");

  for (const route of routes) {
    const html = patchHead(baseHtml, route);
    if (route.path === "/") {
      writeFileSync(indexPath, html);
      console.log(`[prerender-og] wrote dist/index.html (/) `);
      continue;
    }
    const dir = join(DIST, route.path.replace(/^\//, ""));
    mkdirSync(dir, { recursive: true });
    const outPath = join(dir, "index.html");
    writeFileSync(outPath, html);
    console.log(`[prerender-og] wrote ${outPath} (${route.path})`);
  }
}

main();
