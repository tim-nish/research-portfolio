import { useState } from "react";
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
  const [showRepoQA, setShowRepoQA] = useState(false);

  if (showRepoQA) {
    return (
      <main>
        <button
          className="link-button"
          type="button"
          onClick={() => setShowRepoQA(false)}
        >
          Back to portfolio
        </button>

        <header className="hero project-detail">
          <p className="eyebrow">Draft / Placeholder</p>
          <h1>RepoQA</h1>
          <p className="intro">
            A placeholder page for a personal research project.
          </p>
        </header>

        <section>
          <h2>Overview</h2>
          <p>Draft / placeholder overview content for RepoQA.</p>
        </section>

        <section>
          <h2>Motivation</h2>
          <p>Draft / placeholder motivation content for RepoQA.</p>
        </section>

        <section>
          <h2>Current Status</h2>
          <p>Draft / placeholder status: early research and planning.</p>
        </section>

        <section>
          <h2>Links</h2>
          <p>Draft / placeholder links will be added later.</p>
        </section>
      </main>
    );
  }

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
          <ProjectCard
            title="RepoQA"
            description="A placeholder page for a personal research project."
            onOpen={() => setShowRepoQA(true)}
          />
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
