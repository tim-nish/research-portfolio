import { describe, expect, it } from "vitest";
import { checkHandEdit, checkStrayPath } from "../lint";

const projection = (source: string, body: string) => `---
title: Sample
slug: sample
source: ${source}
variant: site
language: en
published: 2026-07-18
generated_by: tool@1.0.0
---

${body}
`;

const FILE = "content/articles/sample.md";

describe("checkHandEdit", () => {
  it("flags a body edit that keeps the old source pin", () => {
    const finding = checkHandEdit(FILE, projection("articles@a1b2c3d", "original"), projection("articles@a1b2c3d", "edited here"));
    expect(finding?.message).toContain("hand-edited");
  });

  it("accepts a regeneration carrying a new source pin", () => {
    expect(
      checkHandEdit(FILE, projection("articles@a1b2c3d", "original"), projection("articles@e4f5a6b", "regenerated")),
    ).toBeUndefined();
  });

  it("accepts a newly added projection (the explicit publish act)", () => {
    expect(checkHandEdit(FILE, undefined, projection("articles@a1b2c3d", "new"))).toBeUndefined();
  });

  it("ignores non-projection article records", () => {
    const legacy = `---\nslug: sample\ntitle: T\ndate: 2026-01-01\nmode: canonical\nlanguage: en\nsummary: s\n---\n\nbody\n`;
    expect(checkHandEdit(FILE, legacy, legacy.replace("body", "edited"))).toBeUndefined();
  });
});

describe("checkStrayPath", () => {
  it("rejects proposal output under a top-level site/ directory", () => {
    expect(checkStrayPath("site/some-slug.md")?.message).toContain("proposal output");
  });

  it("rejects *.proposal.md and *.intermediate.md anywhere", () => {
    expect(checkStrayPath("drafts/x.proposal.md")).toBeDefined();
    expect(checkStrayPath("content/articles/x.intermediate.md")).toBeDefined();
  });

  it("rejects a projection-shaped markdown file outside content/articles/", () => {
    expect(checkStrayPath("docs/leaked.md", projection("articles@a1b2c3d", "body"))?.message).toContain(
      "outside content/articles/",
    );
  });

  it("accepts projections in their home and ordinary files elsewhere", () => {
    expect(checkStrayPath("content/articles/sample.md", projection("articles@a1b2c3d", "body"))).toBeUndefined();
    expect(checkStrayPath("docs/prd.md", "---\ntitle: PRD\n---\n\nprose\n")).toBeUndefined();
    expect(checkStrayPath("src/content/load.ts")).toBeUndefined();
    expect(checkStrayPath("content/__fixtures__/bad/projection-missing-source/articles/broken.md")).toBeUndefined();
  });
});
