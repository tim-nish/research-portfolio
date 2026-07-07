import { describe, expect, it } from "vitest";
import { buildRobotsTxt, buildSitemapXml } from "../sitemap";

describe("buildSitemapXml", () => {
  it("emits one <url><loc> entry per route, prefixed with the site URL", () => {
    const xml = buildSitemapXml(["/", "/about/", "/projects/"]);

    expect(xml).toContain("<loc>https://tim-nish.dev/</loc>");
    expect(xml).toContain("<loc>https://tim-nish.dev/about/</loc>");
    expect(xml).toContain("<loc>https://tim-nish.dev/projects/</loc>");
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  });

  it("produces a valid empty urlset when there are no routes yet", () => {
    const xml = buildSitemapXml([]);

    expect(xml).toContain("<urlset");
    expect(xml).not.toContain("<url>");
  });
});

describe("buildRobotsTxt", () => {
  it("is permissive and points at the sitemap", () => {
    const robotsTxt = buildRobotsTxt();

    expect(robotsTxt).toContain("Allow: /");
    expect(robotsTxt).toContain("Sitemap: https://tim-nish.dev/sitemap.xml");
    expect(robotsTxt).not.toContain("Disallow");
  });
});
