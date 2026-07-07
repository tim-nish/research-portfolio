import type { ContentRecord, ContentRegistry } from "./load";
import type { NewsletterIssueFrontmatter } from "./schema";

export interface NewsletterIssueEntry {
  slug: string;
  number: number;
  date: string;
  subject: string;
  summary: string;
  archiveHref?: string;
}

/** The `/newsletter/` archive list (Story 1.7's empty-safe slot) — newest issue first. */
export function collectNewsletterIssues(registry: ContentRegistry): NewsletterIssueEntry[] {
  const issues = registry.records["newsletter-issue"] as ContentRecord<NewsletterIssueFrontmatter>[];

  return [...issues]
    .sort((a, b) => b.data.number - a.data.number)
    .map((record) => ({
      slug: record.slug,
      number: record.data.number,
      date: record.data.date,
      subject: record.data.subject,
      summary: record.data.summary,
      archiveHref: record.data.archiveHref,
    }));
}
