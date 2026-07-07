import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import type { ZodTypeAny } from "zod";
import {
  CONTENT_TYPES,
  CONTENT_TYPE_DIRS,
  CONTENT_TYPE_SCHEMAS,
  RELATED_TYPES,
  type ContentType,
  type RelatedType,
} from "./schema";

export interface ContentValidationError {
  file: string;
  message: string;
}

export interface ContentRecord<T = unknown> {
  type: ContentType;
  slug: string;
  filePath: string;
  data: T;
  body: string;
  bodyHtml: string;
}

export type InverseRelations = Partial<Record<RelatedType, string[]>>;

export interface ContentRegistry {
  records: Record<ContentType, ContentRecord[]>;
  bySlug: Record<ContentType, Record<string, ContentRecord>>;
  relatedBy: Record<ContentType, Record<string, InverseRelations>>;
}

export class ContentValidationErrors extends Error {
  errors: ContentValidationError[];

  constructor(errors: ContentValidationError[]) {
    super(
      `Content validation failed with ${errors.length} error(s):\n` +
        errors.map((e) => `  - ${e.file}: ${e.message}`).join("\n"),
    );
    this.name = "ContentValidationErrors";
    this.errors = errors;
  }
}

const RELATED_TYPE_TO_CONTENT_TYPE: Record<RelatedType, ContentType> = {
  projects: "project",
  products: "product",
  publications: "publication",
  articles: "article",
};

const CONTENT_TYPE_TO_RELATED_TYPE: Partial<Record<ContentType, RelatedType>> = {
  project: "projects",
  product: "products",
  publication: "publications",
  article: "articles",
};

function listMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(dir, entry.name))
    .sort();
}

function parseFile(filePath: string): { data: Record<string, unknown>; body: string } {
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = matter(raw);
  return { data: parsed.data, body: parsed.content.trim() };
}

function validateFrontmatter(
  type: ContentType,
  filePath: string,
  data: Record<string, unknown>,
  errors: ContentValidationError[],
): unknown | undefined {
  const schema = CONTENT_TYPE_SCHEMAS[type] as ZodTypeAny;
  const result = schema.safeParse(data);
  if (!result.success) {
    for (const issue of result.error.issues) {
      const fieldPath = issue.path.length > 0 ? issue.path.join(".") : "(root)";
      errors.push({ file: filePath, message: `${fieldPath}: ${issue.message}` });
    }
    return undefined;
  }
  return result.data;
}

function validateArticleBodyRule(
  filePath: string,
  data: { mode: string },
  body: string,
  errors: ContentValidationError[],
) {
  if (data.mode === "canonical" && body.length === 0) {
    errors.push({ file: filePath, message: "mode: canonical articles require a non-empty body" });
  }
  if (data.mode === "external" && body.length > 0) {
    errors.push({ file: filePath, message: "mode: external articles must not have a body" });
  }
}

export interface LoadOptions {
  /** Root content directory, e.g. `content/`. Defaults to `<cwd>/content`. */
  contentDir?: string;
}

/**
 * Parses and validates every content record under `contentDir`, and returns the
 * resulting typed registry with inverse relations computed. Throws
 * `ContentValidationErrors` (listing every violation found, not just the first) if
 * any record fails validation.
 */
export function loadContentRegistry(options: LoadOptions = {}): ContentRegistry {
  const contentDir = options.contentDir ?? path.join(process.cwd(), "content");
  const errors: ContentValidationError[] = [];

  const records: Record<ContentType, ContentRecord[]> = {
    profile: [],
    project: [],
    product: [],
    publication: [],
    article: [],
    "newsletter-issue": [],
  };

  // profile is a singleton file directly under contentDir.
  const profilePath = path.join(contentDir, "profile.md");
  if (fs.existsSync(profilePath)) {
    const { data, body } = parseFile(profilePath);
    const validated = validateFrontmatter("profile", profilePath, data, errors);
    if (validated) {
      records.profile.push({
        type: "profile",
        slug: "profile",
        filePath: profilePath,
        data: validated,
        body,
        bodyHtml: body ? (marked.parse(body) as string) : "",
      });
    }
  }

  for (const type of CONTENT_TYPES) {
    if (type === "profile") continue;
    const dir = path.join(contentDir, CONTENT_TYPE_DIRS[type]);
    const seenSlugs = new Map<string, string>();

    for (const filePath of listMarkdownFiles(dir)) {
      const { data, body } = parseFile(filePath);
      const validated = validateFrontmatter(type, filePath, data, errors) as
        | { slug: string; mode?: string }
        | undefined;
      if (!validated) continue;

      if (type === "article") {
        validateArticleBodyRule(filePath, validated as { mode: string }, body, errors);
      }

      const slug = validated.slug;
      const existing = seenSlugs.get(slug);
      if (existing) {
        errors.push({
          file: filePath,
          message: `duplicate slug "${slug}" (also used by ${existing}) within type "${type}"`,
        });
        continue;
      }
      seenSlugs.set(slug, filePath);

      records[type].push({
        type,
        slug,
        filePath,
        data: validated,
        body,
        bodyHtml: body ? (marked.parse(body) as string) : "",
      });
    }
  }

  const bySlug: Record<ContentType, Record<string, ContentRecord>> = {
    profile: {},
    project: {},
    product: {},
    publication: {},
    article: {},
    "newsletter-issue": {},
  };
  for (const type of CONTENT_TYPES) {
    for (const record of records[type]) {
      bySlug[type][record.slug] = record;
    }
  }

  const relatedBy: Record<ContentType, Record<string, InverseRelations>> = {
    profile: {},
    project: {},
    product: {},
    publication: {},
    article: {},
    "newsletter-issue": {},
  };

  for (const type of CONTENT_TYPES) {
    const sourceRelatedType = CONTENT_TYPE_TO_RELATED_TYPE[type];
    if (!sourceRelatedType) continue;

    for (const record of records[type]) {
      const related = (record.data as { related?: Partial<Record<RelatedType, string[]>> }).related;
      if (!related) continue;

      for (const key of RELATED_TYPES) {
        const targetSlugs = related[key];
        if (!targetSlugs) continue;
        const targetType = RELATED_TYPE_TO_CONTENT_TYPE[key];

        for (const targetSlug of targetSlugs) {
          if (!bySlug[targetType][targetSlug]) {
            errors.push({
              file: record.filePath,
              message: `related.${key} references unresolvable slug "${targetSlug}" (no ${targetType} with that slug)`,
            });
            continue;
          }

          relatedBy[targetType][targetSlug] ??= {};
          const bucket = relatedBy[targetType][targetSlug];
          bucket[sourceRelatedType] ??= [];
          if (!bucket[sourceRelatedType]!.includes(record.slug)) {
            bucket[sourceRelatedType]!.push(record.slug);
          }
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new ContentValidationErrors(errors);
  }

  return { records, bySlug, relatedBy };
}
