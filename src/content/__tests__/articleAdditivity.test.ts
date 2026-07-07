import { describe, expect, it } from "vitest";
import { collectRecentWriting } from "../recentWriting";
import { collectWritingEntries } from "../writingView";
import { collectFeedItems } from "../../feed/feedItems";
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

/**
 * Story 2.5's actual scope: prove that a single new `article` content file — the
 * shape a real Zenn backfill record would take — is automatically picked up by
 * Home's recent-writing block (Story 1.6), `/writing/` (Story 2.2), and `feed.xml`
 * (Story 2.4), through the same shared query functions, with no per-story
 * special-casing. (Real Zenn URLs/titles/dates are deferred until the owner
 * supplies its actual catalog — see docs/stories/2.5.md's completion notes; nothing
 * here is fabricated content.)
 */
describe("adding one external article record — NFR8 additivity", () => {
  const registry = emptyRegistry();
  registry.records.article.push(
    article({
      slug: "example-zenn-backfill",
      title: "Example Zenn Backfill Entry",
      date: "2026-05-01",
      mode: "external",
      language: "ja",
      summary: "A representative external record, shaped like a real Zenn backfill entry.",
      external: { href: "https://zenn.dev/example/example-zenn-backfill", platform: "zenn" },
    }),
  );

  it("is picked up by Home's recent-writing query", () => {
    const entries = collectRecentWriting(registry);

    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      title: "Example Zenn Backfill Entry",
      language: "ja",
      platform: "zenn",
      href: "https://zenn.dev/example/example-zenn-backfill",
    });
  });

  it("is picked up by the /writing/ unified query", () => {
    const entries = collectWritingEntries(registry);

    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      title: "Example Zenn Backfill Entry",
      mode: "external",
      platform: "zenn",
    });
  });

  it("is picked up by the feed query, as a link-only item", () => {
    const items = collectFeedItems(registry);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      title: "Example Zenn Backfill Entry",
      link: "https://zenn.dev/example/example-zenn-backfill",
      isExternal: true,
    });
  });
});
