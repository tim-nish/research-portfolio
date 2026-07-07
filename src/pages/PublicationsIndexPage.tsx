import PublicationListEntry, { type PublicationListEntryProps } from "../components/PublicationListEntry";

export interface PublicationYearGroupView {
  year: number;
  publications: PublicationListEntryProps[];
}

export interface PublicationsIndexPageProps {
  groups: PublicationYearGroupView[];
}

function PublicationsIndexPage({ groups }: PublicationsIndexPageProps) {
  return (
    <article className="publications-index">
      <h1>Publications</h1>

      {groups.map((group) => (
        <section key={group.year} aria-labelledby={`year-${group.year}-heading`}>
          <h2 id={`year-${group.year}-heading`}>{group.year}</h2>
          <div className="publications">
            {group.publications.map((publication) => (
              <PublicationListEntry key={publication.slug} {...publication} />
            ))}
          </div>
        </section>
      ))}
    </article>
  );
}

export default PublicationsIndexPage;
