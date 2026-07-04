import ProjectCard from "./components/ProjectCard";

function App() {
  return (
    <main>
      <header className="hero">
        <p className="eyebrow">Research Portfolio</p>
        <h1>Tomoya Imanishi</h1>
        <p className="intro">
          Building open-source agentic AI systems for reproducible scientific research and software engineering.
        </p>
      </header>

      <section>
        <h2>Profile</h2>
        <p>
          I develop open-source tools that transform research workflows—from
          literature exploration and idea generation to implementation planning
          and experimental evaluation—into reproducible, AI-assisted processes.
          <br />
          <br />
          My work is centered on large language models, autonomous agent systems,
          and machine learning architectures. I am currently developing PRISM
          for AI-assisted research planning while investigating Signature-based
          Transformers for efficient sequence modeling.
        </p>
      </section>

      <section>
        <h2>Research Projects</h2>
        <div className="projects">
          <ProjectCard
            title="PRISM"
            description="An open-source Claude Code plugin for AI-assisted research planning, literature synthesis, and candidate generation."
            link="https://github.com/tim-nish/PRISM"
          />
          <ProjectCard
            title="QuantScenarioBench"
            description="A JAX-native benchmark ecosystem for quantitative finance, with reproducible market scenarios, portfolio strategy evaluation, and a public Hugging Face leaderboard."
            links={[
              {
                label: "GitHub",
                href: "https://github.com/tim-nish/QuantScenarioBench",
              },
              {
                label: "Live leaderboard",
                href: "https://huggingface.co/spaces/QuantScenarioBench/qsb-leaderboard",
              },
              {
                label: "Datasets",
                href: "https://huggingface.co/QuantScenarioBench",
              },
            ]}
          />
        </div>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          <a href="mailto:tomoya.imanishi.ti@gmail.com">Email</a>
          <span aria-hidden="true"> · </span>
          <a href="https://github.com/tim-nish">GitHub</a>
          <span aria-hidden="true"> · </span>
          <a href="https://www.linkedin.com/in/nowwest/">LinkedIn</a>
        </p>
      </section>
    </main>
  );
}

export default App;