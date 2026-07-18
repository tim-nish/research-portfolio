# Answer: BMAD workflow value, GitHub tooling reliability, Graphify, plan upgrade, and the Writing Assistant

**Date:** 2026-07-08
**Question:** `q_a/3/question.md`
**Grounding:** `.claude/commands/publish-issues.md`, `.claude/commands/implement-issue.md`,
`_bmad-output/specs/spec-article-{frameworks,draft-pipeline,review}/`, `q_a/1–2` answers,
current Claude plan pricing and Graphify coverage (web sources cited inline in §6–§7).

**Deliverables produced alongside this answer** (per your standing assumption — each
implementation proposal is a separate BMAD spec, this time in `specs/` as you directed):

| Proposal | Spec folder |
|---|---|
| `commit-groups` v2 (simple, review-gated, exclusions) | `specs/spec-commit-groups-v2/` |
| Deterministic story→issue sync (fixes `publish-issues` + `implement-issue`) | `specs/spec-github-story-sync/` |
| BMAD exclusion automation (global ignore + retrofit cleanup) | `specs/spec-bmad-exclusions/` |
| Writing Assistant as a standalone plugin repo | `specs/spec-writing-assistant/` |

One note before the answers: `commit-groups` is not present in this repository or this
container (only `publish-issues` and `implement-issue` are in `.claude/commands/`), so I
could not read its current implementation. The v2 spec is designed from your stated
requirements plus your complaint that it grew too complicated; if the current version has
behavior worth keeping, add it to the spec's memlog before implementing.

---

# General

## 1. Is BMAD worth using?

**Yes for multi-story work; no for everything else — and the part you find useful is
exactly the part plain prompting can't give you.**

Asking Sonnet to "generate a PRD" produces a *document*. BMAD produces a *pipeline*:
the PRD feeds architecture, architecture feeds epics, epics feed stories, and each story
file arrives carrying the context an implementing agent needs (`bmad-create-story` →
`bmad-dev-story`), with validation gates (`bmad-check-implementation-readiness`) between
stages. The automatic Epic/Story generation you value is downstream leverage of that
structure — a freestanding PRD has no machinery to decompose itself into implementable,
traceable units. The spec kernel discipline (capabilities with testable success criteria,
explicit non-goals) is also what makes your Q&A→spec→BMAD→implementation loop work at
all; prose PRDs don't survive being handed to an agent three weeks later.

The honest costs: token overhead per stage, ceremony that is pure waste on small changes,
and the exclusion problem you raise in §5. So the working rule:

- **Use full BMAD** for anything that becomes 3+ stories or that a future agent must
  pick up cold (this website, QuantScenarioBench features, the Writing Assistant).
- **Skip it** for fixes and tweaks — `bmad-quick-dev` or plain prompting; a PRD for a
  one-file change is negative value.

## 2. GitHub Issues for Epics and Stories

**Keep publishing Issues — but stop paying LLM tokens to do it.**

The value side is real and aligned with your portfolio strategy: Issues are public,
timestamped development history (the same "visible evidence" asset class as your
articles), they give every PR a `Closes #n` anchor, and they are the only progress view
that exists outside your working tree. Going straight from planning to implementation
would save little and delete a public asset you explicitly value.

The cost side is a false dilemma: nearly all the token cost (and all the unreliability —
your §4) comes from having an LLM improvise `gh` calls. Issue publishing is a
*deterministic projection* of story files onto GitHub — a script's job, not a model's.
`specs/spec-github-story-sync/` moves every GitHub mutation into an idempotent CLI; the
LLM only writes the Review Focus prose. After that, publishing an issue costs
approximately zero tokens, which dissolves the "is it worth the tokens" question.

## 3. What should `commit-groups` look like?

Your three requirements are compatible and, together, they dictate the design — specced
in `specs/spec-commit-groups-v2/`:

1. **You never think about boundaries:** the skill analyzes the working tree and proposes
   a complete plan — every changed file in exactly one group, grouped by intent
   (feature/fix/docs/config), conventional-commit message per group.
2. **You still review:** exactly **one approval gate**. The plan is a table (commit #,
   message, files); you approve, edit in plain language ("move X to commit 2, reword 1"),
   or abort. Nothing is staged before approval. One gate — not a wizard — is the
   anti-complexity constraint, because complexity is what killed v1.
3. **Exclusions:** a `.claude/commit-exclude` file in gitignore syntax. Excluded paths
   are never staged, and the plan *warns* when an excluded path is already tracked (the
   QuantScenarioBench failure mode), pointing you at the cleanup command from §5.

Deliberately out: hunk-level splitting (a file belongs to one commit), pushing, and any
mode/submenu structure.

## 4. Fixing `publish-issue`, `commit-groups`, `implement-issues`

All three failures share one root cause: **LLM-improvised state mutation against state
that exists only as prose.** The architectural fix is the same everywhere — make state
machine-readable, make mutations deterministic, keep the LLM for content generation.

- **`publish-issue` "no Story exists":** the command asks the model to "locate the
  current completed BMAD Story" — a judgment call over prose with no machine-readable
  status. Fix (spec-github-story-sync CAP-1): story frontmatter gains
  `status: ready|published|…` and `issue: <n>`; "publishable" becomes a file scan, and a
  negative answer must enumerate *which* stories exist and why each doesn't qualify —
  a bare "nothing to publish" becomes impossible.
- **`publish-issue` dropping dependencies:** dependencies currently live in story prose,
  so the model sometimes doesn't carry them over. Fix (CAP-3): `depends_on: ["1.2"]` in
  frontmatter, projected mechanically to sub-issue links + a `Depends on #n` body section.
- **`implement-issues` label/Project V2 flakiness:** Project V2 requires GraphQL
  mutations that fail silently when improvised. Fix (CAP-4): the sync tool performs
  every label/Project write with a **read-back verification**; a failure is reported
  with the raw API error instead of being skipped. `implement-issue` keeps its LLM flow
  for branch/code/PR and calls the tool for the state changes.
- **`commit-groups` too complicated:** full replacement, §3 above.

## 5. Automating BMAD exclusions — yes, but not with your proposed script

A per-repo `.git/info/exclude` updater still requires remembering to run it in every new
repo — the exact failure mode you're trying to kill. **A global gitignore is strictly
better:** `git config --global core.excludesFile ~/.config/git/ignore` with the BMAD
patterns, configured once per machine (one line in `post-create.sh` for dev containers),
covers every current and *future* repository with zero per-repo action and nothing
checked into any repo. Repos that should commit BMAD files opt back in with `!` negation
patterns in their own `.gitignore`.

For the cleanup half: **semi-automate, don't fully automate.** The specced `bmad-clean`
command scans for *tracked* BMAD artifacts, dry-runs by default, and runs
`git rm -r --cached` only after explicit confirmation — leaving files on disk and the
commit to you. Fully-automatic `git rm --cached` on repo entry is a destructive surprise
waiting to happen, and history purging (files already pushed) is deliberately out of
scope. Spec: `specs/spec-bmad-exclusions/`.

## 6. Would Graphify reduce token usage?

Graphify is an open-source knowledge-graph skill for Claude Code: it parses the codebase
with tree-sitter into a dependency/community graph (no LLM tokens spent building it) and
ships a `GRAPH_REPORT.md` Claude reads before deciding what to grep, persisting across
sessions. Reported savings are 6.8×–49× depending on task, with up-to-70× claims for
500+-file projects — but note those numbers come from advocacy posts, not neutral
benchmarks.

**Practical answer: yes for multi-day work on repos of roughly 100+ files; not "always."**

- This website repo is far too small — graph overhead without payoff.
- QuantScenarioBench-scale repos over several days are exactly the fit: the savings come
  from *exploration* turns (re-reading files to rediscover structure), which is what
  multi-day sessions repeat most.
- Two caveats: the index goes stale as you edit (re-index cadence matters), and savings
  concentrate in navigation-heavy tasks, not small localized edits.

Do the measurement your own workflow deserves: initialize it on your next multi-day
QuantScenarioBench stint, compare `/usage`-style consumption against a comparable prior
week, and only then promote it to a default in your repo-setup routine. Given your §7
problem (weekly limit by day 3), this is your cheapest lever — it attacks consumption
before you spend a yen.

Sources: [CLSkills setup guide](https://clskillshub.com/blog/graphify-claude-code-integration),
[MindStudio write-up](https://www.mindstudio.ai/blog/graphify-claude-code-knowledge-graph-large-codebase-70x),
[dev.to walkthrough](https://dev.to/lorenzojkrl/cut-your-claude-token-consumption-by-70x-3kh2).

## 7. Should you upgrade your Claude plan?

**Yes — upgrading dominates pay-after-limit at your budget.** The arithmetic:

- Your budget: ¥10,000/week ≈ ¥43,000/month ≈ **$280/month** (at ~¥155/$).
- Max 5x: **$100/month** (~¥3,600/week-equivalent) — 5× Pro's usage.
- Max 20x: **$200/month** (~¥7,200/week-equivalent) — 20× Pro's usage.

Both tiers fit inside your budget; even Max 20x costs less than you're willing to spend.
Subscription usage is dramatically cheaper per token than paying API-rate overage after
hitting a limit, so "upgrade first, buy extra usage only for genuine spikes" is the right
order. Concretely:

- If you're on **Pro** and exhausting the week by day 3, **Max 5x** should roughly cover
  a full week at your current intensity (3 days × 5 ≈ two weeks of headroom); it also
  keeps your Fable-for-architecture sessions viable, which are the most limit-hungry.
- If you're already on Max 5x, go to **Max 20x** — still under budget.
- Pair it with §6 (Graphify) and §2/§4 (de-LLM-ing the GitHub plumbing): your stated
  policy of spending tokens only on long-term assets is currently violated by tooling
  overhead, and those specs remove it.

Caveat: Anthropic doesn't publish exact per-tier token counts, and weekly limits/pricing
shift — verify current JPY pricing at checkout. Sources:
[Max plan — Claude Help Center](https://support.claude.com/en/articles/11049741-what-is-the-max-plan),
[Claude Code usage limits (2026)](https://www.morphllm.com/claude-code-usage-limits),
[Claude Code pricing breakdown](https://www.morphllm.com/claude-code-pricing).

---

# Website

## 1. Writing Assistant Agent as a separate repository

**The architecture is sound — and it's the natural next form of the specs we already
built.** Three reasons it's right:

1. **The work happens where the evidence lives.** The draft pipeline's harvest step
   (SPEC-article-draft-pipeline CAP-1) needs the *source repo's* files, commits, and
   specs. A plugin installed per-repository runs the harvest inside QuantScenarioBench
   or research-notes natively; keeping the assistant in the website repo would force
   cross-repo gymnastics for every article that isn't about the website.
2. **The contracts already exist.** `spec-article-frameworks`, `spec-article-draft-pipeline`,
   and `spec-article-review` port to plugin skills nearly verbatim — the new repo is
   packaging plus a harvest-source mechanism (`writing-sources.yaml`), not a redesign.
3. **The engine/identity split makes OSS cheap.** Your name, site URL, pointer block,
   and canonical policy move into a user config file; the skills stay generic. Releasing
   then costs a config-file deletion and a README, not a rewrite.

On releasing it as a standalone open-source product: **plausible, decide after
dogfooding.** The niche — an evidence-grounded, anti-hallucination technical-article
pipeline that runs inside your own repos — is real and mostly unoccupied (generic
"AI writing tools" don't do source-pointed harvesting or `[VERIFY]`-marked claims). But
an OSS tool with zero produced artifacts is a liability; the release decision gates on
the plugin having drafted real published articles for research-notes/QuantScenarioBench.
That gate is written into the spec as a constraint, and shipping the tool would itself
supply an F1/F2 article ("how I built an article pipeline that can't invent evidence").

The implementation-ready spec — repo layout, plugin manifest, config schemas, and the
port mapping from the three existing specs — is at `specs/spec-writing-assistant/`
(companions: `plugin-layout.md` + the three adopted article specs). BMAD can create
epics from it directly; the first epic is mechanical (repo scaffold + port), the second
is the harvest/config layer, and dogfooding on research-notes is the acceptance test.

---

## Summary

- **BMAD:** keep it for 3+-story work — the value is the pipeline (stories with context,
  gates, traceability), not the PRD prose; skip it for small changes.
- **Issues:** keep publishing them; make it free and reliable by moving all GitHub
  mutations into a deterministic sync tool (`spec-github-story-sync`).
- **commit-groups:** one-pass propose→review→execute with a `.claude/commit-exclude`
  file and a single approval gate (`spec-commit-groups-v2`).
- **Exclusions:** global gitignore once per machine beats per-repo scripts; confirmed
  `bmad-clean` retrofit for already-tracked files (`spec-bmad-exclusions`).
- **Graphify:** adopt for multi-day work on 100+-file repos, measure before making it
  default; skip on small repos.
- **Plan:** upgrade — Max 5x (or 20x) is well under your ¥10,000/week budget and beats
  paying overage.
- **Writing Assistant:** correct architecture; implementation-ready spec produced;
  OSS release gated on dogfooding (`spec-writing-assistant`).
