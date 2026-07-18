import { describe, expect, it } from "vitest";
import { findCanonicalViolations } from "../canonicalGuard";
import { SITE_URL, buildPageMetaHtml } from "../pageMeta";

const BASE = "https://tim-nish.dev";

describe("findCanonicalViolations", () => {
  it("accepts canonicals and og:urls built from the canonical base", () => {
    const html = buildPageMetaHtml({
      title: "An Article",
      description: "d",
      path: "/writing/an-article/",
    });
    expect(findCanonicalViolations(html, SITE_URL)).toEqual([]);
  });

  it("flags a canonical built from the deployment host", () => {
    const html = '<link rel="canonical" href="https://tim-nish.github.io/writing/x/" />';
    expect(findCanonicalViolations(html, BASE)).toEqual(["https://tim-nish.github.io/writing/x/"]);
  });

  it("flags a relative canonical (it would resolve to whatever host serves the page)", () => {
    const html = '<link rel="canonical" href="/writing/x/" />';
    expect(findCanonicalViolations(html, BASE)).toEqual(["/writing/x/"]);
  });

  it("flags an og:url off the canonical base", () => {
    const html = '<meta property="og:url" content="https://example.com/x/" />';
    expect(findCanonicalViolations(html, BASE)).toEqual(["https://example.com/x/"]);
  });

  it("does not flag a base-prefix impostor domain", () => {
    const html = '<link rel="canonical" href="https://tim-nish.dev.evil.example/x/" />';
    expect(findCanonicalViolations(html, BASE)).toHaveLength(1);
  });

  it("ignores pages that emit no canonical or og:url at all", () => {
    expect(findCanonicalViolations("<title>404</title>", BASE)).toEqual([]);
  });
});
