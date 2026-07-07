export const SITE_URL = "https://tim-nish.dev";
export const OWNER_NAME = "Tomoya Imanishi";

export interface PageMetaInput {
  /** The page/entity part of the title; the owner name is appended automatically. */
  title: string;
  /**
   * Overrides the whole `<title>`/OG/Twitter title verbatim, bypassing the
   * `<title> — <Owner name>` pattern — only Home uses this, per spec §8.2's
   * `<Owner name> — <positioning fragment>` special case.
   */
  rawTitle?: string;
  description: string;
  /** Site-root-relative path, e.g. "/about/". */
  path: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Builds the `<head>` metadata block (title/description/canonical/OG/Twitter/JSON-LD) shared by every page (FR7, spec §8.2). */
export function buildPageMetaHtml({ title, rawTitle, description, path, jsonLd }: PageMetaInput): string {
  const fullTitle = rawTitle ?? `${title} — ${OWNER_NAME}`;
  const canonical = `${SITE_URL}${path}`;
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  const jsonLdHtml = blocks
    .map((block) => `<script type="application/ld+json">${JSON.stringify(block)}</script>`)
    .join("\n");

  return [
    `<title>${escapeAttr(fullTitle)}</title>`,
    `<meta name="description" content="${escapeAttr(description)}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:title" content="${escapeAttr(fullTitle)}" />`,
    `<meta property="og:description" content="${escapeAttr(description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${escapeAttr(fullTitle)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(description)}" />`,
    jsonLdHtml,
  ]
    .filter(Boolean)
    .join("\n    ");
}

export function personJsonLd(profile: { name: string; positioning: string; identityLinks: { label: string; href: string }[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: `${SITE_URL}/`,
    description: profile.positioning,
    sameAs: profile.identityLinks.filter((link) => !link.href.startsWith("mailto:")).map((link) => link.href),
  };
}

/** `Dataset`-bearing `CreativeWork` JSON-LD (spec §8.2) for a benchmark project's detail page — never the `/benchmarks/` index. */
export function datasetJsonLd(project: {
  title: string;
  summary: string;
  path: string;
  datasetLinks: { label: string; href: string }[];
  citation?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: project.title,
    description: project.summary,
    url: `${SITE_URL}${project.path}`,
    distribution: project.datasetLinks.map((link) => ({
      "@type": "DataDownload",
      name: link.label,
      contentUrl: link.href,
    })),
    ...(project.citation ? { citation: project.citation } : {}),
  };
}

/** `ScholarlyArticle` JSON-LD (spec §8.2) for a publication's detail page. */
export function scholarlyArticleJsonLd(publication: {
  title: string;
  authors: string[];
  venue: string;
  year: number;
  path: string;
  citation: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: publication.title,
    author: publication.authors.map((name) => ({ "@type": "Person", name })),
    isPartOf: publication.venue,
    datePublished: String(publication.year),
    url: `${SITE_URL}${publication.path}`,
    citation: publication.citation,
  };
}

/** `SoftwareApplication` JSON-LD (spec §8.2) for a product landing page. */
export function softwareApplicationJsonLd(product: {
  title: string;
  summary: string;
  path: string;
  pricing: "free" | "freemium" | "paid" | "tbd";
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.title,
    description: product.summary,
    url: `${SITE_URL}${product.path}`,
    ...(product.pricing !== "tbd" ? { offers: { "@type": "Offer", category: product.pricing } } : {}),
  };
}

/** `Article` JSON-LD (spec §8.2) for a canonical article's detail page. */
export function articleJsonLd(article: {
  title: string;
  date: string;
  updated?: string;
  path: string;
  authorName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    datePublished: article.date,
    ...(article.updated ? { dateModified: article.updated } : {}),
    url: `${SITE_URL}${article.path}`,
    author: { "@type": "Person", name: article.authorName },
  };
}
