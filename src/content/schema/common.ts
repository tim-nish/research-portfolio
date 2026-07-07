import { z } from "zod";

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug must be kebab-case (lowercase letters, digits, hyphens)");

export const linkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

export const yearMonthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "must be YYYY-MM");

// gray-matter's YAML parser auto-converts unquoted YYYY-MM-DD scalars into JS
// `Date` objects, so this schema accepts either and normalizes to a plain string.
export const dateSchema = z
  .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD"), z.date()])
  .transform((value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value));

// YAML folded (`>`) scalars — the convention used throughout `content/` for
// prose fields — always carry a trailing newline; trim it so raw (non-markdown)
// consumers like meta descriptions and JSON-LD don't leak it.
export const trimmedText = z.string().transform((value) => value.trim());

export const summarySchema = trimmedText.pipe(z.string().min(1).max(240));

export const relatedSchema = z
  .object({
    projects: z.array(slugSchema).optional(),
    products: z.array(slugSchema).optional(),
    publications: z.array(slugSchema).optional(),
    articles: z.array(slugSchema).optional(),
  })
  .partial()
  .optional();

export type RelatedRefs = z.infer<typeof relatedSchema>;

export const RELATED_TYPES = ["projects", "products", "publications", "articles"] as const;
export type RelatedType = (typeof RELATED_TYPES)[number];
