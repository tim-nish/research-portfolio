import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ProductDetailPage from "../ProductDetailPage";

const baseProps = {
  pain: "Get a fixture pain statement resolved quickly.",
  summary: "A fixture product summary.",
  cta: { href: "#newsletter", label: "Get notified" },
  platforms: ["web"],
};

describe("ProductDetailPage — H1/subhead driven by pain/summary (AC4)", () => {
  it("uses pain as the H1 and summary as the subhead, not a generic product name", () => {
    const html = renderToStaticMarkup(<ProductDetailPage {...baseProps} status="live" />);

    expect(html).toContain("<h1>Get a fixture pain statement resolved quickly.</h1>");
    expect(html).toContain('class="product-subhead">A fixture product summary.');
  });
});

// Permanent regression coverage for AC-8/AC3 (sunset lifecycle, spec §6.4), matching
// the precedent set for archived projects (Story 1.11) and deprecated articles
// (Story 2.3).
describe("ProductDetailPage — sunset lifecycle (AC3)", () => {
  it("replaces the CTA/body/platform blocks with the sunset note when status is sunset", () => {
    const html = renderToStaticMarkup(
      <ProductDetailPage {...baseProps} status="sunset" sunsetNote="Retired after validation." bodyHtml="<p>Should not render.</p>" />,
    );

    expect(html).toContain("This product has been retired");
    expect(html).toContain("Retired after validation.");
    expect(html).not.toContain("Should not render.");
    expect(html).not.toContain("product-cta-button");
    expect(html).not.toContain("platform-badges");
  });

  it("shows the primary CTA and body for live/validating products, not the sunset block", () => {
    const html = renderToStaticMarkup(
      <ProductDetailPage {...baseProps} status="live" bodyHtml="<p>Problem, how it works, proof.</p>" />,
    );

    expect(html).not.toContain("This product has been retired");
    expect(html).toContain("product-cta-button");
    expect(html).toContain("Problem, how it works, proof.");
  });

  it("renders the successor link only when present", () => {
    const withSuccessor = renderToStaticMarkup(
      <ProductDetailPage
        {...baseProps}
        status="sunset"
        sunsetNote="Retired."
        successor={{ title: "New Product", href: "/products/new-product/" }}
      />,
    );
    const without = renderToStaticMarkup(<ProductDetailPage {...baseProps} status="sunset" sunsetNote="Retired." />);

    expect(withSuccessor).toContain('<a href="/products/new-product/">New Product</a>');
    expect(without).not.toContain("Its successor");
  });
});
