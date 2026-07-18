# Answer: Article categories, frameworks, the 10-minute pipeline, and review

**Date:** 2026-07-07
**Question:** `q_a/2/question.md`
**Grounding:** `docs/website-architecture-spec.md` (§3, §6.2, §9, AP-10), `docs/content-guide.md`,
`q_a/1/answer.md` (+ `q_a/1/lessons.md`), the BMAD skills already installed in this repo
(`bmad-editorial-review-structure`, `bmad-editorial-review-prose`).

**Deliverables produced alongside this answer** (per your assumption #1 — each tooling
proposal is a separate BMAD spec, ready for your existing workflow):

| Proposal | Spec folder |
|---|---|
| Per-category article frameworks | `_bmad-output/specs/spec-article-frameworks/` |
| ~10-minute drafting pipeline | `_bmad-output/specs/spec-article-draft-pipeline/` |
| Low-cost review workflow | `_bmad-output/specs/spec-article-review/` |

---

## 0. Corrections to your assumptions

Mostly correct, three adjustments:

1. **The hub is `https://tim-nish.dev`, not the GitHub repo.** The repo is the source;
   the domain is the hub every article points back to (spec §3 invariant). Small
   distinction, but it's the URL that goes in every pointer block.
2. **"Articles on dev.to and Zenn" needs the canonical policy attached** (settled in
   `q_a/1/answer.md` §2.1, now in the spec): English articles are canonical on your
   site and syndicated *in full* to dev.to with `canonical_url`; Japanese articles are
   canonical on Zenn and indexed on the site as `mode: external` records. Until the
   site can host canonical articles (Epic 2), publish on the platforms first and
   repoint canonicals later — dev.to lets you edit `canonical_url` after publication.
3. **Article editing is not process tokens.** A published article is a permanent,
   public, compounding asset — the very definition of an artifact. What *is* process
   (and what you correctly want to minimize) is **open-ended iterative churn**:
   unbounded "make it better" cycles. The right cost model is: bounded review
   *passes*, not cheap review *quality*. §3 is designed around that.

---

## 1. Article categories

Your two categories are right. The site architecture (spec §9's seeding priorities and
the `article`/`publication`/`product` content types) implies **two more now and one
later**, plus explicit exclusions:

3. **Evaluation & benchmark methodology** — spec §9 genre 2, distinct from
   "engineering lessons" because the evidence is *measurement*, not scars: how a
   benchmark is designed, how leakage sneaks in, how you know an agent improved.
   This is your positioning category — it's what makes you "the evaluation person"
   rather than just a tool author, and QuantScenarioBench gives you a supply of
   material nobody can copy.
4. **Research surveys / reputation anchors** — spec §9 genre 3 (e.g. signature
   methods). Low cadence (1–2/year), pairs with a `publication` record when a
   preprint exists. These rank for years and credential the research identity.
5. *(Later, Phase 3)* **Product validation posts** — a pain-first article
   (`product.pain` phrased the way the user searches) published *before* the product
   landing page exists, to test demand cheaply. Don't build a framework for this
   until a product reaches `validating`.

**Explicitly excluded** (so the category list stays honest):

- Generic tutorials — banned by AP-10; the crowded arena you'd lose in.
- Release-notes posts — the registry (new versions, releases) is the site's freshness
  signal per spec §9; don't spend article slots on changelogs.
- Workflow/process posts as a *standing* genre — one BMAD-workflow article is
  sanctioned (`q_a/1/answer.md` §2.4 #6); a portfolio about its own construction is a
  weak signal beyond that.

So the working category set is four: **project introduction, engineering lessons,
evaluation methodology, research survey.**

---

## 2. Frameworks: yes — and here they are

Filling a predefined structure is not a crutch; it's the same design decision your
site already made (schema-driven content, validated at build time). A framework does
for an article what `content-guide.md` does for a record: it makes quality
*structural* instead of dependent on inspiration. Two things make frameworks work:

- **Slots demand evidence, not prose.** Every framework below has a mandatory
  evidence slot; if you can't fill it, AP-10 says the article shouldn't exist yet.
  The framework is thus also your go/no-go check.
- **The narrative spine is fixed; only the content varies.** You never decide
  structure again — you decide which category the material is, and that's usually
  obvious.

The four frameworks (full fill-in templates with per-slot prompts, lengths, and
frontmatter are in the spec companion:
`_bmad-output/specs/spec-article-frameworks/article-frameworks.md`):

**F1 — Project introduction** *(gate: the project has a tagged release or equivalent
shipped artifact — see q_a/1 on why KagamiOS doesn't get one yet)*

1. The problem, as the reader experiences it (no mention of your project yet)
2. Why existing options fall short (name 1–2, be fair)
3. What I built — one-paragraph definition + one concrete demo (code/screenshot)
4. The one non-obvious design decision, and what it cost (the tradeoff)
5. Evidence — a result, number, or worked example
6. Limits & roadmap — what it doesn't do
7. Quickstart — 3 steps
8. Pointer block

**F2 — Engineering lessons** *(gate: a real failure/surprise with an artifact —
log excerpt, diff, number)*

1. Context — what I was building, one paragraph, link to the project
2. What I believed going in
3. What actually happened — the surprise, with the artifact shown
4. Why — the mechanism, not just the symptom
5. What I changed, and the tradeoff I accepted
6. The generalized lesson — when it applies to the reader, and when it doesn't
7. Pointer block

*(Slots 2–6 repeat for up to 3 lessons per article; more than 3 is two articles.)*

**F3 — Evaluation & benchmark methodology** *(gate: a measurement you ran)*

1. The measurement question ("how do you know X actually got better?")
2. Why the naive approach fails — demonstrated, not asserted
3. The method — design principle + implementation sketch
4. What it caught — a result table or figure
5. Boundaries — what this measurement cannot tell you
6. Reproduce it — code/dataset/leaderboard links
7. Pointer block

**F4 — Research survey** *(gate: you've read the papers; a related preprint/repo of
yours exists or is coming)*

1. Scope & audience — what's covered, who it's for, as-of date
2. The map — a taxonomy of approaches (table or diagram)
3. Per branch: core idea, key papers, when to use it, open problems *(repeats)*
4. My take — where this goes, what I'm building on it
5. Reading list
6. Pointer block

Every framework ends in the same **pointer block** (spec §3 invariant: site link +
related records + newsletter/RSS) and emits frontmatter conforming to the `article`
schema in `content-guide.md`, so a finished draft drops into `content/articles/`
without rework.

---

## 3. The 10-minute workflow: invert your division of labor

Your proposed split — *you* extract key points, AI reconstructs narrative — is
backwards, and it's the part of your plan I'd change most strongly.

Extraction is what AI is *good* at: your raw material (dev logs, specs, READMEs,
commit history, BMAD memlogs) is already in git, and an agent can harvest candidate
facts from it faster and more exhaustively than you can. What the AI **cannot**
supply is exactly what AP-10 demands: your judgment and your evidence — which finding
surprised you, which number matters, what you'd do differently, what opinion you're
willing to defend. If you hand-extract key points and let AI write freely around
them, you get the worst trade: you spend your minutes on the mechanical step and
delegate the part (narrative voice + implicit claims) that most needs your control
and is most prone to hallucinated filler.

The better pipeline (specced in `spec-article-draft-pipeline`; budget = **~10 minutes
of your attention**, wall clock can be longer):

1. **Invoke** — `draft article <framework> from <sources>` *(0 min)*
2. **AI: harvest** — builds a fact sheet from the named sources; every claim carries
   a source pointer (file/line/commit). No human involvement.
3. **AI → you: gap interview, ≤ 5 questions** *(~5 min)* — the AI asks only what the
   sources cannot answer: "what surprised you?", "which result matters most?",
   "what would you warn a reader about?". Bullet answers are fine. This is where
   your judgment enters — cheaply, as answers to pointed questions instead of
   staring at a blank outline.
4. **AI: fill the framework** — produces the draft with schema frontmatter. Every
   claim it *inferred* rather than found or was told is marked `[VERIFY]` inline.
5. **You: verification pass** *(~4 min)* — resolve the `[VERIFY]` markers, veto
   anything off-voice. Rule: if a section needs more than one rewrite, the fix is
   another interview question, not open-ended editing.

The two rules that make this safe at speed: **the AI never invents evidence**
(unverifiable claims must be marked, and the fact sheet's source pointers mean you
verify rather than fact-check from scratch), and **human time is spent only where
human input is irreplaceable** (judgment in step 3, veto in step 5).

---

## 4. Review: bounded passes, cheap models, findings not rewrites

With the framing corrected (§0.3), the design goal is: **maximum defect yield per
pass, minimum number of passes.** Four decisions (specced in `spec-article-review`):

**4.1 Spend on the draft, save on the review.** The number of review cycles is
determined by draft quality, so the strongest model you have access to belongs at the
*drafting* step (pipeline §3), and review runs on cheap models. This is the highest-ROI
token allocation available: one good draft plus two cheap passes beats a cheap
draft plus N expensive rescue cycles every time.

**4.2 Fixed pass order, each pass runs once per draft version:**

| Pass | Cost | What |
|---|---|---|
| 0. Lint | 0 tokens (script) | Frontmatter validity, title length, pointer block present, heading density, dead links. Never pay tokens for what grep can check. |
| 1. Structure | cheap model | Cuts, reordering, missing/redundant sections. You already have `bmad-editorial-review-structure` installed — use it. Runs *first* because structural changes invalidate prose feedback. |
| 2. Prose | cheap model | Clarity, tone, hedging, jargon. `bmad-editorial-review-prose` is installed for this. |
| 3. Cold read | cheap model, **no project context** | A fresh model answers a reader rubric: What is this article's claim? Who is it for? What was unclear? This simulates the actual reader and catches the missing-context defects that any model *with* your repo in context is structurally blind to. |

**4.3 Sonnet vs ChatGPT?** Model brand matters less than **grounding**: reviews run
inside Claude Code can read your repo and check the draft's claims against the
sources — a review pasted into a ChatGPT window can't, and that fact-grounding is
worth more than any quality delta between frontier models. So: draft with your
strongest available Claude model, review with Sonnet (Haiku for the mechanical end).
The one place a second provider genuinely helps is pass 3 (cold read), where *lack*
of context is the point — any cheap model works.

**4.4 The review prompt.** Five principles (full prompt text in the spec companion
`_bmad-output/specs/spec-article-review/review-prompts.md`):

1. **Role + audience + stakes:** "You are a senior engineer skimming dev.to. You
   give an article 60 seconds to earn a full read." Feedback without a reader model
   is generic.
2. **Rubric, not vibes:** named checks (hook within 3 sentences; one idea per
   article; every claim evidenced; skimmable; limits stated; pointer block present).
3. **Findings, not rewrites:** each finding = location + severity (blocker/should/nit)
   + issue + suggested fix. Capped at 10. Rewrites destroy your voice and cost 10×
   the tokens.
4. **Forbid praise and summary** — every output token spent on "great article!" is
   waste.
5. **Ask for the single highest-leverage change first** — if you only fix one thing
   per pass, this makes the pass still pay.

You are the arbiter: accept/reject findings in one round, fix, ship. No second full
cycle unless a blocker-level finding survived.

---

## 5. General principles

The compact list, drawn from the spec, `q_a/1/lessons.md`, and platform mechanics:

1. **Evidence-gated or not at all** (AP-10). If the piece doesn't require your logs,
   numbers, or scars, someone with more distribution has already written it better.
2. **One idea per article.** The title states the specific claim ("How scenario
   leakage breaks quant benchmarks"), not the topic ("Thoughts on benchmarking").
   Two ideas = two articles = two chances to rank.
3. **The first 3 sentences earn the next 300.** On dev.to/Zenn the hook competes in
   a feed; state the problem or the surprising result immediately, credentials never.
4. **Skimmable by construction:** a header every ~150–200 words, one figure or code
   block per major section, bold the load-bearing sentence of long paragraphs.
5. **An honest limits section outperforms polish.** For a researcher audience,
   "what this doesn't do" is the highest-trust paragraph in the article.
6. **Every piece ends at the pointer block** (spec §3 invariant) — your domain,
   related records, newsletter/RSS. This is what converts rented platform reach into
   owned audience; an article without it is a donation to dev.to.
7. **Ship, then version.** A published article you update ("2026-08: corrected X")
   compounds; a draft in a drawer doesn't. Your registry-driven site makes updates a
   normal operation, not an embarrassment.
8. **Same-week JA counterpart on Zenn** for flagship EN pieces — the bilingual
   pairing is a structural differentiator almost nobody ships (q_a/1 §3.2).
9. **Cadence honesty:** never apologize for gaps, never promise frequency (spec §9
   anti-treadmill). One evidenced article per month beats four thin ones.
10. **Release-day thread** (X/Bluesky) per article, linking the canonical URL; one
    consistent identity (name, avatar, wordmark) across dev.to, Zenn, GitHub, and
    the site so every touchpoint reinforces the same brand.
11. **Measure before optimizing:** you can't improve what you don't see — once
    2–3 articles exist, check which ones pull (platform stats + Search Console)
    before writing #6; double down on the category that moves.

## Summary

- **Categories:** your two + evaluation methodology + research surveys (product
  validation posts later); generic tutorials, changelogs, and workflow-navel-gazing
  excluded.
- **Frameworks:** right approach — four fill-in templates with mandatory evidence
  slots and schema-conformant frontmatter (`spec-article-frameworks`).
- **10 minutes:** invert your split — AI extracts from your repo with source
  pointers, *you* answer ≤5 judgment questions and verify marked claims
  (`spec-article-draft-pipeline`).
- **Review:** articles are artifacts; churn is the process cost. Strong model
  drafts once; cheap grounded passes review once each in fixed order
  (lint → structure → prose → cold read), producing capped findings, you arbitrate
  (`spec-article-review`).
