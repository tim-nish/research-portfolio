interface ProjectLink {
  label: string;
  href: string;
}

interface ProjectCardProps {
  title: string;
  description: string;
  link?: string;
  links?: ProjectLink[];
  onOpen?: () => void;
}

function ProjectCard({ title, description, link, links, onOpen }: ProjectCardProps) {
  return (
    <article>
      <h3>{title}</h3>
      <p>{description}</p>
      {links ? (
        <p className="project-links">
          {links.map((item, index) => (
            <span key={item.href}>
              {index > 0 && <span aria-hidden="true"> · </span>}
              <a href={item.href}>{item.label}</a>
            </span>
          ))}
        </p>
      ) : onOpen ? (
        <button className="link-button" type="button" onClick={onOpen}>
          View project
        </button>
      ) : (
        <a href={link}>View project</a>
      )}
    </article>
  );
}

export default ProjectCard;
