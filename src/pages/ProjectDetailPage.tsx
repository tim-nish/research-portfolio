import NewsletterCapture from "../components/NewsletterCapture";

interface ProjectLink {
  label: string;
  href: string;
}

export interface ProjectDetailPageProps {
  title: string;
  kind: string;
  status: "active" | "maintained" | "archived";
  started: string;
  links: ProjectLink[];
  bodyHtml?: string;
  citation?: string;
  relatedSlugsByType?: Partial<Record<"publications" | "products" | "articles", string[]>>;
}

function ProjectDetailPage({
  title,
  kind,
  status,
  started,
  links,
  bodyHtml,
  citation,
  relatedSlugsByType,
}: ProjectDetailPageProps) {
  const relatedEntries = Object.entries(relatedSlugsByType ?? {}).filter(([, slugs]) => (slugs?.length ?? 0) > 0);

  return (
    <article className="project-detail">
      {status === "archived" && (
        <p className="lifecycle-banner">This project is archived (last active {started}).</p>
      )}

      <h1>{title}</h1>
      <p className="project-meta-line">
        {kind} · {status} · started {started}
      </p>

      <p className="project-links">
        {links.map((link) => (
          <a key={link.href} className="project-link-pill" href={link.href}>
            {link.label}
          </a>
        ))}
      </p>

      {bodyHtml && <div className="project-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />}

      {citation && (
        <section aria-labelledby="citation-heading">
          <h2 id="citation-heading">Citation</h2>
          <pre className="citation-block" id="citation-text">
            {citation}
          </pre>
          <button type="button" className="citation-copy-button" data-copy-target="citation-text">
            Copy BibTeX
          </button>
        </section>
      )}

      {relatedEntries.length > 0 && (
        <section aria-labelledby="related-heading">
          <h2 id="related-heading">Related</h2>
          <ul className="related-entities">
            {relatedEntries.map(([type, slugs]) => (
              <li key={type}>
                {type}: {slugs!.join(", ")}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="standard-cta">
        <NewsletterCapture variant="inline" heading="Get notified about what I build next." />
      </div>
    </article>
  );
}

export default ProjectDetailPage;
