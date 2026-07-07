import WritingListEntry, { type WritingListEntryProps } from "../components/WritingListEntry";

export interface WritingIndexPageProps {
  entries: WritingListEntryProps[];
}

function WritingList({ entries }: { entries: WritingListEntryProps[] }) {
  return (
    <div className="writing-list">
      {entries.map((entry) => (
        <WritingListEntry key={entry.slug} {...entry} />
      ))}
    </div>
  );
}

// Filters are JS-optional by construction (spec §7.3, NFR1): each "view" is its own
// always-rendered, anchor-addressable section — no JS-required faceted search, no
// CSS trickery that could hide content if unsupported. The filter nav just jumps
// the browser to the matching section.
function WritingIndexPage({ entries }: WritingIndexPageProps) {
  const enEntries = entries.filter((e) => e.language === "en");
  const jaEntries = entries.filter((e) => e.language === "ja");
  const canonicalEntries = entries.filter((e) => e.mode === "canonical");
  const externalEntries = entries.filter((e) => e.mode === "external");

  return (
    <article className="writing-index">
      <h1>Writing</h1>
      <p className="writing-stance">
        Writing grounded in built systems and measured results — what shipped, what broke, and what the numbers
        said.
      </p>

      {entries.length > 0 && (
        <nav aria-label="Filter writing" className="writing-filter-nav">
          <a href="#all-entries">All</a>
          <span aria-hidden="true"> · </span>
          <a href="#en-entries">EN</a>
          <span aria-hidden="true"> · </span>
          <a href="#ja-entries">JA</a>
          <span aria-hidden="true"> · </span>
          <a href="#canonical-entries">Canonical</a>
          <span aria-hidden="true"> · </span>
          <a href="#external-entries">External</a>
        </nav>
      )}

      {entries.length > 0 && (
        <section id="all-entries" aria-labelledby="all-entries-heading">
          <h2 id="all-entries-heading">All</h2>
          <WritingList entries={entries} />
        </section>
      )}

      {enEntries.length > 0 && (
        <section id="en-entries" aria-labelledby="en-entries-heading">
          <h2 id="en-entries-heading">English</h2>
          <WritingList entries={enEntries} />
        </section>
      )}

      {jaEntries.length > 0 && (
        <section id="ja-entries" aria-labelledby="ja-entries-heading">
          <h2 id="ja-entries-heading">Japanese</h2>
          <WritingList entries={jaEntries} />
        </section>
      )}

      {canonicalEntries.length > 0 && (
        <section id="canonical-entries" aria-labelledby="canonical-entries-heading">
          <h2 id="canonical-entries-heading">Hosted here</h2>
          <WritingList entries={canonicalEntries} />
        </section>
      )}

      {externalEntries.length > 0 && (
        <section id="external-entries" aria-labelledby="external-entries-heading">
          <h2 id="external-entries-heading">Elsewhere</h2>
          <WritingList entries={externalEntries} />
        </section>
      )}
    </article>
  );
}

export default WritingIndexPage;
