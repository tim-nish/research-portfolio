import type { ContentRecord, ContentRegistry } from "./load";
import { isSiteProjection, type AnyArticleFrontmatter } from "./schema";

export interface RecentWritingEntry {
  slug: string;
  title: string;
  date: string;
  language: "en" | "ja";
  platform?: string;
  href: string;
}

/**
 * Up to `limit` most-recent `article` records — legacy canonical, external, and
 * site-canonical projections mixed (spec §7.3 Home block 4). Projections date by
 * their `published` frontmatter and link on-site like canonical entries.
 */
export function collectRecentWriting(registry: ContentRegistry, limit = 5): RecentWritingEntry[] {
  const records = registry.records.article as ContentRecord<AnyArticleFrontmatter>[];

  return records
    .map((record) => {
      const data = record.data;
      if (isSiteProjection(data)) {
        return {
          slug: record.slug,
          title: data.title,
          date: data.published,
          language: data.language,
          platform: undefined as string | undefined,
          href: `/writing/${record.slug}/`,
        };
      }
      return {
        slug: record.slug,
        title: data.title,
        date: data.date,
        language: data.language,
        platform: data.mode === "external" ? data.external?.platform : undefined,
        href: data.mode === "external" ? data.external!.href : `/writing/${record.slug}/`,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}
