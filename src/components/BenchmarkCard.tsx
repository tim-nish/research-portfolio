interface ProjectLink {
  label: string;
  href: string;
}

export interface BenchmarkCardProps {
  slug: string;
  title: string;
  summary: string;
  leaderboardLink?: ProjectLink;
  datasetLinks: ProjectLink[];
  hasCitation: boolean;
}

/** Rich benchmark card for `/benchmarks/` (Story 1.4) — links into `/projects/<slug>/`, the underlying record. */
function BenchmarkCard({ slug, title, summary, leaderboardLink, datasetLinks, hasCitation }: BenchmarkCardProps) {
  return (
    <article className="benchmark-card">
      <h3>
        <a href={`/projects/${slug}/`}>{title}</a>
      </h3>
      <p>{summary}</p>

      {leaderboardLink && (
        <p className="benchmark-leaderboard-link">
          <a className="project-link-pill project-link-pill-emphasized" href={leaderboardLink.href}>
            {leaderboardLink.label}
          </a>
        </p>
      )}

      {datasetLinks.length > 0 && (
        <p className="project-links">
          {datasetLinks.map((link) => (
            <a key={link.href} className="project-link-pill" href={link.href}>
              {link.label}
            </a>
          ))}
        </p>
      )}

      <p className="benchmark-citation-indicator">
        {hasCitation ? "Citation available" : "No citation yet"}
      </p>
    </article>
  );
}

export default BenchmarkCard;
