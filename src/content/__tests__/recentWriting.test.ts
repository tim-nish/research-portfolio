import { describe, expect, it } from "vitest";
import { collectRecentWriting } from "../recentWriting";
import type { ContentRecord, ContentRegistry } from "../load";
import type { ArticleFrontmatter } from "../schema";

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

describe("collectRecentWriting", () => {
  it("returns an empty list when there are no article records yet (pre-Epic 2)", () => {
    expect(collectRecentWriting(emptyRegistry())).toEqual([]);
  });

  it("mixes canonical and external articles, newest first, capped at the limit", () => {
    const registry = emptyRegistry();
    registry.records.article.push(
      article({ slug: "old-canonical", title: "Old Canonical", date: "2026-01-01", mode: "canonical", language: "en" }),
      article({
        slug: "new-external",
        title: "New External",
        date: "2026-06-01",
        mode: "external",
        language: "ja",
        external: { href: "https://zenn.dev/example/new-external", platform: "zenn" },
      }),
    );

    const result = collectRecentWriting(registry, 1);

    expect(result).toEqual([
      {
        slug: "new-external",
        title: "New External",
        date: "2026-06-01",
        language: "ja",
        platform: "zenn",
        href: "https://zenn.dev/example/new-external",
      },
    ]);
  });

  it("links canonical articles on-site and external articles straight out", () => {
    const registry = emptyRegistry();
    registry.records.article.push(
      article({ slug: "canonical-piece", title: "Canonical Piece", date: "2026-01-01", mode: "canonical", language: "en" }),
    );

    expect(collectRecentWriting(registry)[0].href).toBe("/writing/canonical-piece/");
  });
});
