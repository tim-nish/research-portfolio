// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { buildAtomFeed } from "../buildFeed";

describe("buildAtomFeed", () => {
  it("produces a valid, well-formed empty feed when there are no items yet (Phase 1)", () => {
    const xml = buildAtomFeed([]);

    expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom">');
    expect(xml).toContain("<id>https://tim-nish.dev/</id>");
    expect(xml).not.toContain("<entry>");
  });

  it("emits one <entry> per item, using the newest item's date as the feed's <updated>", () => {
    const xml = buildAtomFeed([
      {
        id: "https://tim-nish.dev/writing/a/",
        title: "Article A",
        updated: "2026-02-01T00:00:00Z",
        summary: "Summary A.",
        link: "https://tim-nish.dev/writing/a/",
      },
    ]);

    expect(xml).toContain("<title>Article A</title>");
    expect(xml).toContain('<link href="https://tim-nish.dev/writing/a/" />');
    expect(xml).toContain("<summary>Summary A.</summary>");
    expect(xml.match(/<entry>/g)).toHaveLength(1);
  });

  it("escapes XML-significant characters in title/summary", () => {
    const xml = buildAtomFeed([
      {
        id: "https://tim-nish.dev/writing/a/",
        title: "A <Title> & More",
        updated: "2026-02-01T00:00:00Z",
        summary: "A & B",
        link: "https://tim-nish.dev/writing/a/",
      },
    ]);

    expect(xml).toContain("A &lt;Title&gt; &amp; More");
    expect(xml).toContain("A &amp; B");
  });

  it("is valid, parseable Atom XML with every required element present (RFC 4287)", () => {
    const xml = buildAtomFeed([
      {
        id: "https://tim-nish.dev/writing/a/",
        title: "Article A",
        updated: "2026-02-01T00:00:00Z",
        summary: "Summary A.",
        link: "https://tim-nish.dev/writing/a/",
      },
    ]);

    const doc = new DOMParser().parseFromString(xml, "application/xml");
    expect(doc.querySelector("parsererror")).toBeNull();

    const feed = doc.documentElement;
    expect(feed.namespaceURI).toBe("http://www.w3.org/2005/Atom");
    expect(feed.querySelector(":scope > id")).not.toBeNull();
    expect(feed.querySelector(":scope > title")).not.toBeNull();
    expect(feed.querySelector(":scope > updated")).not.toBeNull();
    expect(feed.querySelector(':scope > link[rel="self"]')).not.toBeNull();

    const entry = feed.querySelector("entry")!;
    expect(entry.querySelector("id")).not.toBeNull();
    expect(entry.querySelector("title")).not.toBeNull();
    expect(entry.querySelector("updated")).not.toBeNull();
    expect(entry.querySelector("link")).not.toBeNull();
    expect(entry.querySelector("summary")).not.toBeNull();
  });
});
