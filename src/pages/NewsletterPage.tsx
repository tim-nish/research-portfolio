import NewsletterCapture from "../components/NewsletterCapture";

export interface NewsletterPageProps {
  focusAreas: string[];
}

// Phase-3-deferred: the issue archive (Story 3.6) renders nothing until real
// newsletter-issue records exist — per the cadence-honesty requirement (spec §9),
// this page must never claim a publishing frequency in its copy either.
function NewsletterPage({ focusAreas }: NewsletterPageProps) {
  return (
    <article className="newsletter-page">
      <h1>Newsletter</h1>
      <p className="newsletter-pitch">
        Occasional notes on what gets built here — new projects, benchmark results, and tools as they
        ship. No fixed schedule, just signal when there's something worth sending.
        {focusAreas.length > 0 && ` Expect topics like ${focusAreas.join(", ")}.`}
      </p>

      <NewsletterCapture variant="page" />
    </article>
  );
}

export default NewsletterPage;
