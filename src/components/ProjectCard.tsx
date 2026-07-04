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
          {links.map((item) => (
            <a key={item.href} className="project-link-pill" href={item.href}>
              {item.label}
            </a>
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
