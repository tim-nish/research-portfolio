import matter from "gray-matter";

export interface LintFinding {
  file: string;
  message: string;
}

interface ProjectionShape {
  isProjection: boolean;
  source?: string;
  hasGeneratedBy: boolean;
}

function parseProjectionShape(raw: string): ProjectionShape {
  try {
    const data = matter(raw).data as Record<string, unknown>;
    return {
      isProjection: data.variant === "site",
      source: typeof data.source === "string" ? data.source : undefined,
      hasGeneratedBy: "generated_by" in data,
    };
  } catch {
    // Unparseable frontmatter is a schema problem, reported by the shared
    // validator — not this rule's concern.
    return { isProjection: false, hasGeneratedBy: false };
  }
}

/**
 * Hand-edit rule (docs/article-publishing-spec.md §2: projections are never
 * edited in place). A regenerated projection always carries a new `source` pin —
 * the authoring-side commit it was generated from — so a modification to an
 * existing projection that keeps the old pin cannot be what generated the
 * committed body: it was edited in this repository. The authoring side wins;
 * the projection here is the defect.
 */
export function checkHandEdit(
  file: string,
  previousRaw: string | undefined,
  nextRaw: string,
): LintFinding | undefined {
  const next = parseProjectionShape(nextRaw);
  if (!next.isProjection) return undefined;
  // A newly added projection is the explicit owner publish act — always fine.
  if (previousRaw === undefined) return undefined;
  const previous = parseProjectionShape(previousRaw);
  if (!previous.isProjection) return undefined;

  if (previous.source === next.source) {
    return {
      file,
      message:
        "hand-edited projection: modified without a new source pin — the authoring side wins; regenerate the projection there and recommit it",
    };
  }
  return undefined;
}

/**
 * Stray-output rule: generated proposal/intermediate output is rejected anywhere
 * inside the site tree. Projection files live at content/articles/*.md and
 * nowhere else; the authoring pipeline's proposal output (site/<slug>.md) lives
 * outside this repository by construction.
 */
export function checkStrayPath(file: string, raw?: string): LintFinding | undefined {
  // Test fixtures are sanctioned copies of both good and bad shapes.
  if (file.startsWith("content/__fixtures__/")) return undefined;

  if (file === "site" || file.startsWith("site/")) {
    return {
      file,
      message: "generated proposal output (site/…) must not be committed to the site tree",
    };
  }
  if (/\.(proposal|intermediate)\.md$/.test(file)) {
    return {
      file,
      message: "generated intermediate output must not be committed to the site tree",
    };
  }
  if (file.endsWith(".md") && !file.startsWith("content/articles/") && raw !== undefined) {
    const shape = parseProjectionShape(raw);
    if (shape.isProjection || shape.hasGeneratedBy) {
      return {
        file,
        message:
          "projection-shaped file outside content/articles/ — generated output is rejected anywhere else in the site tree",
      };
    }
  }
  return undefined;
}
