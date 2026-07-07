import NewsletterCapture from "../components/NewsletterCapture";
import type { NewsletterIssueEntry } from "../content/newsletterView";

export interface NewsletterPageProps {
  focusAreas: string[];
  issues?: NewsletterIssueEntry[];
}

// Archive slot (Story 1.7) stays empty-safe: renders nothing until real
// newsletter-issue records exist (Story 3.6, optional per spec §6.2/§10) — per the
// cadence-honesty requirement (spec §9), this page must never claim a publishing
// frequency in its copy either, regardless of archive state.
function NewsletterPage({ focusAreas, issues = [] }: NewsletterPageProps) {
  return (
    <article className="newsletter-page">
      <h1>Newsletter</h1>
      <p className="newsletter-pitch">
        Occasional notes on what gets built here — new projects, benchmark results, and tools as they
        ship. No fixed schedule, just signal when there's something worth sending.
        {focusAreas.length > 0 && ` Expect topics like ${focusAreas.join(", ")}.`}
      </p>

      <NewsletterCapture variant="page" />

      {issues.length > 0 && (
        <section aria-labelledby="newsletter-archive-heading">
          <h2 id="newsletter-archive-heading">Past issues</h2>
          <ul className="newsletter-archive-list">
            {issues.map((issue) => (
              <li key={issue.slug}>
                <p className="newsletter-archive-subject">
                  {issue.archiveHref ? <a href={issue.archiveHref}>{issue.subject}</a> : issue.subject}
                </p>
                <p className="newsletter-archive-summary">{issue.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

export default NewsletterPage;
