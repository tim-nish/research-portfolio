import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { renderToStaticMarkup } from "react-dom/server";
import type { ContentRecord, ContentRegistry } from "../src/content/load";
import { loadContentRegistry } from "../src/content/load";
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
import type { ProjectFrontmatter, PublicationFrontmatter } from "../src/content/schema";
import SiteLayout from "../src/layout/SiteLayout";
import AboutPage from "../src/pages/AboutPage";
import BenchmarksPage from "../src/pages/BenchmarksPage";
import ProjectDetailPage from "../src/pages/ProjectDetailPage";
import ProjectsIndexPage from "../src/pages/ProjectsIndexPage";
import PublicationDetailPage from "../src/pages/PublicationDetailPage";
import PublicationsIndexPage from "../src/pages/PublicationsIndexPage";
import { buildPageMetaHtml, datasetJsonLd, personJsonLd, scholarlyArticleJsonLd } from "../src/seo/pageMeta";

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
  css?: string[];
}

function loadStylesheetHref(): string {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8")) as Record<string, ViteManifestEntry>;
  const entry = manifest["index.html"];
  const cssFile = entry?.css?.[0];
  if (!cssFile) {
    throw new Error(`Could not find a CSS asset for "index.html" in ${MANIFEST_PATH}`);
  }
  return `/${cssFile}`;
}

function writeStaticPage(
  routePath: string,
  headHtml: string,
  bodyHtml: string,
  stylesheetHref: string,
  scriptHtml?: string,
) {
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
    ${scriptHtml ? `<script>${scriptHtml}</script>` : ""}
  </body>
</html>
`;

  const outDir = path.join(DIST_DIR, routePath.replace(/^\/|\/$/g, ""));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html);
  console.log(`Generated ${routePath}`);
}

interface ProfileData {
  name: string;
  positioning: string;
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

  writeStaticPage("/about/", headHtml, bodyHtml, stylesheetHref);
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

  writeStaticPage("/projects/", headHtml, bodyHtml, stylesheetHref);
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

    writeStaticPage(
      path,
      headHtml,
      bodyHtml,
      stylesheetHref,
      data.citation ? CITATION_COPY_SCRIPT : undefined,
    );
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

  writeStaticPage("/benchmarks/", headHtml, bodyHtml, stylesheetHref);
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

  writeStaticPage("/publications/", headHtml, bodyHtml, stylesheetHref);
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

    writeStaticPage(path, headHtml, bodyHtml, stylesheetHref, CITATION_COPY_SCRIPT);
  }
}

function main() {
  const stylesheetHref = loadStylesheetHref();
  const registry = loadContentRegistry();

  const profile = registry.records.profile[0];
  if (profile) {
    const profileData = profile.data as ProfileData;
    generateAboutPage(profileData, stylesheetHref);
    generateProjectsIndexPage(registry, profileData.focus_areas, stylesheetHref);
    generatePublicationsIndexPage(registry, profileData.name, stylesheetHref);
    generatePublicationDetailPages(registry, profileData.name, stylesheetHref);
  } else {
    console.log("No profile record found — skipping /about/, /projects/, and /publications/ generation.");
  }

  generateProjectDetailPages(registry, stylesheetHref);
  generateBenchmarksPage(registry, stylesheetHref);
}

main();
