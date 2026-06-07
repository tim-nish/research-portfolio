interface ProjectCardProps {
  title: string;
  description: string;
  link?: string;
  onOpen?: () => void;
}

function ProjectCard({ title, description, link, onOpen }: ProjectCardProps) {
  return (
    <article>
      <h3>{title}</h3>
      <p>{description}</p>
      {onOpen ? (
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
