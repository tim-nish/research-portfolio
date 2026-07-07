import { articleFrontmatterSchema } from "./article";
import { newsletterIssueFrontmatterSchema } from "./newsletterIssue";
import { productFrontmatterSchema } from "./product";
import { profileFrontmatterSchema } from "./profile";
import { projectFrontmatterSchema } from "./project";
import { publicationFrontmatterSchema } from "./publication";

export const CONTENT_TYPES = [
  "profile",
  "project",
  "product",
  "publication",
  "article",
  "newsletter-issue",
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

/** Directory (relative to the content root) each non-singleton type is loaded from. */
export const CONTENT_TYPE_DIRS: Record<Exclude<ContentType, "profile">, string> = {
  project: "projects",
  product: "products",
  publication: "publications",
  article: "articles",
  "newsletter-issue": "newsletter-issues",
};

export const CONTENT_TYPE_SCHEMAS = {
  profile: profileFrontmatterSchema,
  project: projectFrontmatterSchema,
  product: productFrontmatterSchema,
  publication: publicationFrontmatterSchema,
  article: articleFrontmatterSchema,
  "newsletter-issue": newsletterIssueFrontmatterSchema,
} as const;

export * from "./article";
export * from "./common";
export * from "./newsletterIssue";
export * from "./product";
export * from "./profile";
export * from "./project";
export * from "./publication";
