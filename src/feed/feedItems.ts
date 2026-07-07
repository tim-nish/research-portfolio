import { SITE_URL } from "../seo/pageMeta";
import type { ContentRecord, ContentRegistry } from "../content/load";
import type { ArticleFrontmatter } from "../content/schema";

export interface FeedItem {
  id: string;
  title: string;
  /** ISO 8601 date-time, as Atom's `<updated>` requires. */
  updated: string;
  summary: string;
  link: string;
}

/**
 * Feed items from the content registry (spec §8.3). Phase 1 scope is canonical
 * articles only, full items (summary+link, per this story's recorded discretion
 * choice) — external-mode articles as link-only items is Story 2.4's addition,
 * layered onto this same function without new generator logic (NFR8).
 */
export function collectFeedItems(registry: ContentRegistry): FeedItem[] {
  const articles = registry.records.article as ContentRecord<ArticleFrontmatter>[];

  return articles
    .filter((record) => record.data.mode === "canonical")
    .sort((a, b) => b.data.date.localeCompare(a.data.date))
    .map((record) => {
      const link = `${SITE_URL}/writing/${record.slug}/`;
      return {
        id: link,
        title: record.data.title,
        updated: `${record.data.updated ?? record.data.date}T00:00:00Z`,
        summary: record.data.summary,
        link,
      };
    });
}
