import NewsletterCapture from "../components/NewsletterCapture";

interface SyndicationEntry {
  platform: string;
  href: string;
}

export interface ArticleDetailPageProps {
  title: string;
  date: string;
  updated?: string;
  status: "published" | "updated" | "deprecated";
  bodyHtml: string;
  topics?: string[];
  syndication?: SyndicationEntry[];
  relatedSlugsByType?: Partial<Record<"projects" | "products" | "publications", string[]>>;
}

function ArticleDetailPage({
  title,
  date,
  updated,
  status,
  bodyHtml,
  topics,
  syndication,
  relatedSlugsByType,
}: ArticleDetailPageProps) {
  const relatedEntries = Object.entries(relatedSlugsByType ?? {}).filter(([, slugs]) => (slugs?.length ?? 0) > 0);

  return (
    <article className="article-detail">
      {status === "deprecated" && (
        <p className="lifecycle-banner">
          This article is deprecated — its content may no longer reflect current practice.
        </p>
      )}

      <h1>{title}</h1>
      <p className="article-meta-line">
        {date}
        {updated && <span> · updated {updated}</span>}
      </p>

      <div className="article-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />

      {topics && topics.length > 0 && (
        <p className="topic-tags">
          {topics.map((topic) => (
            <span key={topic} className="topic-tag">
              {topic}
            </span>
          ))}
        </p>
      )}

      {syndication && syndication.length > 0 && (
        <p className="syndication-note">
          Also on{" "}
          {syndication.map((entry, index) => (
            <span key={entry.href}>
              {index > 0 && ", "}
              <a href={entry.href}>{entry.platform}</a>
            </span>
          ))}
          .
        </p>
      )}

      {relatedEntries.length > 0 && (
        <section aria-labelledby="related-heading">
          <h2 id="related-heading">Related</h2>
          <ul className="related-entities">
            {relatedEntries.map(([type, slugs]) => (
              <li key={type}>
                {type}: {slugs!.join(", ")}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="standard-cta">
        <NewsletterCapture variant="inline" heading="Get notified about what I build next." />
      </div>
    </article>
  );
}

export default ArticleDetailPage;
