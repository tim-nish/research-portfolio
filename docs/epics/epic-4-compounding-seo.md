# Epic 4 — Compounding SEO (Phase 4, gated)

| | |
|---|---|
| **Source** | `docs/website-architecture-spec.md` §10 "Phase 4 — Compounding SEO"; PRD `docs/prd.md` §6 |
| **Depends on** | Epic 1 (topics metadata already collected since Phase 1); Epic 3 for 4.2 (product records) |
| **Status** | **Not scheduled.** Each story requires its own go/no-go based on search data (spec §10's explicit trigger discipline). This epic exists in the plan so its URL space is reserved (spec §7.1) and its eventual addition is non-breaking (AP-9) — it is not a to-do list or a default commitment. |

## Goal

Reserve design and URL space now; build nothing until warranted by evidence.

## In scope (each individually gated)

- `/topics/<tag>/` — topic pages sourced from `topics` metadata already present on
  records since Phase 1 (metadata-only until this phase, per spec §6.3).
- Programmatic per-pain/comparison SEO pages under `/products/…`.
- `/ja/` — a single JP landing page (explicitly **not** a site mirror — AP-11,
  non-goals §11).

## Out of scope

Any full Japanese site mirror or machine translation (permanently out of scope per
spec §11, not just gated).

## Stories

See `docs/stories/4.1.md` through `docs/stories/4.3.md`. Each is written to the
point of being estimable and buildable, but starts in a **not-started, awaiting
go/no-go** state — no story in this epic should be picked up without an explicit
decision to proceed, backed by search/analytics data (spec §10).

1. 4.1 — Topic pages from tags (gated)
2. 4.2 — Per-pain / comparison SEO pages (gated)
3. 4.3 — `/ja/` JP landing page (gated)

## Definition of done (epic-level)

Not applicable until a story is un-gated. When a story is un-gated, its own
definition of done (in `docs/stories/`) governs, and it must not require breaking
changes to Epics 1–3 (AP-9/NFR8).
