import type { ContentRecord, ContentRegistry } from "./load";
import type { ProductFrontmatter } from "./schema";

export interface SuccessorLink {
  title: string;
  href: string;
}

export interface GroupedProducts {
  live: ContentRecord<ProductFrontmatter>[];
  /** `validating` products with `unlisted: false` only (spec §7.3) — not sunset's opt-out. */
  validating: ContentRecord<ProductFrontmatter>[];
  /** `sunset` products — always included regardless of `unlisted`; retirement is not a hide mechanism (spec §6.4). */
  retired: ContentRecord<ProductFrontmatter>[];
}

/** Groups `product` records for `/products/` per spec §7.3's three sections. */
export function groupProductsForIndex(products: ContentRecord<ProductFrontmatter>[]): GroupedProducts {
  return {
    live: products.filter((p) => p.data.status === "live"),
    validating: products.filter((p) => p.data.status === "validating" && !p.data.unlisted),
    retired: products.filter((p) => p.data.status === "sunset"),
  };
}

/**
 * Resolves `sunset.successor` (spec §6.2: "slug or url") to a renderable link — an
 * internal product slug becomes `/products/<slug>/` with that product's real title;
 * anything else is treated as an already-complete external URL.
 */
export function resolveSuccessorLink(successor: string | undefined, registry: ContentRegistry): SuccessorLink | undefined {
  if (!successor) return undefined;

  if (/^https?:\/\//.test(successor)) {
    return { title: successor, href: successor };
  }

  const record = registry.bySlug.product[successor] as { data: ProductFrontmatter } | undefined;
  if (record) {
    return { title: record.data.title, href: `/products/${successor}/` };
  }

  return { title: successor, href: `/products/${successor}/` };
}
