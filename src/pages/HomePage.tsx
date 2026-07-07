import NewsletterCapture from "../components/NewsletterCapture";
import type { FeaturedItem } from "../content/featuredWork";

interface IdentityLink {
  label: string;
  href: string;
}

export interface RecentWritingItem {
  slug: string;
  title: string;
  date: string;
  language: "en" | "ja";
  platform?: string;
  href: string;
}

export interface SectionEntry {
  label: string;
  href?: string;
  count?: number;
  microDescription?: string;
}

export interface HomePageProps {
  name: string;
  positioning: string;
  identityLinks: IdentityLink[];
  now?: string;
  featuredWork: FeaturedItem[];
  recentWriting: RecentWritingItem[];
  sections: SectionEntry[];
}

function HomePage({ name, positioning, identityLinks, now, featuredWork, recentWriting, sections }: HomePageProps) {
  return (
    <article className="home-page">
      <header className="hero">
        <h1>{name}</h1>
        <p className="intro">{positioning}</p>
        <p className="identity-links">
          {identityLinks.map((link, index) => (
            <span key={link.href}>
              {index > 0 && <span aria-hidden="true"> · </span>}
              <a href={link.href}>{link.label}</a>
            </span>
          ))}
        </p>
      </header>

      {now && <p className="home-now">{now}</p>}

      {featuredWork.length > 0 && (
        <section aria-labelledby="featured-work-heading">
          <h2 id="featured-work-heading">Featured work</h2>
          <div className="projects">
            {featuredWork.map((item) => (
              <article key={`${item.type}-${item.slug}`} className="home-featured-card">
                <h3>
                  <a href={item.href}>{item.title}</a>
                </h3>
                <p>{item.summary}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {recentWriting.length > 0 && (
        <section aria-labelledby="recent-writing-heading">
          <h2 id="recent-writing-heading">Recent writing</h2>
          <div className="home-recent-writing">
            {recentWriting.map((item) => (
              <article key={item.slug} className="home-recent-writing-entry">
                <h3>
                  <a href={item.href}>{item.title}</a>
                </h3>
                <p className="home-recent-writing-meta">
                  {item.date}
                  <span className="language-badge">{item.language.toUpperCase()}</span>
                  {item.platform && <span className="platform-badge">{item.platform}</span>}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="sections-directory-heading">
        <h2 id="sections-directory-heading">Explore</h2>
        <ul className="sections-directory">
          {sections.map((section) => (
            <li key={section.label}>
              {section.href ? <a href={section.href}>{section.label}</a> : <span>{section.label}</span>}
              {typeof section.count === "number" && <span className="sections-directory-count"> ({section.count})</span>}
              {section.microDescription && <span className="sections-directory-micro"> — {section.microDescription}</span>}
            </li>
          ))}
        </ul>
      </section>

      <div className="home-newsletter">
        <NewsletterCapture variant="page" heading="Get updates on new projects and benchmarks." />
      </div>
    </article>
  );
}

export default HomePage;
