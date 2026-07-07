# Personal Technical Website — Architecture Document

| | |
|---|---|
| **Status** | Draft, generated from `docs/website-architecture-spec.md` and `docs/prd.md` |
| **Date** | 2026-07-06 |
| **Scope** | Technical design for Epics 1–4 (`docs/epics/`). Product/IA/content decisions are not made here — they are cited from the spec. |

---

## 1. Introduction

This document designs the implementation that satisfies `docs/prd.md`'s requirements
without altering any decision in `docs/website-architecture-spec.md`. The spec
explicitly leaves "component structure, CSS methodology, build tooling internals" to
the implementer (spec §1), subject to the non-functional requirements (spec §8) and
acceptance criteria (spec §13). This document exercises that discretion and records
its reasoning, so a future maintainer can tell decision-by-spec apart from
decision-by-implementer.

Starting point: `src/App.tsx` renders a hardcoded profile and two project cards; there
is no content layer, no additional routes, and no build-time validation (`CLAUDE.md`).
Every system described below is new.

## 2. High-level architecture

- The site is a **statically generated, content-registry-driven** multi-page site.
  Content records (markdown + YAML frontmatter, spec §6) are the single source of
  truth; pages are generated from them at build time, not authored as markup (AP-1).
- The build pipeline has two stages that must both pass before a deploy:
  1. **Content validation** — parse every record, validate its frontmatter against
     its type's schema (spec §6.2), resolve every `related.*` slug, and reject
     duplicate slugs (FR2/AC-4).
  2. **Static generation** — render every route in the URL taxonomy (spec §7.1) to
     static HTML at build time, so pages are readable with JavaScript disabled
     (NFR1/AC-7).
- Deployment remains GitHub Pages via `.github/workflows/deploy.yml`, at the custom
  domain (`base: "/"`), per `CLAUDE.md` and spec D-2 — except where FR4's redirect
  requirement forces a scoped addition (§7 below).
- No server, database, or CMS exists at any layer (AP-2, AP-8, NFR2, NFR3). The only
  external services are the ESP embed and (optionally) a cookieless analytics
  snippet — both link/embed-only, never load-bearing for navigation (NFR6).

```
content/                     ← markdown + frontmatter records (source of truth)
  profile.md
  projects/<slug>.md
  products/<slug>.md
  publications/<slug>.md
  articles/<slug>.md
  newsletter-issues/<slug>.md (Phase 3+)
        │
        ▼  build-time: parse + validate (schema, slugs, related refs)
        │
content-registry (generated, typed, in-memory at build)
        │
        ▼  build-time: static render
        │
dist/                        ← static HTML/CSS/JS + feed.xml + sitemap.xml + redirects
```

## 3. Tech stack

| Concern | Choice | Rationale |
|---|---|---|
| Language | TypeScript | Unchanged (`CLAUDE.md`). |
| UI | React 19 | Unchanged. Components remain presentational (`src/components/`). |
| Build | Vite 6 + a static-generation layer (see §4, D-8) | Unchanged base tool; static-gen is additive. |
| Content parsing | `gray-matter` (frontmatter) + a markdown renderer (e.g. `remark`/`rehype` pipeline) | Standard, dependency-light; no CMS. |
| Schema validation | A schema library (e.g. `zod`) driving FR2/AC-4 | Gives typed records *and* the required build-time gate in one definition. |
| Routing | File/route-table driven static routes, one per spec §7.1 entry | Matches the fixed, spec-defined URL taxonomy — no need for a general-purpose router at build time; client-side nav (if any) is progressive enhancement only. |
| Feeds/sitemap | Generated from the same content registry as pages | Single source of truth; no hand-maintained XML. |
| Hosting | GitHub Pages (unchanged) + a redirect-stub generator (§7, D-9) | Keeps existing deploy pipeline; closes the one gap it has. |
| Testing | Content-validation script run in CI as part of `npm run build`; no additional framework mandated by the spec | The spec's own AC-4 substitutes for a generic test suite as the content-correctness gate. |

## 4. Rendering strategy — Decision D-8

**The gap.** `src/App.tsx` today is a plain React 19 + Vite 6 client-rendered (CSR)
SPA: the initial HTML is an empty `<div id="root">`, filled in by JavaScript. Spec
AC-7/NFR1 require content pages to be **readable with JavaScript disabled**. A bare
Vite+React CSR build cannot satisfy this. This is a genuine implementation ambiguity:
the spec leaves "framework... build tooling internals" free (§1), but the current
repo's stack, as pinned in `CLAUDE.md`, is CSR-only, and the spec's NFR is
non-negotiable.

**Resolution (binding default, in the spec's own §12 style).** Adopt **static
prerendering of the existing React/TypeScript/Vite stack** rather than a framework
migration:
- Each route in the URL taxonomy (spec §7.1) is prerendered to static HTML at build
  time (e.g. via a Vite-integrated static-site-generation layer such as
  `vite-react-ssg`, or an equivalent build-time renderer that walks the route table
  and calls `ReactDOMServer` per route). React remains the component model and
  hydrates on load for the progressive-enhancement pieces (BibTeX copy buttons,
  writing-index filters) — everything else is legible with JS off.
- This keeps `CLAUDE.md`'s pinned stack (React 19 + TypeScript + Vite 6) intact and
  keeps `npm run build` / `npm run preview` / `docker compose up --build` working as
  documented, avoiding a rewrite in a different framework (e.g. Astro) that the spec
  does not require and `CLAUDE.md` does not anticipate.
- **Owner override path**: if a full SSG framework migration (Astro, etc.) is
  preferred, it satisfies the same NFRs; this default exists so Epic 1 is not
  blocked, per the spec's own philosophy that defaults must never block
  implementation (spec §12 preamble).

## 5. Content model

Schemas are transcribed unchanged from spec §6.2 (normative; field names are
binding). This document does not repeat the full YAML here — see spec §6.2 and
`docs/content-guide.md` for the authoring-facing version. Architecturally:

- One file per entity, under `content/<type-plural>/<slug>.md` (or
  `content/profile.md` for the profile singleton).
- `slug` is the filename stem and is permanent (AP-3); renames require an entry in
  the redirect map (§7), never a slug change on the same conceptual entity without
  one.
- `related.*` fields are the only cross-record edges; the build computes inverse
  edges (FR9) — records never carry a reciprocal entry.
- Two schema fields used by page specs are **not** present in the spec's normative
  §6.2 schemas. These are additive gaps, not contradictions requiring a product
  decision — see D-10 and D-11 in §9 below; both are resolved by adding
  implementer-defined optional fields, which spec §6.2 explicitly permits ("implementers
  may add derived/internal fields... but not repurpose these").

## 6. SEO, structured data, feeds

- Per-page `<title>`/description/canonical/OG/Twitter tags and JSON-LD (spec §8.2)
  are derived functions of a record's fields, implemented once (e.g. a
  `<PageMeta record={...} type={...}>` component) and applied by every page template
  — never authored per page (FR7).
- `/sitemap.xml` and `/feed.xml` are generated in the static-generation build step
  from the same content registry that renders pages, so they cannot drift from what's
  actually published (FR8).
- JSON-LD type mapping: `Person` (home, about), `Article` (canonical articles),
  `SoftwareApplication` (products), `Dataset`-bearing `CreativeWork` (benchmark
  projects with dataset links), `ScholarlyArticle` (publications) — exactly the
  mapping in spec §8.2, with no additional types invented.

## 7. Redirects — Decision D-9

**The gap.** Spec §7.1 requires "a declarative redirect map (source → destination)
honored by the deployment" so renames never break URLs (AP-3). GitHub Pages (the
current and spec-D-2-endorsed host) serves only static files: it has no built-in
redirect-rules engine (no `_redirects` / `vercel.json` / edge-middleware equivalent).

**Resolution (binding default).** Represent the redirect map as a single data file
(e.g. `content/redirects.yml`, `source → destination` pairs) and, at build time,
generate a static stub HTML page at each `source` path containing:
- `<link rel="canonical" href="<destination>">`,
- `<meta http-equiv="refresh" content="0; url=<destination>">`,
- a plain `<a href="<destination>">` fallback link (so the page is still useful with
  JS disabled *and* with meta-refresh ignored, satisfying NFR1 even on a redirect
  page),
- HTTP 200 (GitHub Pages cannot serve a real 3xx for static files) — search engines
  and browsers still resolve the meta-refresh; this is an accepted, well-precedented
  static-hosting redirect pattern.

This keeps the existing GitHub Pages deployment (no infra migration, consistent with
AP-8's static-first principle and D-2's domain default) while giving the spec's
redirect requirement a concrete mechanism. **Owner override path**: if true HTTP
3xx redirects are required (e.g. for a redirect-sensitive SEO concern), migrating
hosting to a platform with an edge-redirect engine (Cloudflare Pages, Netlify) would
be the alternative — flagged here, not adopted, since it is a hosting change beyond
the spec's stated invariants.

## 8. Navigation & chrome

- Global header/footer per spec §7.2, implemented as shared layout components.
- Product landing pages (`validating`/`live`) render a distinct, reduced-chrome
  layout wrapper (wordmark-only header) per §7.2's deliberate exception — implemented
  as a separate page-level layout, not a conditional inside the global layout, to keep
  the global layout simple (NFR8 — additive, not redesigned, as products are added).

## 9. Open Questions & Decisions Log

Continuing the spec's own §12 numbering (D-1..D-7 are in the spec). These are
implementation ambiguities/inconsistencies found while designing the architecture;
none changes a product decision. Each carries a binding default so no epic is
blocked, exactly as the spec's own D-1..D-7 do.

| ID | Issue | Binding default | Owner override path |
|---|---|---|---|
| D-8 | AC-7/NFR1 (JS-disabled readability) vs. current CSR-only Vite+React stack (`CLAUDE.md`) | Add build-time static prerendering on top of the existing Vite+React stack (§4). | Migrate to a full SSG framework instead — functionally equivalent, larger diff. |
| D-9 | FR4 (declarative redirect map "honored by the deployment") vs. GitHub Pages having no native redirect engine | Generate static meta-refresh + canonical-tag stub pages per redirect entry, served as HTTP 200 (§7). | Migrate hosting to a platform with true edge redirects (Cloudflare Pages/Netlify). |
| D-10 | `unlisted` field is used by the Products-index page spec (§7.3) but absent from the normative `product` schema (§6.2) | Add `unlisted: boolean` (optional, default `false`) to the `product` schema as an implementer-added field, per §6.2's explicit allowance. | Owner amends spec §6.2 to add the field formally. |
| D-11 | `featured` (and an implied curation-order signal) is used by the Home page spec (§7.3 "Featured work," any of project/product/publication) but only defined on the `project` schema (§6.2) | Add `featured: boolean` (optional, default `false`) to `product` and `publication` schemas; when more than 3 records qualify, order by each type's natural recency field (`started`/`launched`/`year`) descending, since the spec does not define a dedicated ordering field. | Owner amends spec §6.2 to add `featured` to all three schemas and/or defines an explicit ordering field. |
| D-12 | (Informational, non-blocking) Recording talks as `publication` (spec D-6) stretches the `status` (`preprint\|published\|superseded`) and paired-`links` requirements, which don't map cleanly onto a talk. | No action — D-6 already supplies a binding default and explicitly defers a proper split to when volume justifies it (AP-9 makes that split cheap later). | N/A — revisit only if talk volume grows. |
| D-13 | `identity-link` is listed as its own content type in spec §6.1's registry table (cardinality "few," GitHub/HF/Zenn/X/LinkedIn/Bluesky/email pointers), but §6.2's normative schemas define no independent schema for it — the same registry-table-vs-schema shape as D-10/D-11. | Treat `identity-link` as an embedded field, not a standalone record type: fold it into `profile.identity_links` (an array field on the `profile` schema), per §6.2's implementer-added-field allowance. PRD FR1's entity list correctly omits it as a standalone type on this basis. | Owner amends spec §6.2 to add `identity-link` as a normative schema in its own right (e.g. if per-link metadata beyond a URL+label is ever needed). |
| D-14 | NFR7 (cookieless analytics) has no epic/story anywhere that schedules actual analytics integration, since the provider is a deferred decision (spec D-4). | Intentionally unscheduled — no story should integrate a provider that hasn't been chosen. When D-4 is resolved, add a small story (pattern-matching Epic 4's gated-story convention: not-started, awaiting the provider decision) to wire the chosen snippet in. | Owner resolves D-4 now instead of deferring, unblocking a story immediately. |

## 10. Source tree (proposed)

```
src/
  main.tsx
  App.tsx                    -- becomes the route table / shell, not content
  content/                   -- typed loader + schema + validator (build-time)
    schema/                  -- one schema module per content type (spec §6.2)
    load.ts                  -- parse + validate + build registry + inverse relations
  pages/                     -- one module per §7.1 route
  components/                -- presentational (existing dir, extended)
    layout/                  -- global header/footer, reduced-chrome product layout
    seo/                     -- PageMeta / JSON-LD component
content/                     -- markdown + frontmatter records (spec §6)
  profile.md
  projects/
  products/
  publications/
  articles/
  newsletter-issues/
  redirects.yml
scripts/
  validate-content.(ts|mjs)  -- FR2/AC-4 gate, run in `npm run build`
docs/
  website-architecture-spec.md  -- authoritative spec (unchanged)
  prd.md
  architecture.md
  content-guide.md
  epics/
  stories/
```

## 11. Testing strategy

- **Content validation** (FR2/AC-4) runs on every build (`npm run build`), failing
  CI/deploy on any violation — this is the primary, spec-mandated correctness gate.
- **Fixture-backed lifecycle checks** (AC-8): since real `archived`/`sunset`/
  `superseded`/`deprecated` records may not exist yet, maintain at least one fixture
  record per lifecycle state under `content/` (or a test-only content dir excluded
  from the live registry) to exercise each rendering path.
- **Redirect smoke test** (AC-3): at least one real or fixture redirect entry,
  verified post-build that the stub page resolves to its destination.
- **Accessibility/perf budgets** (NFR4, NFR5): spot-checked manually per the `/verify`
  and `/run` skills already available in this environment; no new framework mandated.

## 12. Security & privacy

- No secrets, credentials, or PII in the repo (NFR3). Email addresses live only with
  the external ESP (AP-5, §8.1) — never captured or stored in this repo or its
  deployment.
- Analytics, if enabled, must be cookieless and require no consent banner (NFR7,
  D-4) — this rules out any provider requiring a consent-management platform.
