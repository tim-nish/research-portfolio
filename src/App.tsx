import ProjectCard from "./components/ProjectCard";

const projects = [
  {
    title: "Project One",
    description:
      "A short description of the research question, approach, and key result.",
    link: "#",
  },
  {
    title: "Project Two",
    description:
      "A short description of an ongoing study and the methods being explored.",
    link: "#",
  },
  {
    title: "Project Three",
    description:
      "A short description of a collaboration, publication, or research tool.",
    link: "#",
  },
];

function App() {
  return (
    <main>
      <header className="hero">
        <p className="eyebrow">Research Portfolio</p>
        <h1>Your Name</h1>
        <p className="intro">
          Researcher exploring clear, practical approaches to meaningful
          questions in your field.
        </p>
      </header>

      <section>
        <h2>Profile</h2>
        <p>
          I am a researcher focused on your primary research area. My work
          combines your methods or disciplines to better understand your core
          research interest.
        </p>
      </section>

      <section>
        <h2>Research Projects</h2>
        <div className="projects">
          {projects.map((project) => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </div>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          <a href="mailto:you@example.com">Email</a>
          <span aria-hidden="true"> · </span>
          <a href="https://github.com/">GitHub</a>
          <span aria-hidden="true"> · </span>
          <a href="https://www.linkedin.com/">LinkedIn</a>
        </p>
      </section>
    </main>
  );
}

export default App;
