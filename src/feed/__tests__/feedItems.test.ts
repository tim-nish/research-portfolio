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

  it("includes only canonical-mode articles, newest first (Phase 1 scope)", () => {
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

    expect(items.map((item) => item.title)).toEqual(["New", "Old"]);
    expect(items[0].link).toBe("https://tim-nish.dev/writing/new/");
  });
});
