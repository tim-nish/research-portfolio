import { z } from "zod";
import { dateSchema, slugSchema, summarySchema } from "./common";

export const newsletterIssueFrontmatterSchema = z.object({
  slug: slugSchema,
  number: z.number().int().positive(),
  date: dateSchema,
  subject: z.string().min(1),
  summary: summarySchema,
  archiveHref: z.string().optional(),
});

export type NewsletterIssueFrontmatter = z.infer<typeof newsletterIssueFrontmatterSchema>;
