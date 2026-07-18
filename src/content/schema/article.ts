import { z } from "zod";
import { dateSchema, relatedSchema, slugSchema, summarySchema } from "./common";

export const ARTICLE_MODES = ["canonical", "external"] as const;
export const ARTICLE_LANGUAGES = ["en", "ja"] as const;
export const ARTICLE_PLATFORMS = ["zenn", "qiita", "devto", "x", "other"] as const;
// Additive field (same D-10/D-11/D-13-style gap): spec §6.1 lists `published |
// updated | deprecated` as article lifecycle states, but §6.2's normative schema
// names no field for it. `updated` (the optional date field) already implies the
// "updated" state when present; this adds the one genuinely missing signal.
export const ARTICLE_STATUSES = ["published", "updated", "deprecated"] as const;

const externalSchema = z.object({
  href: z.string().min(1),
  platform: z.enum(ARTICLE_PLATFORMS),
});

const syndicationEntrySchema = z.object({
  platform: z.enum(ARTICLE_PLATFORMS),
  href: z.string().min(1),
});

export const articleFrontmatterSchema = z
  .object({
    slug: slugSchema,
    title: z.string().min(1),
    date: dateSchema,
    mode: z.enum(ARTICLE_MODES),
    language: z.enum(ARTICLE_LANGUAGES),
    summary: summarySchema,
    external: externalSchema.optional(),
    syndication: z.array(syndicationEntrySchema).optional(),
    topics: z.array(z.string()).optional(),
    related: relatedSchema,
    updated: dateSchema.optional(),
    status: z.enum(ARTICLE_STATUSES).optional().default("published"),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "external" && !data.external) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["external"],
        message: "external.href and external.platform are required when mode is \"external\"",
      });
    }
    if (data.mode === "canonical" && data.external) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["external"],
        message: "external must not be set when mode is \"canonical\"",
      });
    }
    if (data.mode === "external" && data.syndication) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["syndication"],
        message: "syndication is only valid when mode is \"canonical\"",
      });
    }
  });

export type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;

// Site-canonical projection files (docs/article-publishing-spec.md §2): generated
// on the authoring side, committed here by an explicit owner act, never edited in
// place. The shape is the spec's frontmatter contract verbatim — `source` and
// `generated_by` form the immutable birth record.
const sourcePinSchema = z
  .string()
  .regex(/^\S+@[0-9a-f]{7,40}$/i, "must be <authoring-repo>@<commit>");

const generatedBySchema = z
  .string()
  .regex(/^\S+@\S+$/, "must be <tool>@<version>");

export const siteProjectionFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: slugSchema,
  source: sourcePinSchema,
  variant: z.literal("site"),
  language: z.enum(ARTICLE_LANGUAGES),
  published: dateSchema,
  generated_by: generatedBySchema,
});

export type SiteProjectionFrontmatter = z.infer<typeof siteProjectionFrontmatterSchema>;

export type AnyArticleFrontmatter = ArticleFrontmatter | SiteProjectionFrontmatter;

/**
 * A `variant:` key routes an article file to the projection schema — any value
 * (right or wrong) lands there, so a bad `variant` errors on that key instead of
 * failing the legacy schema with unrelated missing-field noise.
 */
export function isProjectionShaped(data: Record<string, unknown>): boolean {
  return "variant" in data;
}

export function isSiteProjection(data: AnyArticleFrontmatter): data is SiteProjectionFrontmatter {
  return "variant" in data && (data as SiteProjectionFrontmatter).variant === "site";
}
