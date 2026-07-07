interface IdentityLink {
  label: string;
  href: string;
}

export interface AboutPageProps {
  bioHtml: string;
  focusAreas: string[];
  identityLinks: IdentityLink[];
  languagesNote?: string;
}

function AboutPage({ bioHtml, focusAreas, identityLinks, languagesNote }: AboutPageProps) {
  const emailLink = identityLinks.find((link) => link.href.startsWith("mailto:"));

  return (
    <article className="about-page">
      <h1>About</h1>

      <div className="about-bio" dangerouslySetInnerHTML={{ __html: bioHtml }} />

      {focusAreas.length > 0 && (
        <section aria-labelledby="focus-areas-heading">
          <h2 id="focus-areas-heading">Focus areas</h2>
          <ul className="focus-areas">
            {focusAreas.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="identity-links-heading">
        <h2 id="identity-links-heading">Elsewhere</h2>
        <p className="identity-links">
          {identityLinks.map((link, index) => (
            <span key={link.href}>
              {index > 0 && <span aria-hidden="true"> · </span>}
              <a href={link.href}>{link.label}</a>
            </span>
          ))}
        </p>
      </section>

      {emailLink && (
        <section aria-labelledby="contact-heading">
          <h2 id="contact-heading">Contact</h2>
          <p>
            Reach out by <a href={emailLink.href}>email</a>.
          </p>
        </section>
      )}

      {languagesNote && <p className="languages-note">{languagesNote}</p>}
    </article>
  );
}

export default AboutPage;
