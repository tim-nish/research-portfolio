interface AuthorEntry {
  name: string;
  isOwner: boolean;
}

export interface PublicationListEntryProps {
  slug: string;
  title: string;
  authors: AuthorEntry[];
  venue: string;
  year: number;
  status: "preprint" | "published" | "superseded";
  links: { label: string; href: string }[];
}

function PublicationListEntry({ slug, title, authors, venue, year, status, links }: PublicationListEntryProps) {
  return (
    <article className="publication-list-entry">
      <h3>
        <a href={`/publications/${slug}/`}>{title}</a>
      </h3>
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
        {(status === "preprint" || status === "superseded") && (
          <span className={`status-badge status-badge-${status}`}>{status}</span>
        )}
      </p>
      <p className="project-links">
        {links.map((link) => (
          <a key={link.href} className="project-link-pill" href={link.href}>
            {link.label}
          </a>
        ))}
      </p>
    </article>
  );
}

export default PublicationListEntry;
