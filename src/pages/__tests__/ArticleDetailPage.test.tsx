import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ArticleDetailPage from "../ArticleDetailPage";

const baseProps = {
  title: "Fixture Article",
  date: "2026-01-01",
  bodyHtml: "<p>Fixture body.</p>",
};

// Permanent regression coverage for AC-8 (lifecycle rendering, spec §6.4), matching
// the precedent set for ProjectDetailPage's archived-state test in Story 1.11.
describe("ArticleDetailPage — deprecated lifecycle (AC-8)", () => {
  it("renders the deprecated banner when status is deprecated", () => {
    const html = renderToStaticMarkup(<ArticleDetailPage {...baseProps} status="deprecated" />);

    expect(html).toContain('class="lifecycle-banner"');
    expect(html).toContain("This article is deprecated");
  });

  it("does not render the deprecated banner for published or updated articles", () => {
    const published = renderToStaticMarkup(<ArticleDetailPage {...baseProps} status="published" />);
    const updated = renderToStaticMarkup(<ArticleDetailPage {...baseProps} status="updated" updated="2026-02-01" />);

    expect(published).not.toContain("lifecycle-banner");
    expect(updated).not.toContain("lifecycle-banner");
  });

  it("shows the updated date only when present", () => {
    const html = renderToStaticMarkup(<ArticleDetailPage {...baseProps} status="updated" updated="2026-02-01" />);

    expect(html).toContain("updated 2026-02-01");
  });

  it("renders a syndication note only when syndication entries are present", () => {
    const withSyndication = renderToStaticMarkup(
      <ArticleDetailPage
        {...baseProps}
        status="published"
        syndication={[{ platform: "devto", href: "https://dev.to/example/piece" }]}
      />,
    );
    const without = renderToStaticMarkup(<ArticleDetailPage {...baseProps} status="published" />);

    expect(withSyndication).toContain("syndication-note");
    expect(withSyndication).toContain("https://dev.to/example/piece");
    expect(without).not.toContain("syndication-note");
  });
});
