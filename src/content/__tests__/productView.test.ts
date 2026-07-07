import { describe, expect, it } from "vitest";
import { groupProductsForIndex, resolveSuccessorLink } from "../productView";
import type { ContentRecord, ContentRegistry } from "../load";
import type { ProductFrontmatter } from "../schema";

function product(overrides: Partial<ProductFrontmatter> & { slug: string }): ContentRecord<ProductFrontmatter> {
  const data: ProductFrontmatter = {
    title: overrides.slug,
    status: "live",
    pain: "A fixture pain statement.",
    summary: "A fixture summary.",
    platforms: ["web"],
    cta: { kind: "signup", href: "#newsletter", label: "Get notified" },
    pricing: "free",
    unlisted: false,
    featured: false,
    ...overrides,
  };
  return { type: "product", slug: data.slug, filePath: `${data.slug}.md`, data, body: "", bodyHtml: "" };
}

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

describe("groupProductsForIndex", () => {
  it("puts live products in the live group", () => {
    const live = product({ slug: "live-one", status: "live" });

    expect(groupProductsForIndex([live]).live).toEqual([live]);
  });

  it("excludes unlisted: true validating products, includes unlisted: false ones", () => {
    const listed = product({ slug: "listed-validating", status: "validating", unlisted: false });
    const unlisted = product({ slug: "unlisted-validating", status: "validating", unlisted: true });

    const { validating } = groupProductsForIndex([listed, unlisted]);

    expect(validating.map((p) => p.slug)).toEqual(["listed-validating"]);
  });

  it("always includes sunset products in retired, regardless of unlisted — retirement is not a hide mechanism", () => {
    const sunsetUnlisted = product({ slug: "sunset-unlisted", status: "sunset", unlisted: true });
    const sunsetListed = product({ slug: "sunset-listed", status: "sunset", unlisted: false });

    const { retired } = groupProductsForIndex([sunsetUnlisted, sunsetListed]);

    expect(retired.map((p) => p.slug).sort()).toEqual(["sunset-listed", "sunset-unlisted"]);
  });
});
