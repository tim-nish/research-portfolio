import { describe, expect, it } from "vitest";
import type { ContentRecord } from "../load";
import {
  findBenchmarkProjects,
  findDatasetLinks,
  findLeaderboardLink,
  groupProjectsForIndex,
} from "../projectView";
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

describe("findBenchmarkProjects", () => {
  it("filters to kind: benchmark only — no separate content type (spec §6.1)", () => {
    const benchmark = project({ slug: "bench", kind: "benchmark" });
    const tool = project({ slug: "a-tool", kind: "tool" });

    expect(findBenchmarkProjects([benchmark, tool]).map((p) => p.slug)).toEqual(["bench"]);
  });
});

describe("findLeaderboardLink", () => {
  it("finds a link whose label mentions 'leaderboard', case-insensitively", () => {
    const links = [
      { label: "GitHub", href: "https://github.com/example" },
      { label: "Live Leaderboard", href: "https://example.com/leaderboard" },
    ];

    expect(findLeaderboardLink(links)?.href).toBe("https://example.com/leaderboard");
  });

  it("returns undefined when no link mentions a leaderboard", () => {
    expect(findLeaderboardLink([{ label: "GitHub", href: "https://github.com/example" }])).toBeUndefined();
  });
});

describe("findDatasetLinks", () => {
  it("finds every link whose label mentions 'dataset'", () => {
    const links = [
      { label: "GitHub", href: "https://github.com/example" },
      { label: "Datasets", href: "https://example.com/datasets" },
    ];

    expect(findDatasetLinks(links)).toEqual([{ label: "Datasets", href: "https://example.com/datasets" }]);
  });
});
