import { describe, expect, it } from "vitest";
import { collectFeaturedWork } from "../featuredWork";
import type { ContentRecord, ContentRegistry } from "../load";

function emptyRegistry(): ContentRegistry {
  const empty = {
    profile: [],
    project: [],
    product: [],
    publication: [],
    article: [],
    "newsletter-issue": [],
  };
  return {
    records: structuredClone(empty) as ContentRegistry["records"],
    bySlug: structuredClone(empty) as unknown as ContentRegistry["bySlug"],
    relatedBy: structuredClone(empty) as unknown as ContentRegistry["relatedBy"],
  };
}

function record(type: "project" | "product" | "publication", data: Record<string, unknown>): ContentRecord {
  return { type, slug: data.slug as string, filePath: `${data.slug}.md`, data, body: "", bodyHtml: "" };
}

describe("collectFeaturedWork", () => {
  it("is type-agnostic: collects featured: true records across project/product/publication", () => {
    const registry = emptyRegistry();
    registry.records.project.push(
      record("project", { slug: "p1", title: "Project One", summary: "A project.", started: "2026-01", featured: true }),
    );
    registry.records.product.push(
      record("product", { slug: "prod1", title: "Product One", summary: "A product.", launched: "2026-03", featured: true }),
    );
    registry.records.publication.push(
      record("publication", { slug: "pub1", title: "Paper One", venue: "arXiv", year: 2026, featured: true }),
    );

    const result = collectFeaturedWork(registry);

    expect(result.map((item) => item.type).sort()).toEqual(["product", "project", "publication"]);
  });

  it("excludes records without featured: true", () => {
    const registry = emptyRegistry();
    registry.records.project.push(
      record("project", { slug: "not-featured", title: "Not Featured", summary: "x", started: "2026-01" }),
    );

    expect(collectFeaturedWork(registry)).toEqual([]);
  });

  it("orders by each type's own recency field descending, and caps at the limit", () => {
    const registry = emptyRegistry();
    registry.records.project.push(
      record("project", { slug: "older", title: "Older", summary: "x", started: "2024-01", featured: true }),
      record("project", { slug: "newer", title: "Newer", summary: "x", started: "2026-06", featured: true }),
    );
    registry.records.publication.push(
      record("publication", { slug: "mid", title: "Mid", venue: "arXiv", year: 2025, featured: true }),
    );

    const result = collectFeaturedWork(registry, 2);

    expect(result.map((item) => item.slug)).toEqual(["newer", "mid"]);
  });

  it("synthesizes a venue/year summary for publications, which have no summary field", () => {
    const registry = emptyRegistry();
    registry.records.publication.push(
      record("publication", { slug: "pub1", title: "Paper One", venue: "arXiv", year: 2026, featured: true }),
    );

    expect(collectFeaturedWork(registry)[0].summary).toBe("arXiv, 2026");
  });
});
