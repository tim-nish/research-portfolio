import type { ContentRegistry } from "./load";
import type { ProductFrontmatter } from "./schema";

export interface SuccessorLink {
  title: string;
  href: string;
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
