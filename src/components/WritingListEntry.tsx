export interface WritingListEntryProps {
  slug: string;
  title: string;
  date: string;
  summary: string;
  language: "en" | "ja";
  mode: "canonical" | "external";
  platform?: string;
  topics: string[];
  href: string;
}

function WritingListEntry({ title, date, summary, language, platform, topics, href }: WritingListEntryProps) {
  return (
    <article className="writing-list-entry">
      <h3>
        <a href={href}>{title}</a>
      </h3>
      <p className="writing-entry-meta">
        {date}
        <span className="language-badge">{language.toUpperCase()}</span>
        {platform && <span className="platform-badge">{platform}</span>}
      </p>
      <p>{summary}</p>
      {topics.length > 0 && (
        <p className="topic-tags">
          {topics.map((topic) => (
            <span key={topic} className="topic-tag">
              {topic}
            </span>
          ))}
        </p>
      )}
    </article>
  );
}

export default WritingListEntry;
