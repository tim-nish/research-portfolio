import fs from "node:fs";
import { load } from "js-yaml";

export interface RedirectEntry {
  source: string;
  destination: string;
}

export function loadRedirects(filePath: string): RedirectEntry[] {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = load(raw) as RedirectEntry[] | null;
  return parsed ?? [];
}

/**
 * Static redirect stub (docs/architecture.md §7, D-9): `rel=canonical` + meta-refresh
 * + a plain fallback link, so the source URL still works with JS disabled and even
 * with meta-refresh ignored. Served as HTTP 200 (GitHub Pages can't do real 3xx for
 * static files) — search engines and browsers still resolve via the canonical tag
 * and meta-refresh.
 */
export function buildRedirectStubHtml(destination: string, stylesheetHref?: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="canonical" href="${destination}" />
    <meta http-equiv="refresh" content="0; url=${destination}" />
    ${stylesheetHref ? `<link rel="stylesheet" href="${stylesheetHref}" />` : ""}
    <title>Redirecting…</title>
  </head>
  <body>
    <main>
      <p>This page has moved. <a href="${destination}">Continue to the new location</a>.</p>
    </main>
  </body>
</html>
`;
}
