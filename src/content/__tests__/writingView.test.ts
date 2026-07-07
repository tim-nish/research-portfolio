import { describe, expect, it } from "vitest";
import { collectWritingEntries } from "../writingView";
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

describe("collectWritingEntries", () => {
  it("mixes canonical and external articles, newest first, uncapped", () => {
    const registry = emptyRegistry();
    registry.records.article.push(
      article({ slug: "old", title: "Old", date: "2026-01-01", mode: "canonical", language: "en", summary: "x" }),
      article({
        slug: "new",
        title: "New",
        date: "2026-06-01",
        mode: "external",
        language: "ja",
        summary: "y",
        external: { href: "https://zenn.dev/example/new", platform: "zenn" },
      }),
    );

    const entries = collectWritingEntries(registry);

    expect(entries.map((e) => e.slug)).toEqual(["new", "old"]);
  });

  it("links canonical entries on-site and external entries straight out", () => {
    const registry = emptyRegistry();
    registry.records.article.push(
      article({ slug: "canonical-piece", title: "Canonical", date: "2026-01-01", mode: "canonical", language: "en", summary: "x" }),
      article({
        slug: "external-piece",
        title: "External",
        date: "2026-02-01",
        mode: "external",
        language: "ja",
        summary: "y",
        external: { href: "https://zenn.dev/example/piece", platform: "zenn" },
      }),
    );

    const entries = collectWritingEntries(registry);

    expect(entries.find((e) => e.slug === "canonical-piece")?.href).toBe("/writing/canonical-piece/");
    expect(entries.find((e) => e.slug === "external-piece")?.href).toBe("https://zenn.dev/example/piece");
    expect(entries.find((e) => e.slug === "external-piece")?.platform).toBe("zenn");
  });
});
