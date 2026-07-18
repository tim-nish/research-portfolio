import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { renderToStaticMarkup } from "react-dom/server";
import type { ContentRecord, ContentRegistry } from "../src/content/load";
import { loadContentRegistry } from "../src/content/load";
import { collectFeaturedWork } from "../src/content/featuredWork";
import { collectNewsletterIssues } from "../src/content/newsletterView";
import { groupProductsForIndex, resolveSuccessorLink } from "../src/content/productView";
import { collectRecentWriting } from "../src/content/recentWriting";
import { collectWritingEntries } from "../src/content/writingView";
import { buildAtomFeed } from "../src/feed/buildFeed";
import { collectFeedItems } from "../src/feed/feedItems";
import {
  findBenchmarkProjects,
  findDatasetLinks,
  findLeaderboardLink,
  groupProjectsForIndex,
} from "../src/content/projectView";
import {
  findCodeLink,
  findPaperLink,
  groupPublicationsByYear,
  highlightOwnerAuthor,
} from "../src/content/publicationView";
import {
  isSiteProjection,
  type AnyArticleFrontmatter,
  type ArticleFrontmatter,
  type ProductFrontmatter,
  type ProjectFrontmatter,
  type PublicationFrontmatter,
  type SiteProjectionFrontmatter,
} from "../src/content/schema";
import ReducedChromeLayout from "../src/layout/ReducedChromeLayout";
import SiteLayout from "../src/layout/SiteLayout";
import { NEWSLETTER_CONFIG } from "../src/newsletter/config";
import { initNewsletterEmbedFallback } from "../src/newsletter/embedFallback";
import AboutPage from "../src/pages/AboutPage";
import ArticleDetailPage from "../src/pages/ArticleDetailPage";
import BenchmarksPage from "../src/pages/BenchmarksPage";
import HomePage from "../src/pages/HomePage";
import NewsletterPage from "../src/pages/NewsletterPage";
import NotFoundPage from "../src/pages/NotFoundPage";
import ProductDetailPage from "../src/pages/ProductDetailPage";
import ProductsIndexPage from "../src/pages/ProductsIndexPage";
import ProjectDetailPage from "../src/pages/ProjectDetailPage";
import ProjectsIndexPage from "../src/pages/ProjectsIndexPage";
import PublicationDetailPage from "../src/pages/PublicationDetailPage";
import PublicationsIndexPage from "../src/pages/PublicationsIndexPage";
import WritingIndexPage from "../src/pages/WritingIndexPage";
import { buildRedirectStubHtml, loadRedirects } from "../src/redirects/redirects";
import { assertTrailingSlashPolicy } from "../src/routing/trailingSlashPolicy";
import {
  articleJsonLd,
  buildPageMetaHtml,
  datasetJsonLd,
  personJsonLd,
  scholarlyArticleJsonLd,
  softwareApplicationJsonLd,
} from "../src/seo/pageMeta";
import { buildRobotsTxt, buildSitemapXml } from "../src/seo/sitemap";

// Only relevant once NEWSLETTER_CONFIG.mode is "embed" — serialized from the same
// function vitest exercises against jsdom (src/newsletter/embedFallback.ts), so the
// tested behavior and the shipped script can't drift apart.
const NEWSLETTER_EMBED_FALLBACK_SCRIPT = `(${initNewsletterEmbedFallback.toString()})();`;

const BENCHMARKS_STANCE =
  "Evaluation engineering is a focus area here, not an afterthought: benchmarks are built to be " +
  "reproducible, honest about failure modes, and useful as public leaderboards — not just a checkbox " +
  "before a paper submission.";

// Enables the citation "Copy BibTeX" button (progressive enhancement — the BibTeX
// text itself is always visible in a <pre>, per Story 1.3's AC on JS-optional copy).
const CITATION_COPY_SCRIPT = `
document.querySelectorAll('[data-copy-target]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var target = document.getElementById(btn.getAttribute('data-copy-target'));
    if (target && navigator.clipboard) {
      navigator.clipboard.writeText(target.textContent || '');
      var original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(function () { btn.textContent = original; }, 1500);
    }
  });
});
`.trim();

const DIST_DIR = path.join(process.cwd(), "dist");
const MANIFEST_PATH = path.join(DIST_DIR, ".vite", "manifest.json");

interface ViteManifestEntry {
  file: string;
}

function loadStylesheetHref(): string {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8")) as Record<string, ViteManifestEntry>;
  const entry = manifest["src/styles.css"];
  if (!entry?.file) {
    throw new Error(`Could not find the "src/styles.css" entry in ${MANIFEST_PATH}`);
  }
  return `/${entry.file}`;
}

// Populated by every writeStaticPage() call — the sitemap is built from this at the
// end of main(), so it can never drift from what was actually generated (AC3: grows
// automatically as later epics add pages, no code change needed here).
const generatedRoutes: string[] = [];

function writeStaticPage(
  routePath: string,
  headHtml: string,
  bodyHtml: string,
  stylesheetHref: string,
  scripts: (string | undefined | false)[] = [],
) {
  assertTrailingSlashPolicy(routePath);

  const scriptTags = scripts
    .filter((script): script is string => Boolean(script))
    .map((script) => `<script>${script}</script>`)
    .join("\n    ");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="${stylesheetHref}" />
    ${headHtml}
  </head>
  <body>
    <div id="root">${bodyHtml}</div>
    ${scriptTags}
  </body>
</html>
`;

  const outDir = path.join(DIST_DIR, routePath.replace(/^\/|\/$/g, ""));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html);
  generatedRoutes.push(routePath);
  console.log(`Generated ${routePath}`);
}

function generateSitemapAndRobots() {
  fs.writeFileSync(path.join(DIST_DIR, "sitemap.xml"), buildSitemapXml(generatedRoutes));
  fs.writeFileSync(path.join(DIST_DIR, "robots.txt"), buildRobotsTxt());
  console.log("Generated /sitemap.xml and /robots.txt");
}

const REDIRECTS_PATH = path.join(process.cwd(), "content", "redirects.yml");

function generateRedirectStubs(stylesheetHref: string) {
  const redirects = loadRedirects(REDIRECTS_PATH);
  for (const { source, destination } of redirects) {
    const outDir = path.join(DIST_DIR, source.replace(/^\/|\/$/g, ""));
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "index.html"), buildRedirectStubHtml(destination, stylesheetHref));
    console.log(`Generated redirect stub ${source} -> ${destination}`);
  }
}

function generateNotFoundPage(profileData: ProfileData, stylesheetHref: string) {
  const bodyHtml = renderToStaticMarkup(
    <NotFoundPage ownerName={profileData.name} positioning={profileData.positioning} />,
  );
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="${stylesheetHref}" />
    <title>Not found — ${profileData.name}</title>
  </head>
  <body>
    <div id="root">${bodyHtml}</div>
  </body>
</html>
`;
  // GitHub Pages requires the custom 404 document at the site root as 404.html
  // (not a /404/ directory) to serve it automatically for unmatched paths.
  fs.writeFileSync(path.join(DIST_DIR, "404.html"), html);
  console.log("Generated /404");
}

// Included on every page once NEWSLETTER_CONFIG.mode is "embed" (the shared
// NewsletterCapture in the footer means every page is a candidate); a no-op
// query-and-return when mode is "link", as it is today.
const NEWSLETTER_SCRIPTS = NEWSLETTER_CONFIG.mode === "embed" ? [NEWSLETTER_EMBED_FALLBACK_SCRIPT] : [];

interface ProfileData {
  name: string;
  positioning: string;
  now?: string;
  focus_areas: string[];
  identity_links: { label: string; href: string }[];
  languages_note?: string;
  bio: string;
}

function generateAboutPage(profileData: ProfileData, stylesheetHref: string) {
  const bioHtml = marked.parse(profileData.bio) as string;

  const bodyHtml = renderToStaticMarkup(
    <SiteLayout>
      <AboutPage
        bioHtml={bioHtml}
        focusAreas={profileData.focus_areas}
        identityLinks={profileData.identity_links}
        languagesNote={profileData.languages_note}
      />
    </SiteLayout>,
  );

  const headHtml = buildPageMetaHtml({
    title: "About",
    description: profileData.positioning,
    path: "/about/",
    jsonLd: personJsonLd({
      name: profileData.name,
      positioning: profileData.positioning,
      identityLinks: profileData.identity_links,
    }),
  });

  writeStaticPage("/about/", headHtml, bodyHtml, stylesheetHref, NEWSLETTER_SCRIPTS);
}

function generateProjectsIndexPage(registry: ContentRegistry, focusAreas: string[], stylesheetHref: string) {
  const { active, archived } = groupProjectsForIndex(registry.records.project as ContentRecord<ProjectFrontmatter>[]);
  const toSummary = (record: (typeof active)[number]) => ({
    slug: record.slug,
    title: record.data.title,
    kind: record.data.kind,
    summary: record.data.summary,
    started: record.data.started,
    links: record.data.links,
  });

  const introLine =
    focusAreas.length > 0
      ? `Projects spanning ${focusAreas.join(", ")}.`
      : "Open-source projects and research systems.";

  const bodyHtml = renderToStaticMarkup(
    <SiteLayout>
      <ProjectsIndexPage introLine={introLine} active={active.map(toSummary)} archived={archived.map(toSummary)} />
    </SiteLayout>,
  );

  const headHtml = buildPageMetaHtml({
    title: "Projects",
    description: introLine,
    path: "/projects/",
  });

  writeStaticPage("/projects/", headHtml, bodyHtml, stylesheetHref, NEWSLETTER_SCRIPTS);
}

function generateProjectDetailPages(registry: ContentRegistry, stylesheetHref: string) {
  for (const record of registry.records.project) {
    const data = record.data as ProjectFrontmatter;
    const relatedSlugsByType = registry.relatedBy.project[record.slug];

    const bodyHtml = renderToStaticMarkup(
      <SiteLayout>
        <ProjectDetailPage
          title={data.title}
          kind={data.kind}
          status={data.status}
          started={data.started}
          links={data.links}
          bodyHtml={record.bodyHtml || undefined}
          citation={data.citation}
          relatedSlugsByType={relatedSlugsByType}
        />
      </SiteLayout>,
    );

    const path = `/projects/${record.slug}/`;
    const datasetLinks = data.kind === "benchmark" ? findDatasetLinks(data.links) : [];

    const headHtml = buildPageMetaHtml({
      title: data.title,
      description: data.summary,
      path,
      // Dataset-bearing CreativeWork JSON-LD belongs on the detail page, never on
      // the /benchmarks/ index itself (Story 1.4 AC4).
      jsonLd:
        datasetLinks.length > 0
          ? datasetJsonLd({ title: data.title, summary: data.summary, path, datasetLinks, citation: data.citation })
          : undefined,
    });

    writeStaticPage(path, headHtml, bodyHtml, stylesheetHref, [
      data.citation ? CITATION_COPY_SCRIPT : undefined,
      ...NEWSLETTER_SCRIPTS,
    ]);
  }
}

function generateBenchmarksPage(registry: ContentRegistry, stylesheetHref: string) {
  const benchmarks = findBenchmarkProjects(registry.records.project as ContentRecord<ProjectFrontmatter>[]).map(
    (record) => ({
      slug: record.slug,
      title: record.data.title,
      summary: record.data.summary,
      leaderboardLink: findLeaderboardLink(record.data.links),
      datasetLinks: findDatasetLinks(record.data.links),
      hasCitation: Boolean(record.data.citation),
    }),
  );

  const bodyHtml = renderToStaticMarkup(
    <SiteLayout>
      <BenchmarksPage stanceParagraph={BENCHMARKS_STANCE} benchmarks={benchmarks} />
    </SiteLayout>,
  );

  const headHtml = buildPageMetaHtml({
    title: "Benchmarks",
    description: BENCHMARKS_STANCE,
    path: "/benchmarks/",
  });

  writeStaticPage("/benchmarks/", headHtml, bodyHtml, stylesheetHref, NEWSLETTER_SCRIPTS);
}

function generatePublicationsIndexPage(registry: ContentRegistry, ownerName: string, stylesheetHref: string) {
  const groups = groupPublicationsByYear(registry.records.publication as ContentRecord<PublicationFrontmatter>[]).map(
    (group) => ({
      year: group.year,
      publications: group.publications.map((record) => ({
        slug: record.slug,
        title: record.data.title,
        authors: highlightOwnerAuthor(record.data.authors, ownerName),
        venue: record.data.venue,
        year: record.data.year,
        status: record.data.status,
        links: record.data.links,
      })),
    }),
  );

  const bodyHtml = renderToStaticMarkup(
    <SiteLayout>
      <PublicationsIndexPage groups={groups} />
    </SiteLayout>,
  );

  const headHtml = buildPageMetaHtml({
    title: "Publications",
    description: "Papers, preprints, and their code, grouped by year.",
    path: "/publications/",
  });

  writeStaticPage("/publications/", headHtml, bodyHtml, stylesheetHref, NEWSLETTER_SCRIPTS);
}

function generateWritingIndexPage(registry: ContentRegistry, stylesheetHref: string) {
  const entries = collectWritingEntries(registry);

  const bodyHtml = renderToStaticMarkup(
    <SiteLayout>
      <WritingIndexPage entries={entries} />
    </SiteLayout>,
  );

  const headHtml = buildPageMetaHtml({
    title: "Writing",
    description: "Writing grounded in built systems and measured results.",
    path: "/writing/",
  });

  writeStaticPage("/writing/", headHtml, bodyHtml, stylesheetHref, NEWSLETTER_SCRIPTS);
}

function generateArticleDetailPages(registry: ContentRegistry, ownerName: string, stylesheetHref: string) {
  // Filters to canonical records before the loop even starts, not via a per-record
  // runtime guard — external-mode articles literally never reach writeStaticPage,
  // keeping AP-6 ("external entries do NOT get a detail page") true by construction.
  const allArticles = registry.records.article as ContentRecord<AnyArticleFrontmatter>[];
  const canonicalArticles = allArticles.filter(
    (record): record is ContentRecord<ArticleFrontmatter> =>
      !isSiteProjection(record.data) && (record.data as ArticleFrontmatter).mode === "canonical",
  );

  // Site-canonical projections (docs/article-publishing-spec.md §3): the committed
  // markdown body renders verbatim as the page — titled from frontmatter only, no
  // build-time fetching or enrichment from the authoring side.
  const projections = allArticles.filter(
    (record): record is ContentRecord<SiteProjectionFrontmatter> => isSiteProjection(record.data),
  );

  for (const record of projections) {
    const data = record.data;

    const bodyHtml = renderToStaticMarkup(
      <SiteLayout>
        <ArticleDetailPage
          title={data.title}
          date={data.published}
          status="published"
          bodyHtml={record.bodyHtml}
        />
      </SiteLayout>,
    );

    const pagePath = `/writing/${record.slug}/`;
    const headHtml = buildPageMetaHtml({
      title: data.title,
      // Projections carry no summary field (spec §2); the title doubles as the
      // meta description rather than deriving one from the body.
      description: data.title,
      path: pagePath,
      jsonLd: articleJsonLd({
        title: data.title,
        date: data.published,
        path: pagePath,
        authorName: ownerName,
      }),
    });

    writeStaticPage(pagePath, headHtml, bodyHtml, stylesheetHref, NEWSLETTER_SCRIPTS);
  }

  for (const record of canonicalArticles) {
    const data = record.data;
    const relatedSlugsByType = registry.relatedBy.article[record.slug];

    const bodyHtml = renderToStaticMarkup(
      <SiteLayout>
        <ArticleDetailPage
          title={data.title}
          date={data.date}
          updated={data.updated}
          status={data.status}
          bodyHtml={record.bodyHtml}
          topics={data.topics}
          syndication={data.syndication}
          relatedSlugsByType={relatedSlugsByType}
        />
      </SiteLayout>,
    );

    const path = `/writing/${record.slug}/`;
    const headHtml = buildPageMetaHtml({
      title: data.title,
      description: data.summary,
      path,
      jsonLd: articleJsonLd({
        title: data.title,
        date: data.date,
        updated: data.updated,
        path,
        authorName: ownerName,
      }),
    });

    writeStaticPage(path, headHtml, bodyHtml, stylesheetHref, NEWSLETTER_SCRIPTS);
  }
}

function generateProductDetailPages(registry: ContentRegistry, stylesheetHref: string) {
  for (const record of registry.records.product as ContentRecord<ProductFrontmatter>[]) {
    const data = record.data;
    const successor = resolveSuccessorLink(data.sunset?.successor, registry);

    const bodyHtml = renderToStaticMarkup(
      <ReducedChromeLayout>
        <ProductDetailPage
          pain={data.pain}
          summary={data.summary}
          status={data.status}
          cta={data.cta}
          platforms={data.platforms}
          links={data.links}
          bodyHtml={record.bodyHtml || undefined}
          sunsetNote={data.sunset?.note}
          successor={successor}
        />
      </ReducedChromeLayout>,
    );

    const path = `/products/${record.slug}/`;
    // Spec §8.2/FR10: the page's title/description are the pain phrase, not a
    // generic product-name headline — the page itself is the SEO instrument for it.
    const headHtml = buildPageMetaHtml({
      title: data.pain,
      description: data.summary,
      path,
      jsonLd: softwareApplicationJsonLd({
        title: data.title,
        summary: data.summary,
        path,
        pricing: data.pricing,
      }),
    });

    writeStaticPage(path, headHtml, bodyHtml, stylesheetHref, NEWSLETTER_SCRIPTS);
  }
}

function generateProductsIndexPage(registry: ContentRegistry, stylesheetHref: string) {
  const { live, validating, retired } = groupProductsForIndex(registry.records.product as ContentRecord<ProductFrontmatter>[]);
  const toCardProps = (record: (typeof live)[number]) => ({
    slug: record.slug,
    title: record.data.title,
    pain: record.data.pain,
    platforms: record.data.platforms,
    ctaHref: record.data.cta.href,
    ctaLabel: record.data.cta.label,
  });
  const toRetiredProps = (record: (typeof retired)[number]) => ({
    slug: record.slug,
    title: record.data.title,
    sunsetDate: record.data.sunset!.date,
  });

  // Uses SiteLayout (full global chrome) — the reduced-chrome exception from Story
  // 3.2 applies only to /products/<slug>/, never the index (spec §7.2).
  const bodyHtml = renderToStaticMarkup(
    <SiteLayout>
      <ProductsIndexPage
        live={live.map(toCardProps)}
        validating={validating.map(toCardProps)}
        retired={retired.map(toRetiredProps)}
      />
    </SiteLayout>,
  );

  const headHtml = buildPageMetaHtml({
    title: "Products",
    description: "Small, focused tools, built for researchers unless stated otherwise.",
    path: "/products/",
  });

  writeStaticPage("/products/", headHtml, bodyHtml, stylesheetHref, NEWSLETTER_SCRIPTS);
}

function generatePublicationDetailPages(registry: ContentRegistry, ownerName: string, stylesheetHref: string) {
  for (const record of registry.records.publication) {
    const data = record.data as PublicationFrontmatter;
    const relatedSlugsByType = registry.relatedBy.publication[record.slug];
    const supersededByRecord = data.supersededBy
      ? (registry.bySlug.publication[data.supersededBy] as ContentRecord<PublicationFrontmatter> | undefined)
      : undefined;

    const bodyHtml = renderToStaticMarkup(
      <SiteLayout>
        <PublicationDetailPage
          title={data.title}
          authors={highlightOwnerAuthor(data.authors, ownerName)}
          venue={data.venue}
          year={data.year}
          status={data.status}
          links={data.links}
          paperLink={findPaperLink(data.links)}
          codeLink={findCodeLink(data.links)}
          bodyHtml={record.bodyHtml || undefined}
          citation={data.citation}
          supersededByTitle={supersededByRecord?.data.title}
          supersededBySlug={data.supersededBy}
          relatedSlugsByType={relatedSlugsByType}
        />
      </SiteLayout>,
    );

    const path = `/publications/${record.slug}/`;
    const headHtml = buildPageMetaHtml({
      title: data.title,
      description: `${data.authors.join(", ")} — ${data.venue} ${data.year}`,
      path,
      jsonLd: scholarlyArticleJsonLd({
        title: data.title,
        authors: data.authors,
        venue: data.venue,
        year: data.year,
        path,
        citation: data.citation,
      }),
    });

    writeStaticPage(path, headHtml, bodyHtml, stylesheetHref, [CITATION_COPY_SCRIPT, ...NEWSLETTER_SCRIPTS]);
  }
}

function generateNewsletterPage(registry: ContentRegistry, focusAreas: string[], stylesheetHref: string) {
  const issues = collectNewsletterIssues(registry);
  const bodyHtml = renderToStaticMarkup(
    <SiteLayout>
      <NewsletterPage focusAreas={focusAreas} issues={issues} />
    </SiteLayout>,
  );

  const headHtml = buildPageMetaHtml({
    title: "Newsletter",
    description: "Occasional notes on new projects, benchmark results, and tools as they ship.",
    path: "/newsletter/",
  });

  writeStaticPage("/newsletter/", headHtml, bodyHtml, stylesheetHref, NEWSLETTER_SCRIPTS);
}

function generateHomePage(registry: ContentRegistry, profileData: ProfileData, stylesheetHref: string) {
  const featuredWork = collectFeaturedWork(registry);
  const benchmarkCount = findBenchmarkProjects(registry.records.project as ContentRecord<ProjectFrontmatter>[]).length;

  // Products has no page yet (Epic 3) — shown without a href until then; folds in
  // automatically (becomes a link) once Story 3.3 ships /products/, no code change
  // needed to this list's shape (NFR8).
  const sections = [
    { label: "Projects", href: "/projects/", count: registry.records.project.length },
    { label: "Benchmarks", href: "/benchmarks/", count: benchmarkCount },
    { label: "Publications", href: "/publications/", count: registry.records.publication.length },
    { label: "Products", microDescription: "Small, focused tools" },
    { label: "Newsletter", href: "/newsletter/", microDescription: "Occasional updates on new work" },
  ];

  // Spec §8.2: Home's title is the one exception to the `<Page> — <Owner name>`
  // pattern — `<Owner name> — <positioning fragment>` instead.
  const positioningFragment = profileData.positioning.trim().replace(/\.$/, "");

  const bodyHtml = renderToStaticMarkup(
    <SiteLayout>
      <HomePage
        name={profileData.name}
        positioning={profileData.positioning}
        identityLinks={profileData.identity_links}
        now={profileData.now}
        featuredWork={featuredWork}
        recentWriting={collectRecentWriting(registry)}
        sections={sections}
      />
    </SiteLayout>,
  );

  const headHtml = buildPageMetaHtml({
    title: profileData.name,
    rawTitle: `${profileData.name} — ${positioningFragment}`,
    description: profileData.positioning,
    path: "/",
    jsonLd: personJsonLd({
      name: profileData.name,
      positioning: profileData.positioning,
      identityLinks: profileData.identity_links,
    }),
  });

  writeStaticPage("/", headHtml, bodyHtml, stylesheetHref, NEWSLETTER_SCRIPTS);
}

function generateFeed(registry: ContentRegistry) {
  const items = collectFeedItems(registry);
  fs.writeFileSync(path.join(DIST_DIR, "feed.xml"), buildAtomFeed(items));
  console.log(`Generated /feed.xml (${items.length} item(s))`);
}

function main() {
  const stylesheetHref = loadStylesheetHref();
  const registry = loadContentRegistry();

  const profile = registry.records.profile[0];
  if (profile) {
    const profileData = profile.data as ProfileData;
    generateHomePage(registry, profileData, stylesheetHref);
    generateAboutPage(profileData, stylesheetHref);
    generateProjectsIndexPage(registry, profileData.focus_areas, stylesheetHref);
    generatePublicationsIndexPage(registry, profileData.name, stylesheetHref);
    generatePublicationDetailPages(registry, profileData.name, stylesheetHref);
    generateWritingIndexPage(registry, stylesheetHref);
    generateArticleDetailPages(registry, profileData.name, stylesheetHref);
    generateNewsletterPage(registry, profileData.focus_areas, stylesheetHref);
    generateNotFoundPage(profileData, stylesheetHref);
  } else {
    console.log(
      "No profile record found — skipping /, /about/, /projects/, /publications/, /newsletter/, and /404 generation.",
    );
  }

  generateProjectDetailPages(registry, stylesheetHref);
  generateBenchmarksPage(registry, stylesheetHref);
  generateProductDetailPages(registry, stylesheetHref);
  generateProductsIndexPage(registry, stylesheetHref);
  generateFeed(registry);
  generateRedirectStubs(stylesheetHref);

  generateSitemapAndRobots();
}

main();
