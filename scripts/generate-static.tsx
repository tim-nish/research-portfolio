import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { renderToStaticMarkup } from "react-dom/server";
import { loadContentRegistry } from "../src/content/load";
import SiteLayout from "../src/layout/SiteLayout";
import AboutPage from "../src/pages/AboutPage";
import { buildPageMetaHtml, personJsonLd } from "../src/seo/pageMeta";

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

function writeStaticPage(routePath: string, headHtml: string, bodyHtml: string, stylesheetHref: string) {
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

function main() {
  const stylesheetHref = loadStylesheetHref();
  const registry = loadContentRegistry();

  const profile = registry.records.profile[0];
  if (profile) {
    generateAboutPage(profile.data as ProfileData, stylesheetHref);
  } else {
    console.log("No profile record found — skipping /about/ generation.");
  }
}

main();
