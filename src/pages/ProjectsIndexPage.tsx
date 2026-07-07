import ProjectListCard from "../components/ProjectListCard";

interface ProjectSummary {
  slug: string;
  title: string;
  kind: string;
  summary: string;
  started: string;
  links: { label: string; href: string }[];
}

export interface ProjectsIndexPageProps {
  introLine: string;
  active: ProjectSummary[];
  archived: ProjectSummary[];
}

function ProjectsIndexPage({ introLine, active, archived }: ProjectsIndexPageProps) {
  return (
    <article className="projects-index">
      <h1>Projects</h1>
      <p className="projects-intro">{introLine}</p>

      {active.length > 0 && (
        <div className="projects">
          {active.map((project) => (
            <ProjectListCard key={project.slug} {...project} />
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <details className="projects-archive">
          <summary>Archive ({archived.length})</summary>
          <div className="projects projects-archive-list">
            {archived.map((project) => (
              <ProjectListCard key={project.slug} {...project} />
            ))}
          </div>
        </details>
      )}
    </article>
  );
}

export default ProjectsIndexPage;
