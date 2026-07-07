import { describe, expect, it } from "vitest";
import { collectNewsletterIssues } from "../newsletterView";
import type { ContentRecord, ContentRegistry } from "../load";
import type { NewsletterIssueFrontmatter } from "../schema";

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

function issue(data: Record<string, unknown>): ContentRecord<NewsletterIssueFrontmatter> {
  return {
    type: "newsletter-issue",
    slug: data.slug as string,
    filePath: `${data.slug}.md`,
    data: data as unknown as NewsletterIssueFrontmatter,
    body: "",
    bodyHtml: "",
  };
}

describe("collectNewsletterIssues", () => {
  it("returns an empty list when no issues exist (Story 1.7's empty-safe archive slot)", () => {
    expect(collectNewsletterIssues(emptyRegistry())).toEqual([]);
  });

  it("orders issues newest-number first", () => {
    const registry = emptyRegistry();
    registry.records["newsletter-issue"].push(
      issue({ slug: "issue-1", number: 1, date: "2026-01-01", subject: "First", summary: "x" }),
      issue({ slug: "issue-2", number: 2, date: "2026-02-01", subject: "Second", summary: "y" }),
    );

    const entries = collectNewsletterIssues(registry);

    expect(entries.map((e) => e.slug)).toEqual(["issue-2", "issue-1"]);
  });

  it("carries through the optional archiveHref when present", () => {
    const registry = emptyRegistry();
    registry.records["newsletter-issue"].push(
      issue({ slug: "issue-1", number: 1, date: "2026-01-01", subject: "First", summary: "x" }),
      issue({
        slug: "issue-2",
        number: 2,
        date: "2026-02-01",
        subject: "Second",
        summary: "y",
        archiveHref: "https://example.com/issue-2",
      }),
    );

    const entries = collectNewsletterIssues(registry);

    expect(entries.find((e) => e.slug === "issue-1")?.archiveHref).toBeUndefined();
    expect(entries.find((e) => e.slug === "issue-2")?.archiveHref).toBe("https://example.com/issue-2");
  });
});
