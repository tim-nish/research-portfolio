import { z } from "zod";
import { linkSchema, relatedSchema, slugSchema, summarySchema, yearMonthSchema } from "./common";

export const PROJECT_KINDS = ["library", "benchmark", "plugin", "tool", "system"] as const;
export const PROJECT_STATUSES = ["active", "maintained", "archived"] as const;

export const projectFrontmatterSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1),
  kind: z.enum(PROJECT_KINDS),
  status: z.enum(PROJECT_STATUSES),
  summary: summarySchema,
  started: yearMonthSchema,
  links: z.array(linkSchema).min(1),
  featured: z.boolean().optional().default(false),
  topics: z.array(z.string()).optional(),
  related: relatedSchema,
  citation: z.string().optional(),
});

export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;
