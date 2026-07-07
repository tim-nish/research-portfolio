import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ProjectDetailPage from "../ProjectDetailPage";

const baseProps = {
  title: "Fixture Project",
  kind: "tool",
  links: [{ label: "GitHub", href: "https://github.com/example/fixture" }],
};

// Permanent regression coverage for AC-8 (lifecycle rendering, spec §6.4): Story
// 1.11's Phase 1 acceptance sweep requires this to "hold" going forward, not just be
// spot-checked once and discarded — unlike the earlier manual temp-fixture
// verification used during Stories 1.3/1.5/1.6.
describe("ProjectDetailPage — archived lifecycle (AC-8)", () => {
  it("renders the archived banner with the last-active date when status is archived", () => {
    const html = renderToStaticMarkup(
      <ProjectDetailPage {...baseProps} status="archived" started="2025-03" />,
    );

    expect(html).toContain('class="lifecycle-banner"');
    expect(html).toContain("This project is archived (last active 2025-03).");
  });

  it("does not render the archived banner for active or maintained projects", () => {
    const active = renderToStaticMarkup(<ProjectDetailPage {...baseProps} status="active" started="2026-01" />);
    const maintained = renderToStaticMarkup(
      <ProjectDetailPage {...baseProps} status="maintained" started="2026-01" />,
    );

    expect(active).not.toContain("lifecycle-banner");
    expect(maintained).not.toContain("lifecycle-banner");
  });

  it("still renders the kind/status/started meta line for archived projects", () => {
    const html = renderToStaticMarkup(
      <ProjectDetailPage {...baseProps} status="archived" started="2025-03" />,
    );

    expect(html).toContain("tool");
    expect(html).toContain("archived");
  });
});
