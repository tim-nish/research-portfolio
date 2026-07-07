import { SITE_URL } from "./pageMeta";

/** Builds `/sitemap.xml` from the list of routes actually generated at build time (spec §8.2, FR8). */
export function buildSitemapXml(routes: string[]): string {
  const urls = routes
    .map((route) => `  <url>\n    <loc>${SITE_URL}${route}</loc>\n  </url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/** Permissive `robots.txt` pointing at the sitemap (spec §8.2). */
export function buildRobotsTxt(): string {
  return `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}
