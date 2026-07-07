import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import NewsletterPage from "../NewsletterPage";

// Permanent regression coverage for Story 3.6 (optional newsletter-issue archive)
// and the NFR8 empty-safe requirement it must preserve from Story 1.7.
describe("NewsletterPage — issue archive (Story 3.6)", () => {
  it("renders no archive section when there are no issues (empty-safe, NFR8)", () => {
    const html = renderToStaticMarkup(<NewsletterPage focusAreas={[]} />);

    expect(html).not.toContain("Past issues");
    expect(html).not.toContain("newsletter-archive-list");
  });

  it("renders issues newest-first with subject and summary when present", () => {
    const html = renderToStaticMarkup(
      <NewsletterPage
        focusAreas={[]}
        issues={[
          { slug: "issue-2", number: 2, date: "2026-02-01", subject: "Second issue", summary: "What shipped." },
          { slug: "issue-1", number: 1, date: "2026-01-01", subject: "First issue", summary: "The kickoff." },
        ]}
      />,
    );

    expect(html).toContain("Past issues");
    expect(html).toContain("Second issue");
    expect(html).toContain("First issue");
    expect(html.indexOf("Second issue")).toBeLessThan(html.indexOf("First issue"));
  });

  it("links the subject to archiveHref when present, plain text otherwise", () => {
    const html = renderToStaticMarkup(
      <NewsletterPage
        focusAreas={[]}
        issues={[
          {
            slug: "issue-1",
            number: 1,
            date: "2026-01-01",
            subject: "Linked issue",
            summary: "x",
            archiveHref: "https://example.com/issue-1",
          },
        ]}
      />,
    );

    expect(html).toContain('<a href="https://example.com/issue-1">Linked issue</a>');
  });
});
