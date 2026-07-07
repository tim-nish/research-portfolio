# Epic 2 — Writing System (Phase 2)

| | |
|---|---|
| **Source** | `docs/website-architecture-spec.md` §10 "Phase 2 — Writing"; PRD `docs/prd.md` §6 |
| **Depends on** | Epic 1 (registry, validation pipeline, global layout, SEO/feed infrastructure) |
| **Blocks** | Nothing required; Epic 3 does not depend on Epic 2 |

## Goal

Bring the `article` content type live in both `canonical` and `external` modes, and
give writing a home (`/writing/`), without modifying any Phase 1 structure (AP-9 —
strictly additive).

## In scope

Content type: `article` (canonical + external modes).

Pages: `/writing/`, `/writing/<slug>/` (canonical only — external records link
straight out per spec §7.1).

Cross-cutting updates: home page block 4 ("Recent writing") goes live; `/feed.xml`
extended to include articles.

## Out of scope

`product` pages (Epic 3), topic pages (Epic 4, gated).

## Stories

See `docs/stories/2.1.md` through `docs/stories/2.5.md`.

1. 2.1 — Article content type (canonical + external)
2. 2.2 — Writing index page
3. 2.3 — Canonical article page template
4. 2.4 — Syndication conventions & feed inclusion
5. 2.5 — Backfill external Zenn records + home "recent writing" wiring

## Definition of done (epic-level)

- AC-1, AC-4, AC-5 hold for `/writing/` and `/writing/<slug>/`.
- AC-8 holds for the `deprecated` article state.
- AC-9 (J4: article → hub journey) is walkable.
- No Epic 1 page's block order or URL changes as a result of this epic (NFR8).
