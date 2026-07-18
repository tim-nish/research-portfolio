import type { ContentRecord, ContentRegistry } from "./load";
import { isSiteProjection, type AnyArticleFrontmatter } from "./schema";

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

/**
 * One WritingEntry per article record, any shape. Site-canonical projections
 * (docs/article-publishing-spec.md §1) present as on-site ("canonical") entries —
 * titled from frontmatter, dated by `published`, linking to their on-site page;
 * external records stay link-out entries. Slug uniqueness within the article type
 * (enforced at load) is what guarantees "one article appears exactly once".
 */
function toWritingEntry(record: ContentRecord<AnyArticleFrontmatter>): WritingEntry {
  const data = record.data;
  if (isSiteProjection(data)) {
    return {
      slug: record.slug,
      title: data.title,
      date: data.published,
      summary: "",
      language: data.language,
      mode: "canonical",
      topics: [],
      href: `/writing/${record.slug}/`,
    };
  }
  return {
    slug: record.slug,
    title: data.title,
    date: data.date,
    summary: data.summary,
    language: data.language,
    mode: data.mode,
    platform: data.mode === "external" ? data.external?.platform : undefined,
    topics: data.topics ?? [],
    href: data.mode === "external" ? data.external!.href : `/writing/${record.slug}/`,
  };
}

/** The full unified writing list for `/writing/` (spec §7.3) — both article modes mixed, newest first. No cap (unlike Home's recent-writing block). */
export function collectWritingEntries(registry: ContentRegistry): WritingEntry[] {
  const articles = registry.records.article as ContentRecord<AnyArticleFrontmatter>[];

  return articles.map(toWritingEntry).sort((a, b) => b.date.localeCompare(a.date));
}
