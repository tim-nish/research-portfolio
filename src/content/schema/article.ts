import { z } from "zod";
import { dateSchema, relatedSchema, slugSchema, summarySchema } from "./common";

export const ARTICLE_MODES = ["canonical", "external"] as const;
export const ARTICLE_LANGUAGES = ["en", "ja"] as const;
export const ARTICLE_PLATFORMS = ["zenn", "qiita", "devto", "x", "other"] as const;

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
