import { describe, expect, it } from "vitest";
import {
  articleJsonLd,
  buildPageMetaHtml,
  datasetJsonLd,
  personJsonLd,
  scholarlyArticleJsonLd,
  softwareApplicationJsonLd,
} from "../pageMeta";

describe("buildPageMetaHtml", () => {
  it("follows the `<Page/Entity> — <Owner name>` title pattern and emits a canonical tag", () => {
    const html = buildPageMetaHtml({ title: "About", description: "A description.", path: "/about/" });

    expect(html).toContain("<title>About — Tomoya Imanishi</title>");
    expect(html).toContain('<link rel="canonical" href="https://tim-nish.dev/about/" />');
    expect(html).toContain('<meta name="description" content="A description." />');
  });

  it("uses rawTitle verbatim for Home's `<Owner name> — <positioning fragment>` pattern", () => {
    const html = buildPageMetaHtml({
      title: "ignored",
      rawTitle: "Tomoya Imanishi — Building agentic AI systems",
      description: "A description.",
      path: "/",
    });

    expect(html).toContain("<title>Tomoya Imanishi — Building agentic AI systems</title>");
    expect(html).not.toContain("ignored");
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

describe("datasetJsonLd", () => {
  it("builds a Dataset-typed block with one DataDownload distribution entry per dataset link", () => {
    const jsonLd = datasetJsonLd({
      title: "QuantScenarioBench",
      summary: "A benchmark.",
      path: "/projects/quantscenariobench/",
      datasetLinks: [{ label: "Datasets", href: "https://huggingface.co/QuantScenarioBench" }],
    });

    expect(jsonLd["@type"]).toBe("Dataset");
    expect(jsonLd.url).toBe("https://tim-nish.dev/projects/quantscenariobench/");
    expect(jsonLd.distribution).toEqual([
      { "@type": "DataDownload", name: "Datasets", contentUrl: "https://huggingface.co/QuantScenarioBench" },
    ]);
    expect(jsonLd).not.toHaveProperty("citation");
  });

  it("includes citation only when present", () => {
    const jsonLd = datasetJsonLd({
      title: "QuantScenarioBench",
      summary: "A benchmark.",
      path: "/projects/quantscenariobench/",
      datasetLinks: [],
      citation: "@misc{qsb2026}",
    });

    expect(jsonLd.citation).toBe("@misc{qsb2026}");
  });
});

describe("scholarlyArticleJsonLd", () => {
  it("builds a ScholarlyArticle block with each author as a Person", () => {
    const jsonLd = scholarlyArticleJsonLd({
      title: "A Fixture Paper",
      authors: ["Tomoya Imanishi", "A Collaborator"],
      venue: "arXiv",
      year: 2026,
      path: "/publications/a-fixture-paper/",
      citation: "@misc{fixture2026}",
    });

    expect(jsonLd["@type"]).toBe("ScholarlyArticle");
    expect(jsonLd.author).toEqual([
      { "@type": "Person", name: "Tomoya Imanishi" },
      { "@type": "Person", name: "A Collaborator" },
    ]);
    expect(jsonLd.url).toBe("https://tim-nish.dev/publications/a-fixture-paper/");
  });
});

describe("softwareApplicationJsonLd", () => {
  it("builds a SoftwareApplication block with an Offer when pricing is known", () => {
    const jsonLd = softwareApplicationJsonLd({
      title: "A Fixture Product",
      summary: "Solves a fixture pain.",
      path: "/products/fixture-product/",
      pricing: "freemium",
    });

    expect(jsonLd["@type"]).toBe("SoftwareApplication");
    expect(jsonLd.offers).toEqual({ "@type": "Offer", category: "freemium" });
  });

  it("omits offers when pricing is tbd", () => {
    const jsonLd = softwareApplicationJsonLd({
      title: "A Fixture Product",
      summary: "Solves a fixture pain.",
      path: "/products/fixture-product/",
      pricing: "tbd",
    });

    expect(jsonLd).not.toHaveProperty("offers");
  });
});

describe("articleJsonLd", () => {
  it("includes dateModified only when the article has been updated", () => {
    const withUpdate = articleJsonLd({
      title: "A Fixture Article",
      date: "2026-01-01",
      updated: "2026-02-01",
      path: "/writing/a-fixture-article/",
      authorName: "Tomoya Imanishi",
    });
    const withoutUpdate = articleJsonLd({
      title: "A Fixture Article",
      date: "2026-01-01",
      path: "/writing/a-fixture-article/",
      authorName: "Tomoya Imanishi",
    });

    expect(withUpdate.dateModified).toBe("2026-02-01");
    expect(withoutUpdate).not.toHaveProperty("dateModified");
  });
});
