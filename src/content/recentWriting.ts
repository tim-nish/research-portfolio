import type { ContentRecord, ContentRegistry } from "./load";
import type { ArticleFrontmatter } from "./schema";

export interface RecentWritingEntry {
  slug: string;
  title: string;
  date: string;
  language: "en" | "ja";
  platform?: string;
  href: string;
}

/**
 * Up to `limit` most-recent `article` records, canonical and external mixed (spec
 * §7.3 Home block 4). Queries the real registry rather than a hardcoded empty list,
 * so it's already correct once Epic 2 (Story 2.5) adds article content — no code
 * change to this function or the Home page is required then (NFR8).
 */
export function collectRecentWriting(registry: ContentRegistry, limit = 5): RecentWritingEntry[] {
  const records = registry.records.article as ContentRecord<ArticleFrontmatter>[];

  return [...records]
    .sort((a, b) => b.data.date.localeCompare(a.data.date))
    .slice(0, limit)
    .map((record) => ({
      slug: record.slug,
      title: record.data.title,
      date: record.data.date,
      language: record.data.language,
      platform: record.data.mode === "external" ? record.data.external?.platform : undefined,
      href: record.data.mode === "external" ? record.data.external!.href : `/writing/${record.slug}/`,
    }));
}
