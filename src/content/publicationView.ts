import type { ContentRecord } from "./load";
import type { PublicationFrontmatter } from "./schema";

type PublicationLink = PublicationFrontmatter["links"][number];

/** The paper link to emphasize, identified by label text (spec §7.3 "links (paper+code emphasized as a pair)"). */
export function findPaperLink(links: PublicationLink[]): PublicationLink | undefined {
  return links.find((link) => /arxiv|paper/i.test(link.label));
}

/** The code link to emphasize alongside the paper link, identified by label text. */
export function findCodeLink(links: PublicationLink[]): PublicationLink | undefined {
  return links.find((link) => /code|github/i.test(link.label));
}

export interface PublicationYearGroup {
  year: number;
  publications: ContentRecord<PublicationFrontmatter>[];
}

/** Groups `publication` records by year, newest first (spec §7.3); within a year, ordered by title for determinism. */
export function groupPublicationsByYear(publications: ContentRecord<PublicationFrontmatter>[]): PublicationYearGroup[] {
  const byYear = new Map<number, ContentRecord<PublicationFrontmatter>[]>();

  for (const record of publications) {
    const bucket = byYear.get(record.data.year) ?? [];
    bucket.push(record);
    byYear.set(record.data.year, bucket);
  }

  return Array.from(byYear.entries())
    .sort(([a], [b]) => b - a)
    .map(([year, records]) => ({
      year,
      publications: [...records].sort((a, b) => a.data.title.localeCompare(b.data.title)),
    }));
}

/** Renders an authors list with the owner's name marked, so templates can highlight it (spec §7.3 "authors (owner highlighted)"). */
export function highlightOwnerAuthor(authors: string[], ownerName: string): { name: string; isOwner: boolean }[] {
  return authors.map((name) => ({ name, isOwner: name === ownerName }));
}
