import path from "node:path";
import { describe, expect, it } from "vitest";
import { ContentValidationErrors, loadContentRegistry } from "../load";

const FIXTURES_ROOT = path.join(process.cwd(), "content", "__fixtures__");
const bad = (name: string) => path.join(FIXTURES_ROOT, "bad", name);

describe("loadContentRegistry — good fixtures", () => {
  it("parses and validates every content type without error", () => {
    const registry = loadContentRegistry({ contentDir: path.join(FIXTURES_ROOT, "good") });

    expect(registry.records.profile).toHaveLength(1);
    expect(registry.records.project).toHaveLength(1);
    expect(registry.records.publication).toHaveLength(1);
    expect(registry.records.article).toHaveLength(3);
    expect(registry.records.product).toHaveLength(2);
    expect(registry.records["newsletter-issue"]).toHaveLength(1);
  });

  it("loads a variant: site projection with its frontmatter contract intact", () => {
    const registry = loadContentRegistry({ contentDir: path.join(FIXTURES_ROOT, "good") });
    const projection = registry.bySlug.article["sample-projection"];

    expect(projection).toBeDefined();
    // Title authority: the record's title is the frontmatter value, never body-derived.
    expect(projection.data).toMatchObject({
      title: "Sample Site-Canonical Projection",
      variant: "site",
      source: "articles@a1b2c3d",
      language: "en",
      published: "2026-07-18",
      generated_by: "writing-assistant@1.0.0",
    });
    expect(projection.body.length).toBeGreaterThan(0);
  });

  it("computes inverse relations without requiring a reciprocal entry", () => {
    const registry = loadContentRegistry({ contentDir: path.join(FIXTURES_ROOT, "good") });

    // sample-publication declares related.projects: [sample-project]; sample-project
    // declares no related field at all, yet should see the inverse edge.
    expect(registry.relatedBy.project["sample-project"]?.publications).toEqual(["sample-publication"]);

    // sample-canonical article also relates to sample-project.
    expect(registry.relatedBy.project["sample-project"]?.articles).toEqual(["sample-canonical"]);
  });
});

describe("loadContentRegistry — failure modes (AC2/AC3)", () => {
  it("fails the build on a missing required field", () => {
    expect(() => loadContentRegistry({ contentDir: bad("missing-required-field") })).toThrow(
      ContentValidationErrors,
    );
  });

  it("fails the build on an unknown enum value", () => {
    expect(() => loadContentRegistry({ contentDir: bad("unknown-enum") })).toThrow(ContentValidationErrors);
  });

  it("fails the build on a duplicate slug within a type", () => {
    try {
      loadContentRegistry({ contentDir: bad("duplicate-slug") });
      throw new Error("expected loadContentRegistry to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ContentValidationErrors);
      expect((error as ContentValidationErrors).errors.some((e) => e.message.includes("duplicate slug"))).toBe(
        true,
      );
    }
  });

  it("fails the build on an unresolvable related.* slug reference", () => {
    try {
      loadContentRegistry({ contentDir: bad("unresolved-related") });
      throw new Error("expected loadContentRegistry to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ContentValidationErrors);
      expect(
        (error as ContentValidationErrors).errors.some((e) => e.message.includes("unresolvable slug")),
      ).toBe(true);
    }
  });

  it("fails the build when an external-mode article has a body", () => {
    try {
      loadContentRegistry({ contentDir: bad("article-external-with-body") });
      throw new Error("expected loadContentRegistry to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ContentValidationErrors);
      expect((error as ContentValidationErrors).errors.some((e) => e.message.includes("must not have a body"))).toBe(
        true,
      );
    }
  });

  it("fails the build when a canonical-mode article has no body", () => {
    try {
      loadContentRegistry({ contentDir: bad("article-canonical-without-body") });
      throw new Error("expected loadContentRegistry to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ContentValidationErrors);
      expect(
        (error as ContentValidationErrors).errors.some((e) => e.message.includes("require a non-empty body")),
      ).toBe(true);
    }
  });

  it("fails the build when an external-mode article carries a syndication field", () => {
    try {
      loadContentRegistry({ contentDir: bad("article-external-with-syndication") });
      throw new Error("expected loadContentRegistry to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ContentValidationErrors);
      expect(
        (error as ContentValidationErrors).errors.some((e) => e.message.includes("only valid when mode")),
      ).toBe(true);
    }
  });

  it("fails a projection missing its source pin, naming the file and key", () => {
    try {
      loadContentRegistry({ contentDir: bad("projection-missing-source") });
      throw new Error("expected loadContentRegistry to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ContentValidationErrors);
      const errs = (error as ContentValidationErrors).errors;
      expect(errs.some((e) => e.file.includes("broken.md") && e.message.startsWith("source:"))).toBe(true);
    }
  });

  it("fails a projection with a wrong variant value on the variant key itself", () => {
    try {
      loadContentRegistry({ contentDir: bad("projection-invalid-variant") });
      throw new Error("expected loadContentRegistry to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ContentValidationErrors);
      const errs = (error as ContentValidationErrors).errors;
      expect(errs.some((e) => e.message.startsWith("variant:"))).toBe(true);
    }
  });

  it("fails a variant: site projection with an empty body", () => {
    try {
      loadContentRegistry({ contentDir: bad("projection-without-body") });
      throw new Error("expected loadContentRegistry to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ContentValidationErrors);
      expect(
        (error as ContentValidationErrors).errors.some((e) =>
          e.message.includes("variant: site projections require a non-empty body"),
        ),
      ).toBe(true);
    }
  });

  it("fails the build when a sunset product is missing sunset.date/sunset.note", () => {
    expect(() => loadContentRegistry({ contentDir: bad("product-sunset-missing-fields") })).toThrow(
      ContentValidationErrors,
    );
  });

  it("fails the build when a product's cta.kind is outside the enum", () => {
    expect(() => loadContentRegistry({ contentDir: bad("product-invalid-cta-kind") })).toThrow(
      ContentValidationErrors,
    );
  });

  it("fails the build when a product's pricing is outside the enum", () => {
    expect(() => loadContentRegistry({ contentDir: bad("product-invalid-pricing") })).toThrow(
      ContentValidationErrors,
    );
  });

  it("fails the build when a product's platforms entry is outside the enum", () => {
    expect(() => loadContentRegistry({ contentDir: bad("product-invalid-platform") })).toThrow(
      ContentValidationErrors,
    );
  });

  it("fails the build when a publication's supersededBy references an unresolvable slug", () => {
    try {
      loadContentRegistry({ contentDir: bad("unresolved-superseded-by") });
      throw new Error("expected loadContentRegistry to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ContentValidationErrors);
      expect(
        (error as ContentValidationErrors).errors.some((e) => e.message.includes("supersededBy references unresolvable slug")),
      ).toBe(true);
    }
  });
});
