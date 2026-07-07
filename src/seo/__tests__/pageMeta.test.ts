import { describe, expect, it } from "vitest";
import { buildPageMetaHtml, personJsonLd } from "../pageMeta";

describe("buildPageMetaHtml", () => {
  it("follows the `<Page/Entity> — <Owner name>` title pattern and emits a canonical tag", () => {
    const html = buildPageMetaHtml({ title: "About", description: "A description.", path: "/about/" });

    expect(html).toContain("<title>About — Tomoya Imanishi</title>");
    expect(html).toContain('<link rel="canonical" href="https://tim-nish.dev/about/" />');
    expect(html).toContain('<meta name="description" content="A description." />');
  });

  it("embeds each JSON-LD block as its own script tag", () => {
    const html = buildPageMetaHtml({
      title: "About",
      description: "A description.",
      path: "/about/",
      jsonLd: { "@type": "Person", name: "Someone" },
    });

    expect(html).toContain('<script type="application/ld+json">{"@type":"Person","name":"Someone"}</script>');
  });

  it("escapes double quotes in title/description to keep attributes well-formed", () => {
    const html = buildPageMetaHtml({ title: 'Say "hi"', description: 'A "quoted" description.', path: "/x/" });

    expect(html).toContain("Say &quot;hi&quot;");
    expect(html).toContain("A &quot;quoted&quot; description.");
  });
});

describe("personJsonLd", () => {
  it("excludes mailto: links from sameAs", () => {
    const jsonLd = personJsonLd({
      name: "Someone",
      positioning: "Doing things.",
      identityLinks: [
        { label: "GitHub", href: "https://github.com/example" },
        { label: "Email", href: "mailto:someone@example.com" },
      ],
    });

    expect(jsonLd.sameAs).toEqual(["https://github.com/example"]);
  });
});
