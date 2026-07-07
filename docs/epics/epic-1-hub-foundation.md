# Epic 1 — Hub Foundation (Phase 1)

| | |
|---|---|
| **Source** | `docs/website-architecture-spec.md` §10 "Phase 1 — Hub"; PRD `docs/prd.md` §6 |
| **Depends on** | Nothing (first epic) |
| **Blocks** | Epic 2, Epic 3 (both build on the registry/validation/layout this epic establishes) |

## Goal

Stand up the content registry, its build-time validation, and every Phase 1 page, so
the site fully supersedes the current single-page app (`src/App.tsx`) and satisfies
acceptance criteria AC-1 through AC-9 for Phase 1's scope (spec §13).

## In scope

Content types: `profile`, `project`, `publication` (schemas for `product` and
`article` are also defined now per Story 1.1, even though their pages ship in later
epics, so the validator is complete from day one and later epics are pure addition
per NFR8/AP-9).

Pages: `/`, `/projects/`, `/projects/<slug>/`, `/benchmarks/`, `/publications/`,
`/publications/<slug>/`, `/about/`, `/newsletter/`, `/404`, `/sitemap.xml`,
`/feed.xml`.

Cross-cutting: build-time content validation, redirect map mechanism, SEO metadata +
JSON-LD, global header/footer with newsletter capture.

## Out of scope (belongs to later epics)

`article` pages (Epic 2), `product` pages (Epic 3), topic pages/`/ja/`/per-pain SEO
(Epic 4, gated).

## Architectural decisions this epic depends on

- D-8 (static prerendering strategy) — `docs/architecture.md` §4.
- D-9 (redirect stub mechanism) — `docs/architecture.md` §7.
- D-10/D-11 (schema field additions) — `docs/architecture.md` §9.

## Stories

See `docs/stories/1.1.md` through `docs/stories/1.11.md`.

1. 1.1 — Content schema & build-time validation pipeline
2. 1.2 — Profile content type + About page
3. 1.3 — Project content type, Projects index, Project detail
4. 1.4 — Benchmarks curated view
5. 1.5 — Publication content type, Publications index, Publication detail
6. 1.6 — Home page (hub) — **build after 1.7**: this story's AC1 needs 1.7's shared
   newsletter-capture component; the numeric order is not the build order here.
7. 1.7 — Newsletter capture (global) + Newsletter page — build this before 1.6
8. 1.8 — SEO metadata, structured data, sitemap
9. 1.9 — RSS/Atom feed
10. 1.10 — Redirect map + custom 404 page
11. 1.11 — Seed content migration & Phase 1 cutover

## Definition of done (epic-level)

- AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-9 hold for every Phase 1 page.
- AC-8 holds for the `archived` project state (the only Phase-1-available lifecycle
  state; `sunset`/`superseded`/`deprecated` are exercised in later epics against
  fixtures if needed, per `docs/architecture.md` §11).
- `src/App.tsx`'s hardcoded profile/project content is fully replaced by registry
  content; no product/content decision from the current file survives except as
  migrated data (Story 1.11).
