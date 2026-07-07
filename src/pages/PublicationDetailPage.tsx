import NewsletterCapture from "../components/NewsletterCapture";

interface AuthorEntry {
  name: string;
  isOwner: boolean;
}

interface PublicationLink {
  label: string;
  href: string;
}

export interface PublicationDetailPageProps {
  title: string;
  authors: AuthorEntry[];
  venue: string;
  year: number;
  status: "preprint" | "published" | "superseded";
  links: PublicationLink[];
  paperLink?: PublicationLink;
  codeLink?: PublicationLink;
  bodyHtml?: string;
  citation: string;
  supersededByTitle?: string;
  supersededBySlug?: string;
  relatedSlugsByType?: Partial<Record<"projects" | "articles", string[]>>;
}

function PublicationDetailPage({
  title,
  authors,
  venue,
  year,
  status,
  links,
  paperLink,
  codeLink,
  bodyHtml,
  citation,
  supersededByTitle,
  supersededBySlug,
  relatedSlugsByType,
}: PublicationDetailPageProps) {
  const relatedEntries = Object.entries(relatedSlugsByType ?? {}).filter(([, slugs]) => (slugs?.length ?? 0) > 0);
  const emphasizedHrefs = new Set([paperLink?.href, codeLink?.href].filter(Boolean));
  const secondaryLinks = links.filter((link) => !emphasizedHrefs.has(link.href));

  return (
    <article className="publication-detail">
      {status === "superseded" && (
        <p className="lifecycle-banner">
          This publication has been superseded
          {supersededByTitle && supersededBySlug ? (
            <>
              {" "}
              by <a href={`/publications/${supersededBySlug}/`}>{supersededByTitle}</a>.
            </>
          ) : (
            "."
          )}
        </p>
      )}

      <h1>{title}</h1>
      <p className="publication-authors">
        {authors.map((author, index) => (
          <span key={author.name}>
            {index > 0 && ", "}
            <span className={author.isOwner ? "publication-author-owner" : undefined}>{author.name}</span>
          </span>
        ))}
      </p>
      <p className="publication-venue-year">
        {venue} · {year}
      </p>

      <p className="project-links">
        {paperLink && (
          <a className="project-link-pill project-link-pill-emphasized" href={paperLink.href}>
            {paperLink.label}
          </a>
        )}
        {codeLink && (
          <a className="project-link-pill project-link-pill-emphasized" href={codeLink.href}>
            {codeLink.label}
          </a>
        )}
        {secondaryLinks.map((link) => (
          <a key={link.href} className="project-link-pill" href={link.href}>
            {link.label}
          </a>
        ))}
      </p>

      {bodyHtml && <div className="publication-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />}

      <section aria-labelledby="citation-heading">
        <h2 id="citation-heading">Citation</h2>
        <pre className="citation-block" id="citation-text">
          {citation}
        </pre>
        <button type="button" className="citation-copy-button" data-copy-target="citation-text">
          Copy BibTeX
        </button>
      </section>

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

export default PublicationDetailPage;
