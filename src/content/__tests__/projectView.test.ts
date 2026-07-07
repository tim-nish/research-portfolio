import { describe, expect, it } from "vitest";
import type { ContentRecord } from "../load";
import { groupProjectsForIndex } from "../projectView";
import type { ProjectFrontmatter } from "../schema";

function project(overrides: Partial<ProjectFrontmatter> & { slug: string }): ContentRecord<ProjectFrontmatter> {
  const data: ProjectFrontmatter = {
    title: overrides.slug,
    kind: "tool",
    status: "active",
    summary: "A test project.",
    started: "2026-01",
    links: [{ label: "GitHub", href: "https://github.com/example" }],
    featured: false,
    ...overrides,
  };
  return { type: "project", slug: data.slug, filePath: `${data.slug}.md`, data, body: "", bodyHtml: "" };
}

describe("groupProjectsForIndex", () => {
  it("puts featured projects first, then orders the rest by started descending", () => {
    const older = project({ slug: "older", started: "2025-01" });
    const newer = project({ slug: "newer", started: "2026-06" });
    const featuredButOlder = project({ slug: "featured-older", started: "2024-01", featured: true });

    const { active } = groupProjectsForIndex([older, newer, featuredButOlder]);

    expect(active.map((p) => p.slug)).toEqual(["featured-older", "newer", "older"]);
  });

  it("separates archived projects into their own group, ordered by started descending", () => {
    const active = project({ slug: "active-one", status: "active" });
    const archivedOld = project({ slug: "archived-old", status: "archived", started: "2024-01" });
    const archivedNew = project({ slug: "archived-new", status: "archived", started: "2025-01" });

    const grouped = groupProjectsForIndex([active, archivedOld, archivedNew]);

    expect(grouped.active.map((p) => p.slug)).toEqual(["active-one"]);
    expect(grouped.archived.map((p) => p.slug)).toEqual(["archived-new", "archived-old"]);
  });
});
