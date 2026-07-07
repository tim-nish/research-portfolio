# Epic 3 — Products & Validation (Phase 3)

| | |
|---|---|
| **Source** | `docs/website-architecture-spec.md` §10 "Phase 3 — Products"; PRD `docs/prd.md` §6 |
| **Depends on** | Epic 1 (registry, validation, global layout, SEO/feed infrastructure) |
| **Blocks** | Nothing; independent of Epic 2 |

## Goal

Bring the `product` content type live end-to-end — landing template, all three
lifecycle states, index page — and prove the sub-30-minute validation-publishing
workflow the spec identifies as the highest-ROI step of the revenue track (AP-12).

## In scope

Content type: `product` (`validating | live | sunset`).

Pages: `/products/`, `/products/<slug>/` (reduced chrome per §7.2).

Cross-cutting: product-sunset lifecycle behavior (§6.4), optional newsletter issue
archive on `/newsletter/` (Phase-3-optional per spec §6.2/§10).

## Out of scope

Programmatic per-pain SEO pages under `/products/…` (Epic 4, gated).

## Architectural decisions this epic depends on

- D-10 (`unlisted` field addition) — `docs/architecture.md` §9.
- D-11 (`featured` field addition) — `docs/architecture.md` §9.
- Reduced-chrome layout — `docs/architecture.md` §8.

## Stories

See `docs/stories/3.1.md` through `docs/stories/3.6.md`.

1. 3.1 — Product content type + validation
2. 3.2 — Product landing page template
3. 3.3 — Products index page
4. 3.4 — Sunset & lifecycle behaviors
5. 3.5 — Validation-speed proof run
6. 3.6 — Newsletter issue archive (optional)

## Definition of done (epic-level)

- AC-1, AC-4, AC-5 hold for `/products/` and `/products/<slug>/`.
- AC-8 holds for the `sunset` product state.
- AC-9 (J2: search → pain → product journey) is walkable without site context.
- AC-10 holds: a new `validating` product ships via one record file in under 30
  minutes of content work, measured (not assumed).
