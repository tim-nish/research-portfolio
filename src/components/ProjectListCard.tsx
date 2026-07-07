interface ProjectListCardProps {
  slug: string;
  title: string;
  kind: string;
  summary: string;
  links: { label: string; href: string }[];
}

/** Card used by `/projects/` (Story 1.3) and `/benchmarks/` (Story 1.4). */
function ProjectListCard({ slug, title, kind, summary, links }: ProjectListCardProps) {
  return (
    <article className="project-list-card">
      <p className="project-kind-label">{kind}</p>
      <h3>
        <a href={`/projects/${slug}/`}>{title}</a>
      </h3>
      <p>{summary}</p>
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

export default ProjectListCard;
