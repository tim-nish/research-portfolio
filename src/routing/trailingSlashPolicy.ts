/**
 * Site-wide trailing-slash policy (spec §7.1: "consistent site-wide", implementer's
 * choice): every generated content route ends with "/". Enforced once, here, as a
 * build-time assertion — not trusted per-page — so a future page generator can't
 * silently introduce an inconsistent URL shape.
 *
 * Exceptions: `/404` (spec's own URL taxonomy lists it without a trailing slash) and
 * non-HTML file routes (feed.xml, sitemap.xml, robots.txt), which aren't part of the
 * HTML-page trailing-slash convention in the first place.
 */
const EXEMPT_ROUTES = new Set(["/404"]);
const EXEMPT_EXTENSIONS = [".xml", ".txt"];

export function assertTrailingSlashPolicy(route: string): void {
  if (EXEMPT_ROUTES.has(route)) return;
  if (EXEMPT_EXTENSIONS.some((ext) => route.endsWith(ext))) return;

  if (!route.endsWith("/")) {
    throw new Error(
      `Trailing-slash policy violation: route "${route}" must end with "/" (spec §7.1). ` +
        `If this is a legitimate exception, add it to EXEMPT_ROUTES in trailingSlashPolicy.ts.`,
    );
  }
}
