import type { ContentRecord, ContentRegistry } from "./load";
import { isSiteProjection, type AnyArticleFrontmatter, type ArticleFrontmatter } from "./schema";

export interface WritingEntry {
  slug: string;
  title: string;
  date: string;
  summary: string;
  language: "en" | "ja";
  mode: "canonical" | "external";
  platform?: string;
  topics: string[];
  href: string;
}

/** The full unified writing list for `/writing/` (spec §7.3) — canonical and external mixed, newest first. No cap (unlike Home's recent-writing block). */
export function collectWritingEntries(registry: ContentRegistry): WritingEntry[] {
  // variant: site projections render as detail pages (Story 5.2) but are not yet
  // integrated into the unified index — Story 5.3 does that; excluded here so a
  // committed projection can't crash the legacy-shaped sort/map below.
  const articles = (registry.records.article as ContentRecord<AnyArticleFrontmatter>[]).filter(
    (record): record is ContentRecord<ArticleFrontmatter> => !isSiteProjection(record.data),
  );

  return [...articles]
    .sort((a, b) => b.data.date.localeCompare(a.data.date))
    .map((record) => ({
      slug: record.slug,
      title: record.data.title,
      date: record.data.date,
      summary: record.data.summary,
      language: record.data.language,
      mode: record.data.mode,
      platform: record.data.mode === "external" ? record.data.external?.platform : undefined,
      topics: record.data.topics ?? [],
      href: record.data.mode === "external" ? record.data.external!.href : `/writing/${record.slug}/`,
    }));
}
