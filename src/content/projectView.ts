import type { ContentRecord } from "./load";
import type { ProjectFrontmatter } from "./schema";

type ProjectLink = ProjectFrontmatter["links"][number];

/** `project` records aren't a separate "benchmark" type — this is a filtered view over `kind` (spec §6.1). */
export function isBenchmarkProject(project: ContentRecord<ProjectFrontmatter>): boolean {
  return project.data.kind === "benchmark";
}

export function findBenchmarkProjects(projects: ContentRecord<ProjectFrontmatter>[]): ContentRecord<ProjectFrontmatter>[] {
  return projects.filter(isBenchmarkProject);
}

/** The single link to emphasize on a benchmark card/detail page, identified by label text. */
export function findLeaderboardLink(links: ProjectLink[]): ProjectLink | undefined {
  return links.find((link) => /leaderboard/i.test(link.label));
}

/** All links that point at a dataset, identified by label text. */
export function findDatasetLinks(links: ProjectLink[]): ProjectLink[] {
  return links.filter((link) => /dataset/i.test(link.label));
}

export interface GroupedProjects {
  /** Active/maintained projects: featured first, then `started` descending (spec §7.3). */
  active: ContentRecord<ProjectFrontmatter>[];
  /** Archived projects: de-emphasized/collapsed on the index, dropped from featured surfaces (spec §6.4). */
  archived: ContentRecord<ProjectFrontmatter>[];
}

function compareByStartedDescending(a: ContentRecord<ProjectFrontmatter>, b: ContentRecord<ProjectFrontmatter>) {
  return b.data.started.localeCompare(a.data.started);
}

/** Groups and orders project records per spec §7.3's `/projects/` rules. */
export function groupProjectsForIndex(projects: ContentRecord<ProjectFrontmatter>[]): GroupedProjects {
  const active = projects.filter((p) => p.data.status !== "archived");
  const archived = projects.filter((p) => p.data.status === "archived");

  active.sort((a, b) => {
    if (a.data.featured !== b.data.featured) return a.data.featured ? -1 : 1;
    return compareByStartedDescending(a, b);
  });
  archived.sort(compareByStartedDescending);

  return { active, archived };
}
