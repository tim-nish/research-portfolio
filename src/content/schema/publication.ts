import { z } from "zod";
import { linkSchema, relatedSchema, slugSchema } from "./common";

export const PUBLICATION_STATUSES = ["preprint", "published", "superseded"] as const;

export const publicationFrontmatterSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1),
  authors: z.array(z.string().min(1)).min(1),
  venue: z.string().min(1),
  year: z.number().int(),
  status: z.enum(PUBLICATION_STATUSES),
  links: z.array(linkSchema).min(1),
  citation: z.string().min(1),
  related: relatedSchema,
  featured: z.boolean().optional().default(false),
  // Additive field (not in spec §6.2's normative table, same D-10/D-11-style gap):
  // §6.4 requires a `superseded` record to point at its superseding record, but the
  // spec never names a field for it. Slug of the publication that supersedes this one.
  supersededBy: slugSchema.optional(),
});

export type PublicationFrontmatter = z.infer<typeof publicationFrontmatterSchema>;
