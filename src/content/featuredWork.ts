import type { ContentRecord, ContentRegistry } from "./load";

export interface FeaturedItem {
  type: "project" | "product" | "publication";
  slug: string;
  title: string;
  summary: string;
  href: string;
}

interface FeaturableRecord {
  featured?: boolean;
  title: string;
}

/**
 * Recency field per type, used only for the D-11 ordering fallback — this table is
 * the one place a new eligible type needs a one-line entry; the query loop itself
 * never special-cases a type by name (NFR8: `product` is already wired in below, so
 * Epic 3 landing `featured: true` product records requires no code change here).
 */
const RECENCY_KEY: Record<FeaturedItem["type"], (data: Record<string, unknown>) => string> = {
  project: (data) => (data.started as string) ?? "0000-00",
  product: (data) => (data.launched as string | undefined) ?? "0000-00",
  publication: (data) => `${(data.year as number | undefined) ?? 0}-01`,
};

/**
 * `project`/`product` carry a `summary` frontmatter field; `publication` doesn't
 * (its abstract, if any, is body markdown, spec §6.2) — this synthesizes a
 * one-line card summary from venue/year instead of parsing the body.
 */
const SUMMARY: Record<FeaturedItem["type"], (data: Record<string, unknown>) => string> = {
  project: (data) => (data.summary as string) ?? "",
  product: (data) => (data.summary as string) ?? "",
  publication: (data) => [data.venue, data.year].filter(Boolean).join(", "),
};

const HREF_PREFIX: Record<FeaturedItem["type"], string> = {
  project: "/projects/",
  product: "/products/",
  publication: "/publications/",
};

const FEATURABLE_TYPES: FeaturedItem["type"][] = ["project", "product", "publication"];

/**
 * Type-agnostic "featured work" query (spec §7.3 Home block 3, AC2/NFR8): collects up
 * to 3 `featured: true` records across project/product/publication, ordered by each
 * type's own recency field descending per `docs/architecture.md` D-11 (no dedicated
 * curation-order field exists in any schema).
 */
export function collectFeaturedWork(registry: ContentRegistry, limit = 3): FeaturedItem[] {
  const items: (FeaturedItem & { sortKey: string })[] = [];

  for (const type of FEATURABLE_TYPES) {
    const records = registry.records[type] as ContentRecord<FeaturableRecord>[];
    for (const record of records) {
      if (!record.data.featured) continue;
      const data = record.data as unknown as Record<string, unknown>;
      items.push({
        type,
        slug: record.slug,
        title: record.data.title,
        summary: SUMMARY[type](data),
        href: `${HREF_PREFIX[type]}${record.slug}/`,
        sortKey: RECENCY_KEY[type](data),
      });
    }
  }

  items.sort((a, b) => b.sortKey.localeCompare(a.sortKey));
  return items.slice(0, limit).map(({ sortKey: _sortKey, ...item }) => item);
}
