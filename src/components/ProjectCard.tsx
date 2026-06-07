interface ProjectCardProps {
  title: string;
  description: string;
  link: string;
}

function ProjectCard({ title, description, link }: ProjectCardProps) {
  return (
    <article>
      <h3>{title}</h3>
      <p>{description}</p>
      <a href={link}>View project</a>
    </article>
  );
}

export default ProjectCard;
