// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initNewsletterEmbedFallback } from "../embedFallback";

function buildWrapper(fallbackHref: string) {
  document.body.innerHTML = `
    <div class="newsletter-embed-wrapper" data-embed-fallback-href="${fallbackHref}">
      <iframe src="https://example.com/embed" title="Newsletter signup"></iframe>
    </div>
  `;
  return document.querySelector(".newsletter-embed-wrapper")!;
}

describe("initNewsletterEmbedFallback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps the iframe when it fires load before the timeout", () => {
    const wrapper = buildWrapper("mailto:test@example.com");
    initNewsletterEmbedFallback();

    wrapper.querySelector("iframe")!.dispatchEvent(new Event("load"));
    vi.advanceTimersByTime(5000);

    expect(wrapper.querySelector("iframe")).not.toBeNull();
    expect(wrapper.querySelector(".newsletter-capture-fallback")).toBeNull();
  });

  it("degrades to a plain link on an error event", () => {
    const wrapper = buildWrapper("mailto:test@example.com");
    initNewsletterEmbedFallback();

    wrapper.querySelector("iframe")!.dispatchEvent(new Event("error"));

    expect(wrapper.querySelector("iframe")).toBeNull();
    const fallback = wrapper.querySelector(".newsletter-capture-fallback") as HTMLAnchorElement;
    expect(fallback.getAttribute("href")).toBe("mailto:test@example.com");
  });

  it("degrades to a plain link if load never fires before the timeout", () => {
    const wrapper = buildWrapper("mailto:test@example.com");
    initNewsletterEmbedFallback();

    vi.advanceTimersByTime(5000);

    expect(wrapper.querySelector("iframe")).toBeNull();
    expect(wrapper.querySelector(".newsletter-capture-fallback")).not.toBeNull();
  });

  it("does nothing when no embed wrapper is present", () => {
    document.body.innerHTML = "";
    expect(() => initNewsletterEmbedFallback()).not.toThrow();
  });
});
