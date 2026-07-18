import { SITE_URL } from "../seo/pageMeta";
import type { ContentRecord, ContentRegistry } from "../content/load";
import { isSiteProjection, type AnyArticleFrontmatter } from "../content/schema";

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
  const articles = registry.records.article as ContentRecord<AnyArticleFrontmatter>[];

  return articles
    .map((record) => {
      const data = record.data;
      // Site-canonical projections carry no summary field; the title stands in
      // (mode rule: site-canonical entries may carry a summary, external never a body).
      if (isSiteProjection(data)) {
        const link = `${SITE_URL}/writing/${record.slug}/`;
        return {
          id: link,
          title: data.title,
          updated: `${data.published}T00:00:00Z`,
          summary: data.title,
          link,
          isExternal: false,
        };
      }
      const isExternal = data.mode === "external";
      const link = isExternal ? data.external!.href : `${SITE_URL}/writing/${record.slug}/`;
      return {
        id: link,
        title: data.title,
        updated: `${data.updated ?? data.date}T00:00:00Z`,
        summary: data.summary,
        link,
        isExternal,
      };
    })
    .sort((a, b) => b.updated.localeCompare(a.updated));
}
