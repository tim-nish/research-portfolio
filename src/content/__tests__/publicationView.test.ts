import { describe, expect, it } from "vitest";
import type { ContentRecord } from "../load";
import { findCodeLink, findPaperLink, groupPublicationsByYear, highlightOwnerAuthor } from "../publicationView";
import type { PublicationFrontmatter } from "../schema";

function publication(
  overrides: Partial<PublicationFrontmatter> & { slug: string },
): ContentRecord<PublicationFrontmatter> {
  const data: PublicationFrontmatter = {
    title: overrides.slug,
    authors: ["Fixture Author"],
    venue: "arXiv",
    year: 2026,
    status: "preprint",
    links: [{ label: "arXiv", href: "https://arxiv.org/abs/0000.00000" }],
    citation: "@misc{fixture}",
    featured: false,
    ...overrides,
  };
  return { type: "publication", slug: data.slug, filePath: `${data.slug}.md`, data, body: "", bodyHtml: "" };
}

describe("groupPublicationsByYear", () => {
  it("groups by year, newest first, with entries within a year ordered by title", () => {
    const older = publication({ slug: "older", year: 2024, title: "Zebra Paper" });
    const newerA = publication({ slug: "newer-a", year: 2026, title: "Beta Paper" });
    const newerB = publication({ slug: "newer-b", year: 2026, title: "Alpha Paper" });

    const groups = groupPublicationsByYear([older, newerA, newerB]);

    expect(groups.map((g) => g.year)).toEqual([2026, 2024]);
    expect(groups[0].publications.map((p) => p.slug)).toEqual(["newer-b", "newer-a"]);
  });
});

describe("highlightOwnerAuthor", () => {
  it("marks only the entry matching the owner's exact name", () => {
    const result = highlightOwnerAuthor(["Tomoya Imanishi", "A Collaborator"], "Tomoya Imanishi");

    expect(result).toEqual([
      { name: "Tomoya Imanishi", isOwner: true },
      { name: "A Collaborator", isOwner: false },
    ]);
  });
});

describe("findPaperLink / findCodeLink", () => {
  const links = [
    { label: "arXiv", href: "https://arxiv.org/abs/0000.00000" },
    { label: "Code", href: "https://github.com/example/repo" },
    { label: "Hugging Face", href: "https://huggingface.co/example" },
  ];

  it("finds the paper link by label", () => {
    expect(findPaperLink(links)?.href).toBe("https://arxiv.org/abs/0000.00000");
  });

  it("finds the code link by label", () => {
    expect(findCodeLink(links)?.href).toBe("https://github.com/example/repo");
  });
});
