import { z } from "zod";
import { linkSchema, relatedSchema, slugSchema, summarySchema, yearMonthSchema } from "./common";

export const PRODUCT_STATUSES = ["validating", "live", "sunset"] as const;
export const PRODUCT_PLATFORMS = [
  "claude-code-plugin",
  "chrome-extension",
  "vscode-extension",
  "obsidian-plugin",
  "web",
  "api",
] as const;
export const PRODUCT_CTA_KINDS = ["signup", "marketplace", "purchase", "contact"] as const;
export const PRODUCT_PRICING = ["free", "freemium", "paid", "tbd"] as const;

const ctaSchema = z.object({
  kind: z.enum(PRODUCT_CTA_KINDS),
  href: z.string().min(1),
  label: z.string().min(1),
});

const sunsetSchema = z.object({
  date: yearMonthSchema,
  note: z.string().min(1),
  successor: z.string().optional(),
});

export const productFrontmatterSchema = z
  .object({
    slug: slugSchema,
    title: z.string().min(1),
    status: z.enum(PRODUCT_STATUSES),
    pain: summarySchema,
    summary: summarySchema,
    platforms: z.array(z.enum(PRODUCT_PLATFORMS)).min(1),
    cta: ctaSchema,
    pricing: z.enum(PRODUCT_PRICING),
    launched: yearMonthSchema.optional(),
    sunset: sunsetSchema.optional(),
    related: relatedSchema,
    languages: z.array(z.enum(["en", "ja"])).optional(),
    unlisted: z.boolean().optional().default(false),
    featured: z.boolean().optional().default(false),
    links: z.array(linkSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "sunset" && !data.sunset) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sunset"],
        message: "sunset.date and sunset.note are required when status is \"sunset\"",
      });
    }
  });

export type ProductFrontmatter = z.infer<typeof productFrontmatterSchema>;
