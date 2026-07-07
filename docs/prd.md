# Personal Technical Website — Product Requirements Document (PRD)

| | |
|---|---|
| **Status** | Draft, generated from `docs/website-architecture-spec.md` (v. dated 2026-07-05) |
| **Date** | 2026-07-06 |
| **Owner** | Tomoya Imanishi (tim-nish) |
| **Authoritative source** | `docs/website-architecture-spec.md` — this PRD does not alter any product decision made there. Section references (`§`, `AP-`, `AC-`, `D-`) point back to that document. |
| **Relationship to other artifacts** | See `docs/architecture.md` (technical design), `docs/epics/` (epic-level detail), `docs/stories/` (dev-ready stories), `docs/content-guide.md` (schema authoring reference). |

---

## 1. Goals

- Replace the current single-page, hand-authored site (`src/App.tsx`) with a
  content-registry-driven hub, per the vision in spec §2.
- Ship strictly additively, phase by phase (spec §10), so each phase is a complete,
  shippable product on its own.
- Preserve every product decision in the spec: this PRD organizes and sequences work;
  it does not reinterpret scope, IA, schemas, or non-goals.
- Surface, rather than silently resolve, any point where the spec is genuinely
  ambiguous or internally inconsistent (see §9 below and `docs/architecture.md` §"Open
  Questions & Decisions Log").

## 2. Background context

The current site is a single React component rendering a hardcoded profile and two
project cards (`src/App.tsx`). It has no content layer, no additional pages, and no
build-time validation. The spec (source of truth for this PRD) redefines the site as a
registry-backed hub serving five personas (§4.1) across four strictly-additive phases
(§10):

1. **Phase 1 — Hub**: content registry + schemas + validation; home, projects,
   benchmarks, publications, about, newsletter, feeds, sitemap, redirects, 404.
2. **Phase 2 — Writing**: articles (canonical + external), writing index, syndication.
3. **Phase 3 — Products**: product landing pages, validation/live/sunset lifecycle.
4. **Phase 4 — Compounding SEO** (gated, evidence-driven, no default commitment):
   topic pages, per-pain SEO pages, `/ja/` landing.

Twelve architectural principles (AP-1..AP-12, spec §5) and ten acceptance-criteria
families (AC-1..AC-10, spec §13) govern every phase and are treated here as binding
constraints, not suggestions.

## 3. Requirements

### 3.1 Functional requirements

- **FR1** — Every entity (`profile`, `project`, `product`, `publication`, `article`,
  `newsletter-issue`) SHALL be rendered from a structured markdown + typed-frontmatter
  content record; no entity's content may exist only as hand-written page markup.
  (AP-1)
- **FR2** — The production build SHALL fail when a content record has a missing
  required frontmatter field, an unknown enum value, an unresolvable `related` slug
  reference, or a slug that duplicates another record of the same type. (AC-4)
- **FR3** — The site SHALL implement every route in the URL taxonomy (spec §7.1),
  each rendering the content blocks specified for it (spec §7.3) in the specified
  order; optional blocks with no data SHALL render nothing (not an empty shell).
  (AC-1)
- **FR4** — The repo SHALL contain a declarative redirect map (source → destination)
  that the deployed site honors, so a renamed or retired URL redirects instead of
  404ing. (AP-3, AC-3)
- **FR5** — Lifecycle states SHALL render per spec §6.4: `archived` project (banner,
  drops from featured/home, stays in index, de-emphasized), `sunset` product (landing
  page's CTA replaced by sunset note + optional successor + newsletter capture,
  collapses into a "Retired" section), `superseded` publication (pointer to the
  superseding record), `deprecated` article (banner). (AC-8)
- **FR6** — A newsletter capture element SHALL appear at every location listed in
  spec §8.1 (global footer, home primary placement, `/newsletter/`, product sunset
  pages, end-of-entity CTA block), all feeding one shared external email list, and be
  reachable in ≤ 2 clicks from any entity page. (AP-5, AC-6, AC-9)
- **FR7** — Every page SHALL carry a unique `<title>`, meta description (from the
  record's `summary`), canonical URL tag, and Open Graph/Twitter card tags, generated
  from content record fields — never hand-written per page. JSON-LD SHALL be emitted
  per spec §8.2 (`Person`, `Article`, `SoftwareApplication`, `Dataset`-bearing
  `CreativeWork`, `ScholarlyArticle`, as applicable by page type). (AC-5)
- **FR8** — `/sitemap.xml` SHALL be generated from the content registry; `/feed.xml`
  SHALL be a valid RSS or Atom feed of canonical articles, optionally including
  external-mode articles as link-only items. (§8.2, §8.3, AC-5)
- **FR9** — Relationships SHALL render bidirectionally: if record A's `related.*`
  lists record B, record B's page SHALL show A without B needing a reciprocal entry.
  (§6.3 — single source of truth per edge, inverse derived at build time.)
- **FR10** — The `product` type SHALL support lifecycle states
  `validating | live | sunset`, including a pre-launch "validating" state with a
  signup CTA, and a listing opt-out for stealth validation. (AP-12, §7.3 Products
  index)
- **FR11** — Publishing a new `validating` product landing page SHALL require
  creating exactly one content record file and be completable in under 30 minutes of
  content-authoring work. (AP-12, AC-10 — Phase 3 scope)
- **FR12** — The `article` type SHALL support both `canonical` (full body hosted on
  this site) and `external` (pointer record) modes; an external-mode record with a
  body SHALL fail the build; a canonical-mode record without a body SHALL fail the
  build. (AP-6, AC-4 — Phase 2 scope)
- **FR13** — Product landing pages (`validating` or `live`) SHALL render with reduced
  chrome: header collapsed to wordmark-only (no full nav); footer retains capture +
  identity links. (§7.2, deliberate exception to global nav)
- **FR14** — A custom `/404` page SHALL render the identity line and links to the
  main indexes. (§7.1, §7.3, AC-3)

### 3.2 Non-functional requirements

- **NFR1** — Content pages SHALL be readable with JavaScript disabled; JavaScript is
  progressive enhancement only (filters, copy-BibTeX buttons, etc.). (AP-8, AC-7)
- **NFR2** — The site SHALL be fully servable as static files. Dynamic needs (email
  capture, analytics) SHALL be implemented via external embeds or links only — no
  server-side application logic. (AP-8)
- **NFR3** — No content-critical data SHALL live outside the git repository: no CMS,
  no database, no API-gated content store. (AP-2)
- **NFR4** — Total transfer for a typical content page (excluding embedded demo
  media) SHALL stay under ~200 KB; no external font/CDN dependency SHALL be required
  for readability. (§8.5)
- **NFR5** — Semantic HTML landmarks, full keyboard operability, image alt text
  (supplied by record bodies), and WCAG AA color contrast SHALL hold site-wide. (§8.5)
- **NFR6** — No page or navigation path SHALL depend on a third-party service being
  alive, except the ESP form itself, which SHALL degrade to a plain link if the
  embed fails. (§8.5)
- **NFR7** — Analytics, if enabled, SHALL be cookieless/privacy-first, require no
  consent banner, and perform no per-user tracking. (§8.6, D-4)
- **NFR8** — New content types, sections, and entity instances SHALL be addable by
  adding files (a record, a schema, a view) only — never by redesigning existing
  structure. Later phases SHALL NOT require breaking changes to earlier phases.
  (AP-9, AC-2)
- **NFR9** — Published URLs are permanent (AP-3); the site SHALL apply one
  consistently enforced trailing-slash policy across all routes. (§7.1)

### 3.3 Explicit non-goals (carried over verbatim from spec §11)

Comments/UGC; accounts/auth/personalization; self-hosted search below ~200 entities;
full JP site mirror or machine translation; hosting canonical JP articles (Zenn stays
canonical); mirroring READMEs/PDFs/datasets; a CMS or DB; frequent visual redesigns
that alter IA/URLs; on-site e-commerce/checkout.

## 4. Technical assumptions

- **Repository & language**: single repo, current stack per `CLAUDE.md` — React 19 +
  TypeScript + Vite 6, deployed via `.github/workflows/deploy.yml` to GitHub Pages at
  the custom domain `https://tim-nish.dev` (`base: "/"`). This PRD does not propose
  changing the language/framework family; `docs/architecture.md` records how the
  content-layer, static-rendering, and redirect requirements are met within it (or
  where a scoped tooling addition is required), since the spec explicitly leaves
  "framework, styling, hosting decisions beyond stated invariants" to the implementer
  (spec §1, §1 scope note).
- **Content storage**: markdown + YAML frontmatter files in-repo, one file per entity,
  per spec §6. No headless CMS integration of any kind.
- **Testing**: no test framework is currently configured (`CLAUDE.md`). This PRD
  requires build-time content validation (FR2) as a hard gate; broader test-strategy
  choices are recorded in `docs/architecture.md`.
- **Hosting/deployment**: GitHub Pages via the existing Actions workflow, unless the
  redirect requirement (FR4) proves genuinely unworkable there — see decision log.
- **External services**: ESP and analytics providers are deferred decisions with
  binding defaults (spec §12 D-3, D-4) — not selected in this PRD.

## 5. Epic list

Epics map 1:1 to the spec's phase roadmap (§10), preserving its strict
additivity (AP-9) and its explicit gating of Phase 4.

1. **Epic 1 — Hub Foundation** (Phase 1): content registry, schemas, validation;
   home, projects (+detail), benchmarks view, publications (+detail), about,
   newsletter page, global capture, SEO/structured data, feeds, sitemap, redirects,
   404; seed content migrated from the current site.
2. **Epic 2 — Writing System** (Phase 2): article type (canonical + external), writing
   index, canonical article template, syndication conventions, external records for
   existing Zenn output.
3. **Epic 3 — Products & Validation** (Phase 3): product type, landing template with
   reduced chrome, validating/live/sunset states, products index, first validation
   landing page exercised end-to-end.
4. **Epic 4 — Compounding SEO** (Phase 4, gated): topic pages, per-pain/comparison SEO
   pages, `/ja/` landing page — each individually go/no-go gated on search data, per
   spec §10's explicit trigger discipline. Not a default commitment.

Full epic detail: `docs/epics/`. Dev-ready stories: `docs/stories/`.

## 6. Epic details

### Epic 1 — Hub Foundation

**Goal**: stand up the content registry, its validation, and every Phase 1 page, so
the site fully supersedes the current single-page app and satisfies AC-1 through AC-9
for Phase 1's scope.

| Story | Title | Summary |
|---|---|---|
| 1.1 | Content schema & build-time validation pipeline | Establish the markdown+frontmatter ingestion layer and the validator that enforces FR2/AC-4 for all six content types up front (schemas defined even for types whose pages land in later stories). |
| 1.2 | Profile content type + About page | Singleton `profile` record; `/about/` page per §7.3. |
| 1.3 | Project content type, Projects index, Project detail | `project` record type; `/projects/`, `/projects/<slug>/`. |
| 1.4 | Benchmarks curated view | `/benchmarks/`, filtered view over `kind: benchmark` projects. |
| 1.5 | Publication content type, Publications index, Publication detail | `publication` record type; `/publications/`, `/publications/<slug>/`. |
| 1.6 | Home page (hub) | `/`, all seven blocks per §7.3, drawing on the registry. |
| 1.7 | Newsletter capture (global) + Newsletter page | Footer capture component reused site-wide; `/newsletter/`. |
| 1.8 | SEO metadata, structured data, sitemap | Per-page title/description/canonical/OG/Twitter + JSON-LD (FR7); `/sitemap.xml`. |
| 1.9 | RSS/Atom feed | `/feed.xml` (FR8) — scoped to Phase 1's available content types. |
| 1.10 | Redirect map + custom 404 page | Declarative redirect mechanism (FR4); `/404`. |
| 1.11 | Seed content migration & Phase 1 cutover | Migrate `profile`, `kagamios`, `quantscenariobench` per Appendix A; retire `src/App.tsx`'s hardcoded content; verify AC-1..AC-9 for Phase 1. |

### Epic 2 — Writing System

**Goal**: bring the `article` type live in both modes and give writing a home,
without touching any Phase 1 structure (AP-9).

| Story | Title | Summary |
|---|---|---|
| 2.1 | Article content type (canonical + external) | Schema + validation, including the canonical-requires-body / external-forbids-body rule (FR12). |
| 2.2 | Writing index page | `/writing/`, unified reverse-chronological list, language + canonical/external filters. |
| 2.3 | Canonical article page template | `/writing/<slug>/`, full body render, syndication note, deprecated-state banner. |
| 2.4 | Syndication conventions & feed inclusion | `rel=canonical` checklist tie-in; `/feed.xml` updated to include articles. |
| 2.5 | Backfill external Zenn records + home "recent writing" wiring | Populate external-mode records for existing Zenn output; wire home block 4. |

### Epic 3 — Products & Validation

**Goal**: bring the `product` type live end-to-end, proving the ½-day validation
workflow the spec calls the highest-ROI step of the revenue track (AP-12).

| Story | Title | Summary |
|---|---|---|
| 3.1 | Product content type + validation | Schema per §6.2, including the `unlisted` field gap noted in the decision log. |
| 3.2 | Product landing page template | `/products/<slug>/`, reduced chrome, all three lifecycle states (FR10, FR13). |
| 3.3 | Products index page | `/products/`, live/validating/retired sections per §7.3. |
| 3.4 | Sunset & lifecycle behaviors | FR5's product-sunset behavior, retired-section collapse. |
| 3.5 | Validation-speed proof run | Publish one real or fixture `validating` product end-to-end and measure against the sub-30-minute bar (AC-10). |
| 3.6 | Newsletter issue archive (optional) | Phase-3-optional archive on `/newsletter/`, per §6.2 `newsletter-issue` and §10. |

### Epic 4 — Compounding SEO (gated)

**Goal**: reserve the URL space and design now; build nothing without an explicit,
data-backed go decision per sub-item (spec §10's trigger discipline).

| Story | Title | Summary |
|---|---|---|
| 4.1 | Topic pages from tags (gated) | `/topics/<tag>/`, sourced from existing `topics` metadata already collected since Phase 1. |
| 4.2 | Per-pain / comparison SEO pages (gated) | Programmatic SEO under `/products/…`, per §7.1 reservation. |
| 4.3 | `/ja/` JP landing page (gated) | Single landing page, explicitly not a site mirror (AP-11, non-goals §11). |

Each Epic 4 story starts in a **not-started, awaiting go/no-go** state; none is
scheduled by this PRD.

## 7. Traceability

Every FR/NFR above cites the spec section and/or acceptance criterion (AC-1..AC-10,
§13) it is drawn from. No requirement in this PRD introduces a product decision absent
from the spec; where the spec was silent or internally inconsistent, that is recorded
— not resolved by invention — in `docs/architecture.md` § "Open Questions & Decisions
Log," using the same deferred-decision-with-binding-default pattern the spec itself
uses in §12 (continuing its numbering from D-8).

## 8. Success criteria

Per phase, this PRD is satisfied when the phase's epic stories are Done and the
spec's acceptance criteria in scope for that phase (§13, AC-1..AC-10) hold, verified
against fixture or real records as AC-8 allows. This is the *shipped* bar — process
completion. §8.1 below is the *working* bar — product-outcome metrics — since the two
are not the same thing and the Phase 4 gates in particular are supposed to be decided
on the latter, not the former.

### 8.1 Success metrics (product outcome, not process)

Per spec §8.6, "the metrics that matter" for this site are: organic search
impressions/clicks, newsletter signups, and referral sources per entity page —
collected via privacy-friendly, cookieless analytics (NFR7, spec §12 D-4), with no
per-user tracking. This PRD adopts those metrics as-is rather than inventing new ones;
they apply differently per phase:

- **Phase 1 (Hub)**: baseline collection starts — impressions/clicks and referral
  source per entity page, newsletter signups site-wide. No target is set yet; this
  phase establishes the measurement floor the later phases are judged against.
- **Phase 2 (Writing)**: referral sources and newsletter signups attributable to
  `/writing/` pages specifically — the metric that would validate or invalidate the
  "writing drives the funnel" thesis (§2 Goals).
- **Phase 3 (Products)**: signup/interest conversion rate on `validating` product
  landing pages is the metric that feeds the AP-12 kill/continue decision per product
  — this is the sub-30-minute-to-publish workflow's actual payoff measure, not just
  AC-10's authoring-time bar.
- **Phase 4 (Compounding SEO, gated)**: each sub-item's go/no-go (spec §10's trigger
  discipline) is explicitly "based on search data" — organic impressions/clicks per
  candidate topic/pain page is that data. No sub-item proceeds without it.

Analytics implementation itself is a deferred decision (spec D-4; see `docs/
architecture.md`'s decision log D-14 on scheduling) — this section defines what will
be measured once it exists, not when it ships.

## 9. Open items surfaced during PRD generation

The following are implementation ambiguities or internal inconsistencies found while
translating the spec into this PRD. None changes a product decision; all are resolved
using authority the spec itself already delegates to the implementer (§1's "framework/
build tooling is free" clause, and §6.2's "implementers may add derived/internal
fields" clause). Full detail, rationale, and recommended resolution: see
`docs/architecture.md` § "Open Questions & Decisions Log."

- **D-8** — Static-readability requirement (NFR1/AC-7) vs. the current Vite+React
  client-rendered stack: needs a rendering-strategy decision.
- **D-9** — Declarative redirect map (FR4) vs. GitHub Pages having no native
  server-side redirect engine: needs a redirect-implementation decision.
- **D-10** — `unlisted` field used by the Products-index page spec (§7.3) is absent
  from the normative `product` schema (§6.2).
- **D-11** — `featured` (and an implied curation-order field) is used by the Home
  page spec (§7.3, "Featured work" over project/product/publication) but is only
  defined on the `project` schema (§6.2), not `product` or `publication`.
- **D-12** — (informational only, no action needed) recording talks as `publication`
  records (§12 D-6) stretches the `publication` schema's `status`/`links`
  requirements; not blocking, flagged for whenever talk volume justifies a split.
- **D-13** — `identity-link` is listed as its own content type in the spec's §6.1
  registry table (cardinality "few," pointer entities for GitHub/HF/Zenn/X/LinkedIn/
  Bluesky/email), but §6.2's normative schemas give it no independent schema — it is
  folded into `profile.identity_links` as an array field instead. FR1's entity list
  (profile, project, product, publication, article, newsletter-issue) follows the
  schema section and omits `identity-link` as a standalone type; this is the same
  registry-table-vs-schema shape as D-10/D-11, resolved the same way (embedded field,
  not a missing type).
- **D-14** — NFR7 (cookieless analytics) has no epic/story that schedules the actual
  analytics integration, because the provider itself is a deferred decision (spec D-4).
  This is intentional, not an oversight: no story should exist to integrate a provider
  that hasn't been chosen. When D-4 is resolved, add a small story (pattern-matching
  Epic 4's gated-story convention) to wire the chosen snippet in; until then this gap
  is expected.

## 10. Glossary

Terms below are used identically across FRs, epics, and stories; each maps to the
spec section that defines it. Included so a section of this PRD (or an epic/story
downstream) is readable without the full spec open.

| Term | Meaning | Spec ref |
|---|---|---|
| **Content record** | A single markdown + YAML-frontmatter file representing one entity instance (e.g. one project, one publication). The unit of content authorship. | §6 |
| **Entity / content type** | One of the six schema-governed kinds: `profile`, `project`, `product`, `publication`, `article`, `newsletter-issue`. | §6.1–6.2 |
| **Registry** | The in-memory, typed collection of all validated content records, built once per build; the single source every page renders from. | §2, architecture.md §2 |
| **Slug** | A record's permanent identifier and URL segment (the filename stem). Renaming a slug requires a redirect-map entry, never a bare change. | §6.2, AP-3 |
| **`related.*`** | The only cross-record edge field; the build computes the inverse edge automatically (FR9) — the reverse pointer is never hand-authored. | §6.3 |
| **Inverse relation** | The auto-derived reverse pointer from `related.*` (if A relates to B, B's page shows A without B declaring it). | §6.3, FR9 |
| **Lifecycle state** | A status value that changes how a record renders without deleting it: `archived` (project), `sunset` (product), `superseded` (publication), `deprecated` (article). | §6.4, FR5 |
| **Canonical / external mode** | The two `article` record modes: `canonical` (full body hosted on this site) vs. `external` (pointer record to writing hosted elsewhere, e.g. Zenn). | §6.2, AP-6, FR12 |
| **`featured`** | Optional boolean curation flag controlling Home page "Featured work" inclusion/order; defined on `project` natively, added to `product`/`publication` by decision D-11. | §7.3, D-11 |
| **`unlisted`** | Optional boolean on `product` for stealth validation — the record exists and is reachable by direct URL but is excluded from `/products/` listings. Added by decision D-10. | §7.3, D-10, FR10 |
| **Reduced chrome** | The deliberate layout exception for product landing pages: header collapses to wordmark-only (no full nav); footer keeps capture + identity links. | §7.2, FR13 |
| **Stealth validation** | Publishing a `validating` product page without listing it anywhere public (via `unlisted`), to test demand before committing to a public launch. | §7.3, AP-12 |
| **ESP** | Email service provider — the external system that actually owns the newsletter list; this repo never stores subscriber addresses (NFR3). | §8.1 |
| **AP-n / AC-n / D-n** | Spec's own numbering: **AP** = architectural principle (§5), **AC** = acceptance criterion (§13), **D** = a deferred decision with a binding default (spec §12 has D-2..D-7; this PRD's §9 continues at D-8; `docs/architecture.md`'s decision log also uses this numbering for implementation-level decisions). | §5, §12, §13 |
