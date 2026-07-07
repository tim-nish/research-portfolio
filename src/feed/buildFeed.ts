import { OWNER_NAME, SITE_URL } from "../seo/pageMeta";
import type { FeedItem } from "./feedItems";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Builds `/feed.xml` as a valid Atom feed (spec §8.3, FR8) from whatever items are
 * currently eligible — an empty `<feed>` with zero `<entry>` elements is valid Atom,
 * which is exactly Phase 1's state until Epic 2 adds canonical articles.
 */
export function buildAtomFeed(items: FeedItem[]): string {
  const feedUpdated = items[0]?.updated ?? new Date().toISOString();

  const entries = items
    .map(
      (item) => `
  <entry>
    <id>${escapeXml(item.id)}</id>
    <title>${escapeXml(item.title)}</title>
    <updated>${item.updated}</updated>
    <link href="${escapeXml(item.link)}" />
    <summary>${escapeXml(item.summary)}</summary>
  </entry>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${SITE_URL}/</id>
  <title>${escapeXml(OWNER_NAME)}</title>
  <updated>${feedUpdated}</updated>
  <link href="${SITE_URL}/feed.xml" rel="self" />
  <link href="${SITE_URL}/" />${entries}
</feed>
`;
}
