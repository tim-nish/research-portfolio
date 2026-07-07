interface ProductLink {
  label: string;
  href: string;
}

interface CtaData {
  href: string;
  label: string;
}

interface SuccessorLink {
  title: string;
  href: string;
}

export interface ProductDetailPageProps {
  pain: string;
  summary: string;
  status: "validating" | "live" | "sunset";
  cta: CtaData;
  platforms: string[];
  links?: ProductLink[];
  bodyHtml?: string;
  sunsetNote?: string;
  successor?: SuccessorLink;
}

function ProductDetailPage({
  pain,
  summary,
  status,
  cta,
  platforms,
  links,
  bodyHtml,
  sunsetNote,
  successor,
}: ProductDetailPageProps) {
  const isSunset = status === "sunset";

  return (
    <article className="product-detail">
      <h1>{pain}</h1>
      <p className="product-subhead">{summary}</p>

      {isSunset ? (
        <section className="product-sunset-block" aria-labelledby="sunset-heading">
          <h2 id="sunset-heading">This product has been retired</h2>
          <p>{sunsetNote}</p>
          {successor && (
            <p>
              Its successor: <a href={successor.href}>{successor.title}</a>
            </p>
          )}
        </section>
      ) : (
        <>
          <p className="product-cta">
            <a className="product-cta-button" href={cta.href}>
              {cta.label}
            </a>
          </p>

          {bodyHtml && <div className="product-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />}

          <p className="platform-badges">
            {platforms.map((platform) => (
              <span key={platform} className="platform-badge">
                {platform}
              </span>
            ))}
          </p>

          {links && links.length > 0 && (
            <p className="project-links">
              {links.map((link) => (
                <a key={link.href} className="project-link-pill" href={link.href}>
                  {link.label}
                </a>
              ))}
            </p>
          )}
        </>
      )}
    </article>
  );
}

export default ProductDetailPage;
