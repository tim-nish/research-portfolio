import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildRedirectStubHtml, loadRedirects } from "../redirects";

const tempFiles: string[] = [];

function writeTempYaml(content: string): string {
  const filePath = path.join(os.tmpdir(), `redirects-test-${Date.now()}-${Math.random()}.yml`);
  fs.writeFileSync(filePath, content);
  tempFiles.push(filePath);
  return filePath;
}

afterEach(() => {
  for (const file of tempFiles.splice(0)) fs.rmSync(file, { force: true });
});

describe("loadRedirects", () => {
  it("returns an empty list when the file doesn't exist", () => {
    expect(loadRedirects("/does/not/exist.yml")).toEqual([]);
  });

  it("parses source/destination pairs from YAML", () => {
    const filePath = writeTempYaml(`
- source: /projects/prism/
  destination: /projects/kagamios/
`);

    expect(loadRedirects(filePath)).toEqual([{ source: "/projects/prism/", destination: "/projects/kagamios/" }]);
  });
});

describe("buildRedirectStubHtml", () => {
  it("includes rel=canonical, meta-refresh, and a plain fallback link — all JS-independent", () => {
    const html = buildRedirectStubHtml("/projects/kagamios/");

    // Canonical is absolute from the configured canonical base — a relative
    // canonical would resolve to whatever host serves the page (e.g. the GitHub
    // Pages URL), which spec §4 forbids.
    expect(html).toContain('<link rel="canonical" href="https://tim-nish.dev/projects/kagamios/" />');
    expect(html).toContain('<meta http-equiv="refresh" content="0; url=/projects/kagamios/" />');
    expect(html).toContain('<a href="/projects/kagamios/">Continue to the new location</a>');
    expect(html).not.toContain("<script");
  });

  it("includes the shared stylesheet when a stylesheetHref is given", () => {
    const html = buildRedirectStubHtml("/projects/kagamios/", "/assets/index-abc123.css");

    expect(html).toContain('<link rel="stylesheet" href="/assets/index-abc123.css" />');
  });
});
