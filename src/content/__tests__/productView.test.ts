import { describe, expect, it } from "vitest";
import { resolveSuccessorLink } from "../productView";
import type { ContentRecord, ContentRegistry } from "../load";
import type { ProductFrontmatter } from "../schema";

function emptyRegistry(): ContentRegistry {
  const empty = {
    profile: [],
    project: [],
    product: [],
    publication: [],
    article: [],
    "newsletter-issue": [],
  };
  return {
    records: structuredClone(empty) as ContentRegistry["records"],
    bySlug: structuredClone(empty) as unknown as ContentRegistry["bySlug"],
    relatedBy: structuredClone(empty) as unknown as ContentRegistry["relatedBy"],
  };
}

describe("resolveSuccessorLink", () => {
  it("returns undefined when there is no successor", () => {
    expect(resolveSuccessorLink(undefined, emptyRegistry())).toBeUndefined();
  });

  it("treats an http(s) successor as an already-complete external URL", () => {
    const link = resolveSuccessorLink("https://example.com/new-thing", emptyRegistry());

    expect(link).toEqual({ title: "https://example.com/new-thing", href: "https://example.com/new-thing" });
  });

  it("resolves a known product slug to its real title and /products/ path", () => {
    const registry = emptyRegistry();
    registry.bySlug.product["new-product"] = {
      type: "product",
      slug: "new-product",
      filePath: "new-product.md",
      data: { title: "New Product" } as ProductFrontmatter,
      body: "",
      bodyHtml: "",
    } as ContentRecord<ProductFrontmatter>;

    expect(resolveSuccessorLink("new-product", registry)).toEqual({
      title: "New Product",
      href: "/products/new-product/",
    });
  });
});
