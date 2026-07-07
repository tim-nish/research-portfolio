import { z } from "zod";
import { linkSchema, trimmedText } from "./common";

export const profileFrontmatterSchema = z.object({
  name: z.string().min(1),
  positioning: trimmedText.pipe(z.string().min(1)),
  bio: trimmedText.pipe(z.string().min(1)),
  now: trimmedText.pipe(z.string().min(1)).optional(),
  focus_areas: z.array(z.string()).min(1),
  identity_links: z.array(linkSchema).min(1),
  languages_note: trimmedText.pipe(z.string().min(1)).optional(),
});

export type ProfileFrontmatter = z.infer<typeof profileFrontmatterSchema>;
