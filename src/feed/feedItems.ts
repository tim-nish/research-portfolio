import { SITE_URL } from "../seo/pageMeta";
import type { ContentRecord, ContentRegistry } from "../content/load";
import { isSiteProjection, type AnyArticleFrontmatter, type ArticleFrontmatter } from "../content/schema";

export interface FeedItem {
  id: string;
  title: string;
  /** ISO 8601 date-time, as Atom's `<updated>` requires. */
  updated: string;
  summary: string;
  link: string;
  /**
   * True for external-mode (link-only) entries — spec §8.3: "so followers see JP
   * output too." Informational only; `buildAtomFeed` doesn't render it differently.
   */
  isExternal?: boolean;
}

/**
 * Feed items from the content registry (spec §8.3): canonical articles as full
 * items (summary+link, per Story 1.9's recorded discretion choice), external-mode
 * articles as link-only items pointing straight at their external URL — the same
 * function Story 1.9 already built, extended here with zero new generator logic
 * (NFR8): `buildAtomFeed` doesn't need to know the difference.
 */
export function collectFeedItems(registry: ContentRegistry): FeedItem[] {
  // Projections enter the feed in Story 5.3; excluded meanwhile (see writingView).
  const articles = (registry.records.article as ContentRecord<AnyArticleFrontmatter>[]).filter(
    (record): record is ContentRecord<ArticleFrontmatter> => !isSiteProjection(record.data),
  );

  return [...articles]
    .sort((a, b) => b.data.date.localeCompare(a.data.date))
    .map((record) => {
      const isExternal = record.data.mode === "external";
      const link = isExternal ? record.data.external!.href : `${SITE_URL}/writing/${record.slug}/`;
      return {
        id: link,
        title: record.data.title,
        updated: `${record.data.updated ?? record.data.date}T00:00:00Z`,
        summary: record.data.summary,
        link,
        isExternal,
      };
    });
}
