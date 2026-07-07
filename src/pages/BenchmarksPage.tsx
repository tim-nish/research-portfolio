import BenchmarkCard, { type BenchmarkCardProps } from "../components/BenchmarkCard";

export interface BenchmarksPageProps {
  stanceParagraph: string;
  benchmarks: BenchmarkCardProps[];
}

function BenchmarksPage({ stanceParagraph, benchmarks }: BenchmarksPageProps) {
  return (
    <article className="benchmarks-page">
      <h1>Benchmarks</h1>
      <p className="benchmarks-stance">{stanceParagraph}</p>

      {benchmarks.length > 0 && (
        <div className="projects">
          {benchmarks.map((benchmark) => (
            <BenchmarkCard key={benchmark.slug} {...benchmark} />
          ))}
        </div>
      )}
    </article>
  );
}

export default BenchmarksPage;
