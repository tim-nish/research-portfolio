import { describe, expect, it } from "vitest";
import { assertTrailingSlashPolicy } from "../trailingSlashPolicy";

describe("assertTrailingSlashPolicy", () => {
  it("passes for routes ending in a trailing slash", () => {
    expect(() => assertTrailingSlashPolicy("/about/")).not.toThrow();
    expect(() => assertTrailingSlashPolicy("/projects/kagamios/")).not.toThrow();
    expect(() => assertTrailingSlashPolicy("/")).not.toThrow();
  });

  it("throws for a content route missing a trailing slash", () => {
    expect(() => assertTrailingSlashPolicy("/about")).toThrow(/Trailing-slash policy violation/);
  });

  it("exempts the literal /404 route", () => {
    expect(() => assertTrailingSlashPolicy("/404")).not.toThrow();
  });

  it("exempts non-HTML file routes", () => {
    expect(() => assertTrailingSlashPolicy("/sitemap.xml")).not.toThrow();
    expect(() => assertTrailingSlashPolicy("/robots.txt")).not.toThrow();
    expect(() => assertTrailingSlashPolicy("/feed.xml")).not.toThrow();
  });
});
