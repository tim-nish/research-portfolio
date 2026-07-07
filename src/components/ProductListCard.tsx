export interface ProductListCardProps {
  slug: string;
  title: string;
  pain: string;
  platforms: string[];
  ctaHref: string;
  ctaLabel: string;
}

/** Live/validating product card (spec §7.3): title, pain-derived tagline, platform badges, CTA link. */
function ProductListCard({ slug, title, pain, platforms, ctaHref, ctaLabel }: ProductListCardProps) {
  return (
    <article className="product-list-card">
      <h3>
        <a href={`/products/${slug}/`}>{title}</a>
      </h3>
      <p className="product-tagline">{pain}</p>
      <p className="platform-badges">
        {platforms.map((platform) => (
          <span key={platform} className="platform-badge">
            {platform}
          </span>
        ))}
      </p>
      <p className="product-cta">
        <a className="product-cta-button" href={ctaHref}>
          {ctaLabel}
        </a>
      </p>
    </article>
  );
}

export default ProductListCard;
