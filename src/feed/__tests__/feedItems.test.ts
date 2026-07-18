import { describe, expect, it } from "vitest";
import { collectFeedItems } from "../feedItems";
import type { ContentRecord, ContentRegistry } from "../../content/load";
import type { ArticleFrontmatter } from "../../content/schema";

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

function article(data: Record<string, unknown>): ContentRecord<ArticleFrontmatter> {
  return {
    type: "article",
    slug: data.slug as string,
    filePath: `${data.slug}.md`,
    data: data as unknown as ArticleFrontmatter,
    body: "",
    bodyHtml: "",
  };
}

describe("collectFeedItems", () => {
  it("returns an empty list when there are no articles yet (pre-Epic 2)", () => {
    expect(collectFeedItems(emptyRegistry())).toEqual([]);
  });

  it("includes variant: site projections as on-site items with no external flag", () => {
    const registry = emptyRegistry();
    registry.records.article.push(
      article({ slug: "legacy", title: "Legacy", date: "2026-01-01", mode: "canonical", language: "en", summary: "s" }),
      article({
        slug: "projection",
        title: "Projection Title",
        variant: "site",
        source: "articles@a1b2c3d",
        language: "en",
        published: "2026-07-18",
        generated_by: "tool@1.0.0",
      }),
    );

    const items = collectFeedItems(registry);

    expect(items.map((i) => i.title)).toEqual(["Projection Title", "Legacy"]);
    const projection = items[0];
    expect(projection.link).toMatch(/\/writing\/projection\/$/);
    expect(projection.isExternal).toBe(false);
    expect(projection.updated).toBe("2026-07-18T00:00:00Z");
    // No body in the feed entry — the summary slot carries the title.
    expect(projection.summary).toBe("Projection Title");
  });

  it("includes both canonical and external-mode articles, newest first", () => {
    const registry = emptyRegistry();
    registry.records.article.push(
      article({ slug: "old", title: "Old", date: "2026-01-01", mode: "canonical", language: "en", summary: "Old summary." }),
      article({
        slug: "external",
        title: "External",
        date: "2026-03-01",
        mode: "external",
        language: "ja",
        summary: "External summary.",
        external: { href: "https://zenn.dev/example/external", platform: "zenn" },
      }),
      article({ slug: "new", title: "New", date: "2026-02-01", mode: "canonical", language: "en", summary: "New summary." }),
    );

    const items = collectFeedItems(registry);

    expect(items.map((item) => item.title)).toEqual(["External", "New", "Old"]);
    expect(items.find((i) => i.title === "New")?.link).toBe("https://tim-nish.dev/writing/new/");
  });

  it("links external-mode entries straight to their external URL and marks them isExternal", () => {
    const registry = emptyRegistry();
    registry.records.article.push(
      article({
        slug: "external",
        title: "External",
        date: "2026-03-01",
        mode: "external",
        language: "ja",
        summary: "External summary.",
        external: { href: "https://zenn.dev/example/external", platform: "zenn" },
      }),
    );

    const [item] = collectFeedItems(registry);

    expect(item.link).toBe("https://zenn.dev/example/external");
    expect(item.id).toBe("https://zenn.dev/example/external");
    expect(item.isExternal).toBe(true);
  });

  it("marks canonical entries as not external", () => {
    const registry = emptyRegistry();
    registry.records.article.push(
      article({ slug: "canonical", title: "Canonical", date: "2026-01-01", mode: "canonical", language: "en", summary: "x" }),
    );

    expect(collectFeedItems(registry)[0].isExternal).toBe(false);
  });
});
