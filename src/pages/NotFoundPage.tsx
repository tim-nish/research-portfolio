export interface NotFoundPageProps {
  ownerName: string;
  positioning: string;
}

function NotFoundPage({ ownerName, positioning }: NotFoundPageProps) {
  return (
    <article className="not-found-page">
      <h1>{ownerName}</h1>
      <p className="intro">{positioning}</p>
      <p>This page doesn't exist — but here's the rest of the site.</p>
      <ul className="not-found-links">
        <li>
          <a href="/">Home</a>
        </li>
        <li>
          <a href="/projects/">Projects</a>
        </li>
        <li>
          <a href="/benchmarks/">Benchmarks</a>
        </li>
        <li>
          <a href="/publications/">Publications</a>
        </li>
        <li>
          <a href="/about/">About</a>
        </li>
      </ul>
    </article>
  );
}

export default NotFoundPage;
