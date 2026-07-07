# Content Guide

This is the agent-facing API of the content layer (per spec §9). It documents each
content type's schema with a copyable template. **Field names and requiredness below
are normative per `docs/website-architecture-spec.md` §6.2**; this guide only adds
copyable templates and short authoring notes. If this guide and the spec ever
disagree, the spec wins — file an update here.

Two fields marked **(added)** below are not in the spec's §6.2 tables; they close
gaps recorded as D-10/D-11 in `docs/architecture.md` § "Open Questions & Decisions
Log," added under the spec's own allowance that implementers may add optional
derived/internal fields.

File location convention: `content/<type-plural>/<slug>.md`, `content/profile.md` for
the singleton.

---

## `project`

`content/projects/<slug>.md`

```yaml
---
slug: my-project-slug
title: My Project
kind: benchmark            # library | benchmark | plugin | tool | system
status: active              # active | maintained | archived
summary: >
  One or two sentences, plain text, ≤ 240 chars. This is the card + SEO description.
started: 2026-01            # YYYY-MM
links:
  - { label: GitHub, href: https://github.com/tim-nish/my-project }
featured: false              # optional
topics: []                   # optional, kebab-case
related: { publications: [], articles: [], products: [] }  # optional, by slug
citation: |                  # optional, BibTeX
---

Optional body: the project's story — motivation, design, results. Not a README
mirror.
```

Benchmark-kind (`kind: benchmark`) projects should also populate `links` with
leaderboard + dataset entries and are strongly expected to carry `citation`.

## `product`

`content/products/<slug>.md`

```yaml
---
slug: my-product-slug
title: My Product
status: validating           # validating | live | sunset
pain: >
  The searched-for pain, phrased as the user would search/complain. Drives the H1.
summary: >
  ≤ 240 chars.
platforms: [web]             # claude-code-plugin | chrome-extension | vscode-extension
                              # | obsidian-plugin | web | api
cta:
  kind: signup                # signup | marketplace | purchase | contact
  href: "#newsletter"
  label: Get notified
pricing: tbd                  # free | freemium | paid | tbd
launched:                     # optional, YYYY-MM, absent while validating
featured: false                # optional (added — see architecture decision D-11)
unlisted: false                 # optional (added — see architecture decision D-10);
                                 # true hides a `validating` product from /products/
sunset:                       # required only when status = sunset
  date:
  note: >
  successor:
related: { projects: [], articles: [] }
languages: [en]
---

Body: problem → how it works → proof (demo/screenshot/quote) → FAQ.
```

## `publication`

`content/publications/<slug>.md`

```yaml
---
slug: 2026-my-paper
title: My Paper Title
authors: [Tomoya Imanishi]
venue: arXiv                  # arXiv | <workshop/conf/journal name> | tech report
year: 2026
status: preprint               # preprint | published | superseded
links:
  - { label: arXiv, href: "" }
  - { label: Code, href: "" }    # required alongside the paper when code exists
featured: false                  # optional (added — see architecture decision D-11)
citation: |
related: { projects: [], articles: [] }
---

Optional body: abstract or short plain-language summary.
```

## `article`

`content/articles/<slug>.md` — two modes, one schema.

Canonical mode:

```yaml
---
slug: my-article-slug
title: My Article
date: 2026-07-20
mode: canonical
language: en                  # en | ja
summary: >
syndication:                    # optional
  - { platform: devto, href: "" }
topics: []
related: { projects: [], publications: [], products: [] }
updated:                        # optional
---

Body is required in canonical mode.
```

External mode:

```yaml
---
slug: my-zenn-article
title: My Zenn Article
date: 2026-07-20
mode: external
language: ja
summary: >
external:
  href: https://zenn.dev/...
  platform: zenn                 # zenn | qiita | devto | x | other
topics: []
related: { projects: [], publications: [], products: [] }
---
```

Body is **forbidden** in external mode — the build fails a record that has one
(AC-4).

## `profile` (singleton)

`content/profile.md`

```yaml
---
name: Tomoya Imanishi
positioning: >
  One sentence identity statement.
bio: >
  2-3 paragraph markdown bio.
now: >
  1-2 sentences, current focus.
focus_areas: []
identity_links:
  - { label: GitHub, href: https://github.com/tim-nish }
  - { label: LinkedIn, href: https://www.linkedin.com/in/nowwest/ }
  - { label: Email, href: "mailto:tomoya.imanishi.ti@gmail.com" }
  # - { label: Hugging Face, href: }   # placeholder per spec D-7, fill in when known
  # - { label: Zenn, href: }
  # - { label: X, href: }
languages_note: >
  Short EN+JP line signposting bilingual work.
---
```

## `newsletter-issue` (Phase 3)

`content/newsletter-issues/<slug>.md`

```yaml
---
slug: issue-01
number: 1
date: 2026-09-01
subject: Issue subject line
summary: >
---

Optional archived body, or omit and link to the ESP-hosted archive instead.
```

---

## Editorial checklist before publishing any record (spec §9)

- Does this piece require the owner's evidence (logs, benchmarks, scars,
  measurements)? (AP-10 — no generic tutorial content.)
- Is its canonical home correct per spec §3 (division of labor with external
  platforms)?
- Does it link its related entities (`related.*`)?
- Does it end at the funnel (newsletter capture reachable within the standard CTA
  block)?

## Validation you can expect the build to enforce (FR2/AC-4)

- Missing required field → build fails, naming the file and field.
- Value outside an enum (e.g. `status: foo`) → build fails.
- `related.*` slug that does not resolve to an existing record of that type → build
  fails.
- Duplicate `slug` within a type → build fails.
- `mode: external` article with a body, or `mode: canonical` article without one →
  build fails.
