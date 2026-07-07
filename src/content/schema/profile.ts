import { z } from "zod";
import { linkSchema } from "./common";

export const profileFrontmatterSchema = z.object({
  name: z.string().min(1),
  positioning: z.string().min(1),
  bio: z.string().min(1),
  now: z.string().optional(),
  focus_areas: z.array(z.string()).min(1),
  identity_links: z.array(linkSchema).min(1),
  languages_note: z.string().optional(),
});

export type ProfileFrontmatter = z.infer<typeof profileFrontmatterSchema>;
