/**
 * Publication lint (Story 5.4, docs/article-publishing-spec.md §2):
 *
 *   1. Frontmatter schema violations under content/ block the commit — this is
 *      the same validator the build runs (shared with Story 5.1).
 *   2. A projection modified without a new `source` pin is hand-edited; the
 *      authoring side wins and the commit is blocked.
 *   3. Generated proposal/intermediate output is rejected anywhere in the tree.
 *
 * Runs standalone (`npm run lint:publication`, working tree vs HEAD) and as the
 * pre-commit hook (`--staged`, index vs HEAD — wired via .githooks/pre-commit
 * and the `prepare` script's core.hooksPath config).
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { ContentValidationErrors, loadContentRegistry } from "../src/content/load";
import { checkHandEdit, checkStrayPath, type LintFinding } from "../src/publication/lint";

const staged = process.argv.includes("--staged");

function git(...args: string[]): string {
  return execFileSync("git", args, { encoding: "utf-8" });
}

function gitShowOrUndefined(ref: string): string | undefined {
  try {
    return execFileSync("git", ["show", ref], { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return undefined;
  }
}

function lines(output: string): string[] {
  return output.split("\n").filter(Boolean);
}

function main() {
  const findings: LintFinding[] = [];

  // 1. Shared schema validation over the whole content registry.
  try {
    loadContentRegistry();
  } catch (error) {
    if (error instanceof ContentValidationErrors) {
      findings.push(...error.errors.map(({ file, message }) => ({ file, message })));
    } else {
      throw error;
    }
  }

  // 2. Hand-edited projections: modified content/articles files, staged (index
  //    vs HEAD) in hook mode, working tree vs HEAD standalone.
  const modifiedProjectionCandidates = staged
    ? lines(git("diff", "--cached", "--name-only", "--diff-filter=M", "--", "content/articles"))
    : lines(git("diff", "--name-only", "--diff-filter=M", "--", "content/articles"));

  for (const file of modifiedProjectionCandidates) {
    if (!file.endsWith(".md")) continue;
    const previousRaw = gitShowOrUndefined(`HEAD:${file}`);
    const nextRaw = staged ? gitShowOrUndefined(`:${file}`) : fs.readFileSync(file, "utf-8");
    if (nextRaw === undefined) continue;
    const finding = checkHandEdit(file, previousRaw, nextRaw);
    if (finding) findings.push(finding);
  }

  // 3. Stray generated output: staged files in hook mode; every tracked file
  //    (plus staged additions) standalone.
  const strayCandidates = staged
    ? lines(git("diff", "--cached", "--name-only", "--diff-filter=ACMR"))
    : lines(git("ls-files"));

  for (const file of strayCandidates) {
    const raw = file.endsWith(".md")
      ? staged
        ? gitShowOrUndefined(`:${file}`)
        : fs.existsSync(file)
          ? fs.readFileSync(file, "utf-8")
          : undefined
      : undefined;
    const finding = checkStrayPath(file, raw);
    if (finding) findings.push(finding);
  }

  if (findings.length > 0) {
    console.error(`Publication lint failed with ${findings.length} finding(s):`);
    for (const finding of findings) {
      console.error(`  - ${finding.file}: ${finding.message}`);
    }
    process.exit(1);
  }

  console.log(`Publication lint OK (${staged ? "staged" : "working tree"}).`);
}

main();
