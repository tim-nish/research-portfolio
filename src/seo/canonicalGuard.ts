/**
 * Canonical-base guard (docs/article-publishing-spec.md §4, Story 5.5): every
 * `rel=canonical` and `og:url` the build emits must be built from the configured
 * canonical base — tim-nish.dev — never from the deployment host. The generator
 * runs this over every written HTML page after generation, so a hardcoded host
 * (or a relative canonical, which would resolve to whatever host serves the
 * page) fails the build instead of shipping.
 */
export function findCanonicalViolations(html: string, canonicalBase: string): string[] {
  const hrefs = [
    ...html.matchAll(/<link rel="canonical" href="([^"]*)"/g),
    ...html.matchAll(/<meta property="og:url" content="([^"]*)"/g),
  ].map((match) => match[1]);

  return hrefs.filter((href) => !href.startsWith(`${canonicalBase}/`) && href !== canonicalBase);
}
