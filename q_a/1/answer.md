# Answer: Information architecture, content strategy, and branding

**Date:** 2026-07-07 (v2 — redone with the public footprint verified, not assumed)
**Question:** `q_a/question.md`
**Grounding:**

- Repo docs: `docs/website-architecture-spec.md` (the spec), `docs/prd.md`,
  `docs/architecture.md`, `docs/content-guide.md`, current `src/App.tsx` / `src/styles.css`.
- Verified public footprint (checked 2026-07-07):
  - [github.com/tim-nish](https://github.com/tim-nish) — 9 followers; pinned: PRISM, website, QuantScenarioBench, KagamiOS.
  - [QuantScenarioBench repo](https://github.com/tim-nish/QuantScenarioBench) — v1.2.1 (4 releases, 81 commits), excellent README, Zenodo DOI, **0 stars**.
  - [Hugging Face org](https://huggingface.co/QuantScenarioBench) — live leaderboard Space, 3 scenario datasets at **45–48 likes each**, active within the last week.
  - [PRISM repo](https://github.com/tim-nish/PRISM) — a real Claude Code plugin (marketplace-installable), 2 commits, 0 stars, early.
  - [KagamiOS repo](https://github.com/tim-nish/KagamiOS) — "research operating system," 62 commits, no releases, 0 stars, active development.
  - **No discoverable Zenn, dev.to, or X presence** under tim-nish / Tomoya Imanishi (web search returned nothing).

Three facts from that verification drive everything below:

1. **You have a "built, not launched" profile.** QuantScenarioBench is a
   genuinely mature artifact (versioned releases, DOI, datasets people have
   liked, live leaderboard) with zero GitHub stars. The gap between artifact
   quality and artifact visibility is the single largest arbitrage available
   to you, and articles are the instrument that closes it.
2. **The writing track record is zero.** There is nothing to "index" from Zenn
   or dev.to yet — the spec's Epic 2.5 ("backfill external Zenn records")
   currently has an empty input. Step zero of any content roadmap is creating
   the Zenn (and dev.to) presence, not choosing between canonical-vs-index
   policies for content that doesn't exist yet.
3. **PRISM and KagamiOS are two different projects** (a Claude Code plugin and
   a research OS, respectively). The live site shows only PRISM; the spec's
   Appendix A migrates a `kagamios` record *using PRISM's card summary*. That's
   a real inconsistency in your own docs that needs an owner decision before
   any article names these projects publicly (see §2.3).

A process note: most of Question 1 is already answered — deliberately and
well — by the spec you commissioned two days ago. Where my advice matches the
spec I say so and add the "why"; where your question pulls against it (the
newsletter gating does), I propose a specific amendment rather than a silent
divergence, which is the spec's own rule (§5 preamble).

---

## 1. Information architecture and visual design for a bilingual hub

### 1.1 Don't redesign the IA — the spec's IA is already the bilingual answer

You offered a complete redesign of layout and navigation. Decline your own
offer. The spec's IA (§7.1) was designed *for* the EN+JA future you describe,
and it encodes the insight that matters most:

> **Language is an attribute of content, not a dimension of the site.** (AP-11)

The wrong long-term architecture is a parallel structure (`/en/…`, `/ja/…`, a
header language switcher, mirrored nav). It doubles maintenance for a solo
owner, creates permanent pressure to translate everything, and — because you
won't — produces a Japanese site that is a visibly worse subset of the English
one. The right architecture, which the spec already specifies:

- **One English site structure.** Chrome, nav, indexes: English only (§8.4).
- **One unified `/writing/` index** mixing canonical (on-site, EN) and external
  (Zenn, JA) records, each with a `language: en | ja` badge and a platform
  badge, plus a simple EN/JA filter (§7.3). A Japanese reader landing anywhere
  immediately sees that JA work exists and where it lives.
- **JA articles stay canonical on Zenn** (AP-6); the site holds 20-line pointer
  records (`mode: external`). Hub benefit without splitting SEO or maintaining
  two article pipelines.
- **`/ja/` stays a reserved, Phase-4, single landing page** — one Japanese
  screen pointing to Zenn and the writing index, built only when Search
  Console shows real Japanese-query impressions (§10 trigger discipline).

Two bilingual specifics worth making explicit:

1. **Ship `profile.languages_note` visibly on the home hero or footer from day
   one** — one line of Japanese, e.g. 「日本語の記事は Zenn に掲載しています →」.
   That is the entire "Japanese UX" needed for Phases 1–2: persona P4 (arrives
   from Zenn) needs identity confirmation and a path back to JA content, not a
   translated site.
2. **`hreflang` is unnecessary** until `/ja/` exists — no two pages are
   translations of each other. When an EN canonical article has a JA
   counterpart on Zenn, link it in the body ("日本語版は Zenn にあります"),
   don't fake cross-domain hreflang.

The layout redesign you're actually due is the one already scheduled: Phase 1
replaces the single-page `App.tsx` with the multi-page hub. That *is* the
redesign. A second, cosmetic one on top would violate the stability contract
(§11 lists "frequent visual redesigns" as a non-goal) for no audience benefit.

### 1.2 Visual design: evolve the current language into a token system

The current identity — warm paper background (`#f7f7f5`), near-black ink, deep
green accent (`#315b3d`), tight-tracked headings, pill links — is quiet,
slightly bookish, and worth keeping. It reads "researcher's site," which is the
P1/P2 signal you want. **Keep the palette family; formalize and extend it.**

For the Phase 1 build:

- **Tokens.** Promote the hardcoded values in `styles.css` into CSS custom
  properties (`--color-bg`, `--color-ink`, `--color-accent`, `--color-muted`,
  `--color-border`, plus a spacing/measure scale). The registry-driven pages
  (cards, badges, lifecycle banners) will need them anyway.
- **Extend, don't replace.** Add the functional colors the new IA needs: a
  badge palette (EN/JA language badges, Zenn/dev.to platform badges,
  archived/sunset/preprint status badges) — muted, bordered chips like the
  existing `project-link-pill`, not saturated tags. Verify every pairing at
  WCAG AA (NFR5); the green-on-paper passes, but don't go lighter than the
  current `#555953` for muted text.
- **Typography — the one place bilingual needs real work now.** The current
  stack (`Inter, ui-sans-serif, system-ui, …`) has no Japanese fallback, so JA
  titles in the writing index will render in an arbitrary OS fallback with
  mismatched weight. Extend to
  `Inter, "Hiragino Sans", "Noto Sans JP", "Yu Gothic UI", ui-sans-serif, system-ui, sans-serif`
  — system JP fonts only, no webfont download, which also respects the ~200 KB
  page budget and no-CDN rule (NFR4). Loosen `line-height` slightly on
  mixed-language lists (JA glyphs sit taller), and scope the h1's `-0.05em`
  tracking to Latin-only strings (your name) — negative tracking looks broken
  on kanji.
- **Layout.** The spec's templates (§7.3) fit a simple system: one ~720–760px
  reading column (as now); card grids for indexes; the reduced-chrome variant
  for product landings. No sidebar. Header per §7.2: wordmark left,
  `Projects · Publications · Writing · Products · About`, ≤ 5 items;
  Benchmarks and Newsletter reachable via home and footer.
- **Dark mode:** optional, low priority — but if you do it, do it in tokens
  from the start (`prefers-color-scheme`); retrofitting after the badge/state
  palette exists is 5× the work.

### 1.3 The gated / "coming soon" newsletter

Your instinct conflicts with spec AP-5 ("every page carries the newsletter
capture") and AC-6, and your instinct is right in substance — with a zero-post
archive and a cold audience, a signup form converts at ~0 and burns trust. But
implement the gate as a *state*, not a removal, so flipping it live later
satisfies AC-6 everywhere at once with no structural change (AP-9).

**Proposed amendment (spec-style, new D-number):**

- One site-level flag, e.g. `newsletter.status: coming-soon | live`, in
  `content/profile.md` or a small site-config record — one line to flip.
- **Every AP-5/§8.1 capture location still renders a newsletter block** — same
  slot, same placement — but in `coming-soon` state it renders the gated
  variant:
  - One honest sentence: *"A low-frequency newsletter on agentic AI systems
    and benchmark engineering launches once there's enough here worth
    sending."*
  - Interim CTA: **RSS** (`/feed.xml`) plus follow links (GitHub / Zenn). RSS
    is the correct pre-launch retention channel for a researcher audience and
    costs nothing.
  - **No email field.** A form in front of an empty archive is worse than none
    for this audience.
- `/newsletter/` exists from Phase 1 (URLs are permanent, AP-3) and renders
  pitch + the same coming-soon block. It never 404s pre-launch.
- **Write the launch trigger down now** so it's a decision, not drift:
  flip to `live` at ≥ 4–5 published canonical articles **and** a drafted first
  issue. When flipped, the ESP embed (spec D-3 default) appears in every slot
  simultaneously and AC-6 becomes fully satisfied.

Honest counterpoint, once: classic pre-launch practice collects emails early
("get notified"), and signups-before-content is what owned lists are for. If a
post ever does well and you feel the gate cost you subscribers, the cheapest
middle path is a single "get notified when it launches" form on `/newsletter/`
only — not site-wide. Your stated plan remains defensible and on-brand for an
evidence-gated site.

---

## 2. Content strategy: platforms, articles, roadmap

### 2.1 Discovery channels vs. canonical index — the answer is asymmetric

Don't pick one policy for both platforms; they're different instruments, and
the spec's division-of-labor table (§3) already has it right:

- **Dev.to = full-text syndication of English pieces.** Write the article
  canonically on your site (`mode: canonical`), republish the *complete* text
  on dev.to with `canonical_url` set to your page (dev.to supports this in its
  frontmatter). Link-only teasers perform terribly there; full text costs you
  nothing because `rel=canonical` routes the search authority to your domain.
  This matters doubly in your situation: your domain is brand-new with ~zero
  organic reach, and your GitHub graph (9 followers) provides no distribution
  either. For the first year, platforms *are* your distribution; canonical
  tags are how that rented reach compounds on the asset you own.
- **Zenn = canonical for Japanese, indexed here.** Publish complete articles
  on Zenn (repo-synced), index them as `mode: external` records. Zenn's
  built-in Japanese distribution is the single biggest audience asset you have
  access to, and Zenn doesn't support cross-domain canonical anyway — fighting
  that splits SEO for no gain (AP-6).
- **Every piece on every platform ends with the same pointer**: your domain
  (+ newsletter once live; RSS until then). That footer is what turns rented
  reach into owned audience — the spec's core invariant (§3).

So: neither "platforms as teasers" nor "site as a mere index." English:
canonical here, syndicated whole. Japanese: canonical there, indexed here.

**Step zero, this week: create the Zenn account (and dev.to profile), set up
Zenn's GitHub repo-sync, and add both to `profile.identity_links`** (the spec's
D-7 placeholders are still unfilled). No content decision matters until the
channels exist.

### 2.2 Yes — write articles, not features. Ship only the minimum writing system.

Your prioritization is correct, and the verified footprint makes it sharper
than "articles are the next priority": **articles are currently the only
mechanism that converts your strongest asset into visibility.** QSB at v1.2.1
with a DOI, a leaderboard, and 45+-like datasets — but 0 repo stars — is a
launch problem, not a product problem. More site features do nothing for it.

One caveat: the site today cannot host a canonical article (single-page
`App.tsx`, no content layer). Don't let that block writing, and don't build
all of Phases 1–2 first either:

- **Week 1–2:** publish article #1 on Zenn (JA) and dev.to (EN) immediately.
  Set dev.to's `canonical_url` later when the site can host it (dev.to lets
  you edit it post-publication).
- **In parallel:** implement the minimal canonical-hosting path — Epic 1
  stories 1.1/1.6/1.11 plus Epic 2's article type — then repoint canonicals.
  Products, lifecycle fixtures, and the rest can trail.

### 2.3 First, resolve the PRISM / KagamiOS naming inconsistency

Before any article names these projects: the live site's card says **PRISM**
("Claude Code plugin for AI-assisted research planning…"), the spec's Appendix
A creates a **`kagamios`** record *with that same PRISM summary*, and GitHub
shows they are **two distinct pinned repos** (PRISM = Claude Code plugin for
literature-backed research proposals; KagamiOS = research operating system,
pre-release). Decide now:

- If KagamiOS **supersedes** PRISM: archive PRISM's repo with a pointer, and
  the site carries one `kagamios` project record.
- If they're **both alive** (my read of the repos): the site gets two project
  records with corrected summaries, and the spec's Appendix A needs a one-line
  fix. PRISM's actual pitch ("agent teams that produce literature-grounded
  research proposals from your repo") is strong and shouldn't be blurred into
  KagamiOS's.

Promote a name only after the artifact people find under it matches the
article. This is a 30-minute decision that gates the whole Tier-1 queue below.

### 2.4 Concrete article recommendations

Filter through AP-10: publish only what requires *your* evidence (logs,
benchmarks, measurements, scars). Ordered by proof-strength of the underlying
artifact — which is why QSB leads and KagamiOS's *introduction* waits:

**Tier 1 — flagship, in order**

1. **"Introducing QuantScenarioBench: a JAX-native benchmark for reproducible
   market scenarios"** (EN canonical→dev.to + JA on Zenn, same week).
   *Narrative:* the design-decision story, not a feature tour — why scenario
   reproducibility is the hard problem; what JAX-native buys and costs; how
   the leaderboard scores and why; one result that surprised you. *Why first:*
   it's your only artifact with releases, a DOI, and third-party signal (HF
   dataset likes); the article gives every future QSB mention a page to point
   at, and it's the piece most likely to finally move repo stars.
2. **"Building a Claude Code plugin that writes literature-grounded research
   proposals"** (PRISM; EN canonical→dev.to + JA on Zenn). *Narrative:* the
   pipeline (repo profiling → literature survey → candidate generation →
   review that *rejects* unsupported proposals) with the nanoGPT worked
   example from your README as the evidence. *Why now:* Claude Code plugin
   content has an enormous, actively searching audience on both Zenn and
   dev.to right now, and you have a real, installable artifact in a space full
   of thin listicles — AP-10 differentiation at its cheapest. (Contingent on
   §2.3 resolving in PRISM's favor.)
3. **"Agent-team engineering lessons from KagamiOS"** (EN canonical→dev.to).
   *Narrative:* the spec's #1 seeding genre (§9) — architecture decisions,
   failure modes actually hit, token economics with real numbers ("what a
   structured-discovery run costs and where the money goes"). *Framing
   matters:* with no release and 0 stars, do **not** write "Introducing
   KagamiOS" yet — write lessons/build-in-public pieces that don't depend on
   the project's status, and save the introduction post for its first tagged
   release.

**Tier 2 — the evaluation-engineering spine**

4. **"How do you know your agent got better? Benchmark engineering for
   agentic systems"** (EN canonical). Generalizes QSB's methodology into your
   stated focus area, using QSB and KagamiOS evals as evidence. This is the
   positioning piece for P2 (collaborators/employers): *evaluation person*,
   not just tool author.
5. **"Designing reproducible market scenarios"** — the dataset story behind
   QSB: what makes a scenario a valid test, how leakage sneaks in, what you
   rejected. Natural JA-first candidate for Zenn's quant/ML crowd.

**Tier 3 — process and survey (low cadence)**

6. **"Spec-driven solo development with agent-authored specs"** — your
   BMAD + Claude Code workflow, with this site's spec/PRD/epics as the worked
   example. The audience is real and large on Zenn right now, but keep it to
   *one* article about the workflow-with-artifacts — a portfolio about its own
   construction is a weak signal. This is the sanctioned version of your
   "document design decisions from the specs" idea.
7. **Signature-methods survey** (JA on Zenn per Appendix A; EN later if it
   lands) — the reputation anchor for the sig-transformers research line.
   Publish when a preprint/repo exists so the paper+code pairing rule (§6.2)
   has something to pair.

**On "documenting design decisions and open questions from the specs"** as a
standing genre — mostly no. The spec's decision log is process exhaust; its
audience is you and your agents. The decisions worth publishing are the ones
embedded in Tier 1–2, where the evidence is a running system, not a planning
document. Article #6 is the one exception.

### 2.5 Publishing roadmap (next ~12 weeks, honest cadence)

The anti-treadmill rule (§9) says 0–1 posts/month must read as normal. Plan
~1 substantial piece per 3–4 weeks; each EN flagship gets a JA counterpart on
Zenn the same week — the bilingual pairing is itself a differentiator almost
nobody ships.

| Weeks | Ship | Channels |
|---|---|---|
| 0 | Create Zenn (repo-synced) + dev.to accounts; fill `identity_links` (D-7); resolve PRISM/KagamiOS naming (§2.3); fix the site card | — |
| 1–2 | Article 1: QSB introduction | Zenn (JA) + dev.to (EN); X/Bluesky thread linking the leaderboard; canonical URL added once the site can host it |
| 2–4 | Minimal writing system live (Epic 1 core + article type); create external records for the new Zenn pieces; repoint dev.to canonicals | Site |
| 4–6 | Article 2: PRISM / Claude Code plugin piece | EN canonical + dev.to; JA on Zenn |
| 7–9 | Article 3: KagamiOS engineering lessons **or** evaluation piece (#4) — pick by which artifact is readier | Same pattern |
| 10–12 | Article 4: the other of #3/#4, or the workflow piece (#6) if 1–3 showed pull for it | Same pattern |
| ~12 | If 4–5 pieces exist and issue #1 is drafted: flip `newsletter.status: live` | Everywhere at once |

Every piece: ends with the pointer block, links its `related` project records,
gets a release-day thread; nothing generic-tutorial-shaped.

---

## 3. Branding, visuals, and the language positioning

### 3.1 Minimalism: right instinct — what's missing is evidence, not decoration

Text-first minimalism is the correct register for your audience. Researchers
and engineering leaders pattern-match illustration-heavy personal sites as
marketing, and fast, quiet, text-dense sites as competence. **Do not invest in
decorative illustration, hero art, or stock imagery** — it would move the
brand *away* from the signal you want.

But the current site isn't disciplined-minimal so much as *empty* — and with
9 followers and 0 stars, no amount of styling fixes what's actually missing:
**proof.** The visual investments with real returns, in order:

1. **An OG-image template.** The most-seen image your site will ever produce —
   every share on X, Slack, LinkedIn, Discord renders it. One build-time
   template (paper background, green accent, title, wordmark, EN/JA badge)
   per page, satisfying FR7. A day of work, permanent payoff.
2. **One real figure per flagship page**: a benchmark results chart, an
   architecture diagram, a leaderboard screenshot. Evidence-visuals — AP-10
   applied to images. A QSB page with a real results chart out-credentials any
   amount of styling. Consistent style (your palette, no chart junk); alt text
   mandatory (NFR5); SVG or well-compressed to respect the ~200 KB budget.
3. **A wordmark + favicon.** Your name (or `tim-nish.dev`) set carefully, ink
   + green. Needed anyway for reduced-chrome product pages (§7.2), the OG
   template, and the tab. That's the entire "logo" a personal research brand
   needs.

That's the whole visual-identity budget. Minimal chrome + evidence-dense
figures is the aesthetic that matches the positioning.

### 3.2 English-first with Japanese, or English-only?

**English-first with Japanese as a first-class content attribute — not
English-only.** (AP-11, endorsed with the strategic reasons.)

- The EN/JP wedge is one of the few *structural* differentiators you hold. In
  English, "agentic AI + evaluation" is a crowded arena where you'd start as
  one unknown voice among thousands; the set of people writing credibly about
  benchmark engineering for agentic systems *in Japanese, with shipped
  artifacts*, is tiny. You're Tokyo-based with zero Zenn presence — that's an
  untapped, underserved audience with built-in platform distribution, i.e.
  exactly what a cold-start author needs.
- The JP community is also a concrete source of collaborators, clients, and
  employers for whom bilingual capability is itself the hiring signal (P2).
- And the spec's design makes JA support nearly free: chrome stays English, JA
  lives on Zenn, marginal cost per JA article is a 20-line pointer record.
  The real choice is not "English-only vs. maintaining a bilingual site" —
  it's "English-only vs. English site + an index of your Zenn work + one line
  of Japanese in the footer." At that price the wedge is unambiguous.

The one path to avoid is the middle one that *looks* international but costs
the most: translated chrome, a language switcher, mirrored pages. That's the
non-goal (§11) — and the trap. Language stays a property of the content, never
of the site.

---

## Summary of recommendations

1. **IA:** keep the spec's architecture — unified English structure,
   `/writing/` with EN/JA badges and filters, Zenn canonical for JA, `/ja/`
   deferred to a data-triggered Phase-4 landing page. The scheduled Phase 1
   hub build *is* the redesign; don't add another.
2. **Visual system:** keep and tokenize the paper/ink/green identity; add JP
   font fallbacks and badge/state colors; no parallel-site chrome.
3. **Newsletter:** gate via `newsletter.status: coming-soon | live`; every
   AP-5 slot renders an honest coming-soon block with RSS as interim CTA and
   no email field; flip live at ~4–5 canonical articles with issue #1 drafted.
   Record as a spec amendment (new D-number).
4. **Platforms:** EN canonical on-site, syndicated in full to dev.to with
   `canonical_url`; JA canonical on Zenn, indexed as external records. Step
   zero: the Zenn/dev.to accounts don't exist yet — create them this week and
   fill the D-7 identity-link placeholders.
5. **Write now, in this order:** QSB introduction (your only artifact with
   releases, a DOI, and third-party signal — and 0 stars, so it's a launch
   problem articles solve), then the PRISM/Claude-Code-plugin piece, then
   KagamiOS *lessons* (not an introduction — save that for its first release),
   then the evaluation-engineering piece. ~1 per 3–4 weeks, each with a
   same-week JA counterpart. First: resolve the PRISM/KagamiOS naming
   inconsistency between the live site, the spec's Appendix A, and GitHub.
6. **Visuals:** no illustration; invest in an OG-image template, one real
   figure per flagship page, and a wordmark/favicon.
7. **Language positioning:** English-first with Japanese as a content
   attribute (AP-11) — the untapped Zenn audience is your cheapest
   distribution wedge; never build a mirrored bilingual site.
