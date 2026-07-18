# Article publishing — the site-canonical projection contract

Status: v1, 2026-07-18. Provenance: owner decision record 2026-07-18
(website full-body projection adopted); owner decision record 2026-07-18
(spec ratified with three amendments: deployment-matched canonical base,
proposal output outside the site tree, frontmatter title authority).

This is the generic public contract for how this site publishes articles.
Authoring happens in a private articles repository that is the sole source
of truth; this repository holds **generated, non-authoritative projections**
of published articles. On any mismatch, the authoring side wins and the
projection here is the defect. Nothing in this repository is ever edited as
an article's source.

## 1. Content model

Two article modes:

- **Site-canonical**: the full article body lives here as a committed
  projection file and renders as a page on this site.
- **External**: the article is published elsewhere; this site holds a
  reference record only (title, canonical URL, date) rendered as a link-out
  entry — never a body.

## 2. The projection file

One file per site-canonical article: `content/articles/<slug>.md`.

```yaml
title: <article title>          # copied from the authoring side; the page
                                # and index title come from here, never the body
slug: <stable article slug>
source: <authoring-repo>@<commit>  # the pin this projection was generated from
variant: site
language: en
published: YYYY-MM-DD
generated_by: <tool>@<version>  # immutable birth record
```

Rules:

- Projection files arrive **only by an explicit owner commit**. No tool,
  pipeline, or CI job writes this directory; the generating pipeline's
  output location is outside this repository by construction.
- Projections are never edited in place. Any fix — including a title fix —
  is made on the authoring side and the projection is regenerated and
  recommitted.
- A projection whose `source:` pin trails the authoring side is **stale**;
  stale projections are a publish blocker (checked by a lint on the
  authoring side, where both pins are reachable).
- Published text carries public links only. A pre-commit boundary lint on
  the authoring side blocks private references from ever reaching this
  repository.

## 3. Rendering contract

- The build renders `content/articles/*.md` into static per-article pages
  at `/articles/<slug>` plus an article index.
- Page and index titles come from frontmatter `title:` only — never parsed
  or derived from the body.
- External-mode records render as link-out entries on the index; they have
  no body anywhere in this repository.
- Committed content in, static pages out: the build performs **no fetch
  from any private or remote content source**, at build time or runtime.
- Component and framework choices are free within the existing stack.

## 4. Canonical URLs

The canonical public base URL for site-canonical articles is
**`https://tim-nish.dev/`** — the reader-facing canonical domain, declared
as a single owner-config fact on the authoring side. The GitHub Pages URL
is the **underlying technical hosting URL only**: it is never emitted as a
`canonical_url` and never rendered as an article's public address.
Syndicated copies elsewhere carry `canonical_url` pointing back to the
corresponding `https://tim-nish.dev/` page. Custom-domain wiring, so that
the canonical domain actually serves this site, is a prerequisite for the
first site-canonical publish — a canonical URL that doesn't resolve is
worse than none.

## 5. Acceptance

- A valid projection file renders at `/articles/<slug>` after commit +
  push, titled from its frontmatter.
- An external-mode article appears only as a link-out record.
- No build or runtime code path reads from a private content source.
- The deployed page contains no private references.

## 6. Non-goals

- Any tool-written content in this repository's site tree.
- Build-time or runtime pulls of article content from private sources.
- Editing projections in place; any CMS; dynamic/comment features.
- Authoring authority of any kind in this repository.
