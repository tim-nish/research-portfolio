# Personal Technical Website — Architecture & Product Specification

| | |
|---|---|
| **Status** | Draft for review — intended as primary input to BMAD planning |
| **Date** | 2026-07-05 |
| **Owner** | Tomoya Imanishi (tim-nish) |
| **Sources** | `response_1.md` (revenue/product strategy, signature ecosystem, publication strategy), `response_2.md` (marketplace strategy, content strategy, knowledge-management workflow), current site (`src/App.tsx`) |
| **Scope** | Product, information, and content architecture. Implementation-independent: no framework, styling, or hosting decisions beyond stated invariants. |

---

## 1. Purpose of this document

This specification defines the personal technical website completely enough that an
implementing agent (any model) can build it **without making any product or
architectural decisions**. Every decision that shapes the site — what it is for, what
content it holds, how content is modeled, how URLs are structured, what each page
contains, how the site evolves — is made here, with rationale. Where a decision is
deferred to the owner, §12 records it together with a **binding default** so
implementation is never blocked.

Anything not specified here (component structure, CSS methodology, build tooling
internals) is an implementation detail the implementer may choose freely, subject to
the non-functional requirements in §8 and acceptance criteria in §13.

---

## 2. Product vision

### 2.1 Mission

> **The canonical hub of the owner's technical identity**: the one stable,
> owner-controlled place that integrates projects, research, publications, OSS,
> benchmarks, blog writing, newsletter, and current & future products — and that every
> external artifact (arXiv preprint, GitHub repo, Hugging Face space, Zenn article,
> marketplace listing, X thread) links back to.

The strategic reasoning (from the source discussions) that this vision encodes:

1. **Owned, compounding assets beat rented reach.** The two assets that compound
   across every research release and product launch are (a) the owner's domain and
   (b) the email list. Platforms (Zenn, X, Product Hunt, marketplaces) provide reach;
   the domain and list accumulate it. The site exists to be that accumulator.
2. **The site is a hub, not a treadmill blog.** A bespoke blog with no distribution is
   effort spent where no one is looking. The site holds durable, canonical content at
   low cadence; high-cadence distribution happens on platforms that have built-in
   audiences, and always points back here.
3. **One audience, served repeatedly.** The primary niche is researchers, PhD
   students, and research engineers (with a deliberate bilingual EN/JP wedge). The
   site's information architecture is designed around what that audience searches for
   and needs, not around a generic portfolio template.
4. **Two tracks, one hub.** The owner runs a research track (OSS, benchmarks, papers —
   reputation assets) and a revenue track (small products, mostly marketplace-native —
   income experiments). These tracks have different lifecycles and different pages, but
   share the domain, the email list, and the identity. The site must serve both without
   letting either distort the other.

### 2.2 What the site is / is not

| The site IS | The site IS NOT |
|---|---|
| The canonical registry of everything the owner has made | A mirror of GitHub/HF (it links to them; it does not duplicate them) |
| The canonical home of the owner's best English long-form writing | The primary home of Japanese articles (those live on Zenn, repo-synced) |
| The permanent, stable-URL archive (including sunset products) | A frequently-redesigned showcase; URLs and structure are a stability contract |
| A conversion surface: every page offers the newsletter | A gated or account-based experience |
| SEO real estate targeting the searched pains of the researcher niche | A general-audience marketing site |
| Agent-operable: all content is plain text in git, editable by Claude Code | CMS/database-backed; nothing content-critical lives outside the repo |

---

## 3. Strategic context: division of labor with external platforms

The site does not compete with platforms; it assigns each one a role. This table is
normative — it determines what content the site hosts canonically versus indexes.

| Platform | Role | Site's relationship to it |
|---|---|---|
| **Own domain (this site)** | Canonical hub; English canonical long-form; SEO landing pages; newsletter capture | Everything below links back here |
| **GitHub** | Code, OSS credibility | Projects link out; site never mirrors READMEs |
| **arXiv** | Citable handle for research (always paired with a repo, shipped same day) | Publication records link both preprint and repo |
| **Hugging Face** | Models, datasets, demos, leaderboards (successor to Papers with Code) | Benchmark/project records link Spaces & datasets |
| **Zenn** | Japanese articles, repo-synced markdown (built-in JP distribution) | Site indexes them as external writing records |
| **Qiita** | Secondary JP cross-posts only | Not indexed unless a piece is significant |
| **dev.to** | Syndication of English pieces | Syndicated copies carry `rel=canonical` to this site |
| **X / Bluesky** | Release-day threads, build-in-public | Linked from identity block; threads may be indexed as external writing when substantial |
| **Marketplaces** (Claude Code plugins, Chrome, VS Code, Obsidian…) | Product distribution & discovery | Product records link listings; site hosts the landing/SEO page per product |
| **Email service provider** | Newsletter delivery & list storage | Site embeds/links capture forms; list data never lives in this repo |

**Invariant (from the source strategy):** every artifact published anywhere ends with
the same pointer — this domain + the email list.

---

## 4. Audiences and user journeys

### 4.1 Personas (priority order)

1. **P1 — Fellow researcher / research engineer** (EN or JP): arrives from a paper,
   repo, benchmark leaderboard, or article. Wants: what is this project, is it
   credible, where's the code/paper, what else has this person built, how do I follow
   them.
2. **P2 — Prospective collaborator / employer / consulting client**: arrives from
   LinkedIn, a talk, or search of the owner's name. Wants: a coherent picture of
   expertise (agentic AI systems, LLMs, signature methods, evaluation/benchmark
   engineering), evidence of shipped work, contact path.
3. **P3 — Product user or prospect**: arrives from a marketplace listing, a search for
   a specific pain ("arXiv alert by topic", "extract tables from research papers"), or
   a launch post. Wants: does this tool solve my problem, how do I get it, is it
   maintained.
4. **P4 — Japanese developer community reader**: arrives from Zenn or Japanese X.
   Wants: who is this author, what else have they written, EN/JP bridge.
5. **P5 — Newsletter subscriber (any of the above, converted)**: the retention
   audience every other journey should feed.

### 4.2 Canonical journeys (must be friction-free)

- **J1 Artifact → identity:** paper/repo/leaderboard → project page → home → newsletter
  signup or follow link. (≤2 clicks from any entity page to subscribe.)
- **J2 Search → pain → product:** Google query for a specific pain → product landing
  page → marketplace listing or signup. (Landing page must stand alone: no site
  context required to convert.)
- **J3 Name search → credibility:** owner's name → home → projects/publications scan
  → contact. (Home must communicate positioning in one screen.)
- **J4 Article → hub:** Zenn/dev.to article footer → home or related project →
  newsletter. (Every writing record links to its related entities.)

---

## 5. Architectural principles

These are numbered so BMAD artifacts and future decisions can cite them. Each includes
its rationale; an implementer must not violate them, and future maintainers should
amend this section (not silently diverge) if one stops being true.

- **AP-1 — Content is data.** Every entity (project, product, publication, article,
  newsletter issue, profile) is a structured content record (markdown + typed
  frontmatter) in the repository. Pages are rendered *from* records; no entity exists
  only as hand-written page markup. Rationale: the hub's value is its registry; a
  registry must be queryable, validatable, and agent-editable.
- **AP-2 — Plain text, in git, agent-operable.** All content is plain markdown/data
  files under version control. No CMS, no database, no API-gated content store. The
  owner's authoring workflow is Claude Code operating on the repo; the content layer
  must be fully legible and writable by an agent. Rationale: this mirrors the owner's
  established workflow (ideas repo, research-notes repo, BMAD artifacts) and
  guarantees portability and zero lock-in.
- **AP-3 — URLs are a permanent API.** Once published, a URL never breaks. Entities
  that end (sunset products, superseded posts) keep their URL and change state; they
  never 404. Renames require redirects. Rationale: every external backlink, citation,
  and marketplace listing is an investment in a URL; breaking one destroys accumulated
  SEO and trust.
- **AP-4 — Hub, not mirror.** The site stores identity, relationships, curation, and
  canonical long-form. It links to — never replicates — content whose canonical home
  is elsewhere (code on GitHub, datasets on HF, JP articles on Zenn). Rationale:
  mirrors rot; links with structured metadata don't.
- **AP-5 — One owned funnel everywhere.** Every page carries the newsletter capture
  (or, where conversion-critical, a page-specific CTA that also feeds the list).
  The email list is shared across the entire portfolio — research and products.
  Rationale: the list is the single compounding channel; dead products' signups seed
  the next launch.
- **AP-6 — Canonical-or-pointer, never duplicate.** Every piece of writing has exactly
  one canonical home. English long-form: this site (syndicated copies carry
  `rel=canonical` here). Japanese articles: Zenn (this site holds a pointer record).
  Rationale: split canonicality splits SEO and confuses provenance.
- **AP-7 — Sections are views over the registry, not silos.** "Projects,"
  "Benchmarks," "OSS," "Products," "Publications," "Writing" are typed/filtered views
  of the unified content registry, related by explicit links (a benchmark is a project
  of type `benchmark`; a paper links to its project; an article links to both).
  Rationale: the integration *is* the product — a visitor landing on any entity can
  traverse to everything related.
- **AP-8 — Static-first, no server state.** The site must be fully servable as static
  files. Dynamic needs (email capture, analytics) use external services via embed or
  link. Content pages must be readable with JavaScript disabled. Rationale: longevity,
  performance, free hosting, and zero operational load on a solo owner.
- **AP-9 — Extension by addition.** New content types, new sections, and new entity
  instances are added by adding files (a record, a schema, a view) — never by
  redesigning existing structure. The phase roadmap (§10) must be achievable without
  breaking changes to earlier phases. Rationale: the site must grow for years at
  near-zero marginal structural cost.
- **AP-10 — Evidence-gated content.** The site publishes only content that requires
  the owner's evidence (run logs, benchmarks, architecture scars, measured results) or
  records the owner's actual artifacts. No generic tutorial/tips content. Rationale:
  the content strategy's core finding — anything writable from documentation alone is
  already crowded; differentiation comes from work already done.
- **AP-11 — Bilingual identity, English-primary structure.** Site chrome and canonical
  structure are English. Japanese is a first-class *content attribute* (language-tagged
  records, JP writing surfaced in the unified writing index), not a parallel site
  mirror. Rationale: full i18n doubles maintenance for a solo owner; the JP audience is
  served by Zenn plus a lightweight JP landing surface (§10 Phase 4, optional).
- **AP-12 — Fast validation surface.** The revenue track's operating cadence requires
  standing up a product validation landing page in under 30 minutes of content work
  (one record file). The product template must support a pre-launch "validating" state
  with a signup CTA. Rationale: the ½-day validation gate is the highest-ROI step in
  the product workflow; the site is its instrument.

---

## 6. Content architecture

### 6.1 Content type registry

| Type | Cardinality | Canonical here? | Lifecycle states |
|---|---|---|---|
| `profile` | singleton | yes | — |
| `project` | many | yes (record); artifacts external | `active`, `maintained`, `archived` |
| `product` | many | yes (landing page) | `validating`, `live`, `sunset` |
| `publication` | many | no (arXiv/venue canonical; record here) | `preprint`, `published`, `superseded` |
| `article` | many | `canonical` (hosted here) or `external` (pointer) | `published`, `updated`, `deprecated` |
| `newsletter-issue` | many | optional archive (Phase 3) | `sent` |
| `identity-link` | few | no (pointers: GitHub, HF, Zenn, X, LinkedIn, Bluesky, email) | — |

Notes:
- **Benchmarks are not a separate type.** A benchmark is a `project` with
  `kind: benchmark` plus benchmark-specific fields (§6.2). They get a dedicated
  filtered view (§7) because they are strategically central ("release a benchmark,
  not just a method"), but one registry keeps relationships simple. The same applies
  to OSS libraries (`kind: library`) and plugins (`kind: plugin`).
- **Products are a separate type from projects**, despite surface similarity, because
  their lifecycle (validation gates, kill criteria, sunset), their page shape
  (conversion landing page), and their audience (P3, arriving with a pain, not
  curiosity) are categorically different. A research project that grows a commercial
  expression gets a linked `product` record (e.g., a hosted-API product built on an
  OSS library), keeping both lifecycles honest.

### 6.2 Record schemas

Frontmatter schemas below are normative: **required** fields must fail the build when
missing or malformed (§13, AC-4). Field names are binding; implementers may add
derived/internal fields but not repurpose these.

**`project`**

```yaml
slug: quantscenariobench          # required, kebab-case, permanent
title: QuantScenarioBench         # required
kind: benchmark                   # required: library | benchmark | plugin | tool | system
status: active                    # required: active | maintained | archived
summary: >                        # required, ≤ 240 chars, plain text (card/SEO description)
  A JAX-native benchmark ecosystem for quantitative finance…
started: 2026-01                  # required, YYYY-MM
links:                            # required, ≥ 1; label + href; ordered by importance
  - { label: GitHub, href: https://github.com/tim-nish/QuantScenarioBench }
  - { label: Live leaderboard, href: https://huggingface.co/spaces/… }
  - { label: Datasets, href: https://huggingface.co/QuantScenarioBench }
featured: true                    # optional, default false; drives home-page curation
topics: [quant-finance, jax, evaluation]   # optional, kebab-case tags
related: { publications: [], articles: [], products: [] }  # optional, slugs
citation: |                       # optional; BibTeX block, rendered copyable
  @misc{…}
# body (markdown, optional): the project's story — motivation, design, results.
# The body is owner-curated narrative, NOT a README mirror (AP-4).
```

Benchmark-kind projects should additionally populate `links` with leaderboard and
dataset entries and are strongly expected to carry `citation`.

**`product`**

```yaml
slug: arxiv-frame-watcher
title: <product name>             # required
status: validating                # required: validating | live | sunset
pain: >                           # required — the searched-for pain, phrased as the
  Get a weekly, ranked arXiv digest…   # user would search/complain (this is the SEO/H1 driver)
summary: >                        # required, ≤ 240 chars
platforms: [web]                  # required: e.g. claude-code-plugin | chrome-extension |
                                  # vscode-extension | obsidian-plugin | web | api
cta:                              # required — the single primary conversion action
  kind: signup | marketplace | purchase | contact
  href: <url or #newsletter>
  label: <button text>
pricing: <free | freemium | paid | tbd>   # required
launched: 2026-08                 # optional, YYYY-MM (absent while validating)
sunset:                           # required when status = sunset
  date: 2027-02
  note: >                         # honest one-paragraph retirement note
  successor: <slug or url>        # optional
related: { projects: [], articles: [] }
languages: [en]                   # marketing languages available: en, ja
# body: landing-page content — problem, how it works, proof/demo, FAQ.
```

**`publication`**

```yaml
slug: 2026-sig-transformers      # required, permanent
title: <paper title>              # required
authors: [Tomoya Imanishi, …]     # required, ordered
venue: arXiv                      # required: arXiv | <workshop/conf/journal name> | tech report
year: 2026                        # required
status: preprint                  # required: preprint | published | superseded
links:                            # required — MUST include both paper and code when code exists
  - { label: arXiv, href: … }     # (paper+repo pairing is a strategic invariant)
  - { label: Code, href: … }
  - { label: Hugging Face, href: … }   # optional
citation: |                       # required; BibTeX
related: { projects: [], articles: [] }
# body (optional): abstract or a short plain-language summary.
```

**`article`** (one schema, two modes)

```yaml
slug: kagamios-dogfooding-lessons # required, permanent
title: <title>                    # required
date: 2026-07-20                  # required, publication date
mode: canonical                   # required: canonical (full body hosted here)
                                  #        | external (pointer record)
language: en                      # required: en | ja
summary: >                        # required, ≤ 240 chars
external:                         # required when mode = external
  href: https://zenn.dev/…        # canonical location
  platform: zenn                  # zenn | qiita | devto | x | other
syndication:                      # optional when mode = canonical: copies elsewhere
  - { platform: devto, href: … }  # those copies must rel=canonical to this page
topics: [agents, evaluation]
related: { projects: [], publications: [], products: [] }
updated: 2026-08-01               # optional
# body: required for canonical mode; forbidden for external mode (AP-6).
```

**`profile`** (singleton)

```yaml
name: Tomoya Imanishi
positioning: >                    # one sentence, the identity statement
  Building agentic AI systems that accelerate scientific research.
bio: >                            # 2–3 paragraph markdown bio (current App.tsx profile is the seed)
now: >                            # 1–2 sentences on current focus; expected to change often
focus_areas: [agentic AI systems, LLMs, evaluation & benchmark engineering,
              signature methods for sequence modeling]
identity_links:                   # ordered; the canonical set of external identities
  - { label: GitHub, href: https://github.com/tim-nish }
  - { label: Hugging Face, href: … }
  - { label: Zenn, href: … }
  - { label: X, href: … }
  - { label: LinkedIn, href: https://www.linkedin.com/in/nowwest/ }
  - { label: Email, href: mailto:tomoya.imanishi.ti@gmail.com }
languages_note: >                 # short EN+JP line signposting bilingual work
```

**`newsletter-issue`** (Phase 3): `slug`, `number`, `date`, `subject`, `summary`,
optional archived body or link to ESP-hosted archive.

### 6.3 Relationship rules

- All `related.*` references are by slug and must resolve at build time (broken
  references fail the build).
- Relationships render bidirectionally: if publication P lists project J, project J's
  page shows P without J's record needing a reciprocal entry. (Single source of truth
  per edge; the build derives the inverse.)
- Topic tags are shared across all types and may power future topic pages (Phase 4);
  in earlier phases they are metadata only.

### 6.4 Lifecycle semantics

- **Project `archived`:** page remains, banner states archived status and date, record
  drops from featured/home surfaces but stays in the projects index (visually
  de-emphasized or under an "Archive" subsection).
- **Product `sunset`:** the strategy's "sunset to a static page" — the landing page
  URL survives, conversion CTA is replaced by (a) the sunset note, (b) optional
  successor pointer, (c) the newsletter capture ("hear about what I build next").
  Sunset products move to a collapsed "Retired" section of the products index. This is
  a designed, first-class state — a kill decision is a scheduled event, not a failure.
- **Publication `superseded`:** page remains with pointer to the superseding record.
- **Article `deprecated`:** page remains with a banner; use for content invalidated by
  time (e.g., platform-API articles).

---

## 7. Information architecture

### 7.1 Site map & URL taxonomy

All URLs are lowercase kebab-case, rooted at the custom domain (`base: /`), and
subject to AP-3 (permanent). Trailing-slash policy: consistent site-wide (implementer
picks one and enforces it with redirects).

```
/                          Home (hub)
/projects/                 Index: all projects, grouped/filterable by kind & status
/projects/<slug>/          Project detail (benchmarks, libraries, plugins, systems)
/benchmarks/               Curated view: projects where kind=benchmark
/products/                 Index: live products; validating optionally unlisted; retired collapsed
/products/<slug>/          Product landing page (all lifecycle states)
/publications/             Index: reverse-chronological, grouped by year
/publications/<slug>/      Publication record (abstract, links, BibTeX)
/writing/                  Unified writing index: canonical + external, EN + JA
/writing/<slug>/           Canonical article page (external-mode records do NOT get
                           a detail page; the index links straight out)
/newsletter/               Newsletter: pitch + signup + (Phase 3) issue archive
/about/                    Extended bio, focus areas, identity links, contact
/feed.xml                  RSS/Atom: canonical articles (+ optionally new projects/publications)
/sitemap.xml               All indexable pages
/404                       Custom not-found page: identity line + links to main indexes
```

Reserved for later phases (must not be squatted by other uses): `/ja/` (JP landing
surface), `/topics/<tag>/` (topic pages), `/compare/…` or per-pain SEO pages under
`/products/` (programmatic SEO).

**Redirect requirement:** the repo must contain a declarative redirect map (source →
destination) honored by the deployment, so renames never break URLs (AP-3).

### 7.2 Navigation model

- **Global header (all pages):** owner's name/wordmark → home; primary nav:
  `Projects · Publications · Writing · Products · About`. (Benchmarks and Newsletter
  are reachable via home and footer; keep primary nav ≤ 5 items.)
- **Global footer (all pages):** newsletter capture block (AP-5), identity links,
  language note (EN/JP + Zenn pointer), copyright, RSS link.
- **Entity pages** end with: related-entity links (§6.3) then the standard CTA block
  (newsletter + follow links) — this is the site-side implementation of "every article
  ends with the same pointer."
- **Product landing pages** (status `validating` or `live`) use reduced chrome: the
  header collapses to wordmark-only (no full nav) so the page reads as a standalone
  landing page for J2 arrivals; footer retains capture + identity. This is a
  deliberate exception to global nav, per AP-12.

### 7.3 Page-level specifications

Each page lists its content blocks **in order**. Blocks marked (opt) render only when
data exists; empty sections never render as empty shells.

**Home `/`** — the hub; must communicate identity in one screen (J3).
1. Hero: name; `profile.positioning`; identity links (compact icon/text row).
2. Now (opt): `profile.now`, one line, visually secondary.
3. Featured work: up to 3 records with `featured: true` (any of project /
   product / publication), curated order; each as a card: title, one-line summary,
   primary link.
4. Recent writing: up to 5 most-recent `article` records (canonical AND external,
   mixed), each: title, date, language badge (EN/JA), platform badge for external.
   Links go to canonical location (on-site or external respectively).
5. Sections directory: one-line entries for Projects, Benchmarks, Publications,
   Products, Newsletter — each with a count or micro-description, linking to its index.
6. Newsletter capture (primary placement, above footer): one-sentence pitch + form.
7. Footer (global).

**Projects index `/projects/`**
1. Intro line (from profile focus areas).
2. Active/maintained projects as cards, ordered: featured first, then by `started`
   descending. Card = title, kind label, summary, links row.
3. Archive section (opt, collapsed or visually secondary): archived projects.

**Project detail `/projects/<slug>/`**
1. Title, kind + status line, started date.
2. Links row (ordered as in record) — the primary action zone, above the fold.
3. Body (opt): the curated narrative.
4. Citation block (opt): copyable BibTeX.
5. Related entities (opt): publications, articles, products.
6. Standard CTA block.

**Benchmarks view `/benchmarks/`**
1. One-paragraph stance: why benchmarks (evaluation engineering as a focus area).
2. Benchmark projects as rich cards: title, summary, leaderboard link emphasized,
   dataset links, citation availability indicator. Links into `/projects/<slug>/`.

**Products index `/products/`**
1. One-paragraph framing: small, focused tools; built for researchers unless stated.
2. Live products: cards with title, pain-derived tagline, platform badges, CTA link.
3. Validating products (opt): listed only if `unlisted: false` (record-level opt-out
   for stealth validation; default listed).
4. Retired (opt, collapsed): sunset products with dates — kept public deliberately;
   transparency is part of the trust story.

**Product landing `/products/<slug>/`** (reduced chrome, §7.2)
1. H1 derived from `pain` (the searched phrase), subhead from `summary`.
2. Primary CTA (from `cta`) — above the fold.
3. Body: problem → how it works → proof (demo/screenshot/quote) → FAQ (structure
   guided by body content; template must accommodate all four).
4. Platform badges + secondary links (marketplace listing, docs, repo if open).
5. `sunset` state: replaces blocks 2–4 per §6.4.
6. Footer capture, reworded for context ("get notified about what I build next").

**Publications index `/publications/`** — grouped by year, newest first; each entry:
title, authors (owner highlighted), venue + year, links row, status badge for
preprint/superseded. Entry links to detail page.

**Publication detail `/publications/<slug>/`** — full record: title, authors, venue,
links (paper + code emphasized, as a pair), abstract/summary body, BibTeX block,
related entities, standard CTA block.

**Writing index `/writing/`**
1. One-line editorial stance (AP-10, phrased for readers: writing grounded in built
   systems and measured results).
2. Unified reverse-chronological list, canonical + external mixed: title, date,
   summary, language badge, platform badge (external), topic tags. External entries
   link directly out (new-tab acceptable); canonical entries link on-site.
3. Filter affordance by language (EN/JA) and by canonical/external — simple,
   JS-optional (e.g., separate anchor views acceptable).

**Canonical article `/writing/<slug>/`** — title, date (+updated), body, topic tags,
syndication note (opt: "also on dev.to"), related entities, standard CTA block.
Deprecated state shows banner per §6.4.

**Newsletter `/newsletter/`**
1. Pitch: what subscribers get, expected cadence (honest: low-frequency), sample
   topics drawn from focus areas.
2. Signup form (ESP embed or link — §8.1).
3. Issue archive (Phase 3, opt).

**About `/about/`** — full bio, focus areas, the two-track framing (research + tools)
in owner's voice, identity links, contact (email primary), languages note.

---

## 8. Cross-cutting requirements

### 8.1 Conversion architecture (newsletter/email)

- Exactly one email list across the whole portfolio (AP-5). The ESP is external
  (§12 D-3 for default); the site integrates via static-safe embed or link-out form.
- Capture appears: global footer (all pages), home primary placement, `/newsletter/`,
  product sunset pages, and the standard end-of-entity CTA block.
- No self-hosted form handling, no email addresses stored in this repo or its
  deployment (AP-8).

### 8.2 SEO & metadata

- Every page: unique `<title>` (pattern: `<Page/Entity> — <Owner name>`; home is
  `<Owner name> — <positioning fragment>`), meta description from record `summary`,
  canonical URL tag, Open Graph + Twitter card tags.
- Structured data (JSON-LD): `Person` on home/about; `Article` on canonical articles;
  `SoftwareApplication` on product pages; `Dataset` (or `Dataset`-bearing
  `CreativeWork`) on benchmark projects with dataset links; `ScholarlyArticle` on
  publication pages.
- Syndicated copies elsewhere must point `rel=canonical` here (enforced editorially;
  the article record's `syndication` field is the checklist).
- `sitemap.xml` auto-generated from the registry; `robots.txt` permissive.
- Product landing pages target their `pain` phrase in title/H1/description — the page
  *is* the SEO instrument for that pain (J2).

### 8.3 Feeds

- `/feed.xml`: valid RSS or Atom of canonical articles at minimum; full-text or
  summary+link at implementer's discretion. External-mode articles may be included as
  link-only items (recommended: yes, so followers see JP output too).

### 8.4 Language policy

- Chrome/UI: English. Content records carry `language`; JA records display with a
  language badge everywhere they appear (AP-11).
- The home hero or footer carries a one-line Japanese note pointing JP readers to the
  Zenn profile (from `profile.languages_note`).
- No machine-translated mirrors. `/ja/` is a Phase 4 option (§10), scoped as a single
  landing page, not a site mirror.

### 8.5 Performance, accessibility, longevity budgets

- Content pages readable with JavaScript disabled (AP-8); JS is progressive
  enhancement only (filters, copy-BibTeX buttons).
- Semantic HTML landmarks; all interactive elements keyboard-accessible; images carry
  alt text (record bodies must supply it); color contrast meeting WCAG AA.
- Total transfer for a typical content page (excluding embedded demo media) under
  ~200 KB; no external font/CDN dependencies required for readability.
- No content or navigation depends on a third-party service being alive, except the
  ESP form itself (which degrades to a link).

### 8.6 Analytics

- Privacy-friendly, cookieless page analytics only (§12 D-4 default); no consent
  banner should be necessary. Metrics that matter (per strategy): organic search
  impressions/clicks, newsletter signups, referral sources per entity page.
  No per-user tracking.

---

## 9. Content operations & governance

- **Authoring workflow:** owner + Claude Code edit records in git; publishing is a
  merge to the deploy branch. The repo should carry a short `docs/content-guide.md`
  (implementer produces it) documenting each schema with a copyable template — this is
  the agent-facing API of the content layer.
- **Validation:** schema violations, broken internal references, and duplicate slugs
  fail the build (AC-4). This is the substitute for a CMS's guardrails.
- **Editorial bar (AP-10), as a publishable checklist:** does this piece require my
  evidence (logs, benchmarks, scars, measurements)? Is its canonical home correct per
  §3? Does it link its related entities? Does it end at the funnel?
- **Cadence expectations (anti-treadmill):** no commitment to frequency anywhere in
  site copy. Writing index and newsletter pitch must read honestly at 0–1 posts/month.
  The site's freshness signal is the registry (new projects/releases), not blog
  cadence.
- **Content priority for seeding writing (from the strategy, in order):**
  (1) engineering lessons from building real multi-agent systems (architecture
  decisions, failure findings, token economics); (2) evaluation & benchmark
  engineering (how QuantScenarioBench is built, how to know an agent improved);
  (3) research surveys (e.g., signature methods) as low-cadence reputation anchors.
  Generic tool tutorials are out of scope per AP-10.

---

## 10. Evolution roadmap

Phases are strictly additive (AP-9). Each phase is shippable and leaves the site
complete at its scope.

- **Phase 1 — Hub (supersedes current single-page site):** content registry +
  schemas + validation; home, projects (+detail), benchmarks view, publications
  (+detail), about, newsletter page, global capture, feeds, sitemap, redirects,
  404. Seed content: §Appendix A.
- **Phase 2 — Writing:** article type live (canonical + external modes), writing
  index, canonical article template, syndication conventions, external records for
  existing Zenn output.
- **Phase 3 — Products:** product type live: landing template with reduced chrome,
  validating/live/sunset states, products index, first validation landing page
  exercised end-to-end (AP-12 timing test). Optional newsletter issue archive.
- **Phase 4 — Compounding SEO (evidence-driven, only when warranted):** topic pages
  from tags; per-pain/comparison SEO pages; `/ja/` landing page. Each sub-item gets
  its own go/no-go based on search data — none is a default commitment.

Explicit trigger discipline: Phase 4 items exist in this spec so their URL space is
reserved and their addition is non-breaking — not as a to-do list.

---

## 11. Non-goals

Permanently out of scope unless this spec is revised:

- Comments, reactions, or any user-generated content.
- Accounts, authentication, or personalization.
- Self-hosted search (browser find + good indexes suffice at this scale; revisit only
  if the registry exceeds ~200 entities).
- Full Japanese site mirror or machine translation.
- Hosting canonical Japanese articles (Zenn is canonical for JP; AP-6).
- Mirroring READMEs, paper PDFs, or datasets (AP-4).
- A CMS, database, or any content store outside the git repo (AP-2).
- Frequent visual redesigns; visual identity changes must not alter IA or URLs (AP-3).
- E-commerce/checkout on the site itself — payment happens on marketplaces or the
  product's own service; this site's product pages convert to those destinations.

---

## 12. Deferred decisions with binding defaults

Implementation must not block on these; use the default until the owner overrides.

| ID | Decision | Default (binding until overridden) |
|---|---|---|
| D-2 | Custom domain string | `https://tim-nish.dev` (Vite `base: "/"`; already configured). |
| D-3 | Email service provider | Any ESP with a static-embed or hosted-form signup and `rel=canonical`-friendly archive (e.g., Buttondown-class). Requirement, not brand: no backend, exportable list, single list with tags per source. |
| D-4 | Analytics provider | Any cookieless, privacy-first pageview service; may also be deferred entirely at launch (Search Console alone is acceptable for Phase 1). |
| D-5 | Newsletter cadence & first issue timing | No cadence commitment in copy (§9); archive deferred to Phase 3. |
| D-6 | Talks/speaking as a content type | Not a type; record talks as `publication` with `venue: <event>` until volume justifies a dedicated type (AP-9 makes the later split cheap). |
| D-7 | Hugging Face / Zenn / X profile URLs in `profile.identity_links` | Implementer seeds GitHub, LinkedIn, Email (known today) and leaves commented placeholders for the rest; owner fills in. |

---

## 13. Acceptance criteria

An implementation of any phase is complete when:

- **AC-1** Every §7.3 page in scope for the phase exists with its blocks in the
  specified order, and empty optional blocks render nothing.
- **AC-2** Adding a new entity of an in-scope type requires exactly one new content
  file (plus assets it references) and no code changes for standard rendering.
- **AC-3** All URLs match §7.1; the redirect map mechanism works (verified with a test
  redirect); the 404 page renders per spec.
- **AC-4** The build fails on: missing required frontmatter, unknown enum values,
  unresolvable `related` slugs, duplicate slugs, or an external-mode article with a
  body.
- **AC-5** Every page has unique title, description, canonical tag, OG tags; JSON-LD
  present per §8.2 on the applicable page types; sitemap and feed validate.
- **AC-6** Newsletter capture is present at every location listed in §8.1 and the
  form (or link-out) functions against the chosen ESP.
- **AC-7** Content pages render readable with JavaScript disabled.
- **AC-8** Lifecycle states render correctly: an `archived` project, `sunset` product,
  `superseded` publication, and `deprecated` article each display their §6.4 behavior
  (exercised with fixture records if no real ones exist yet).
- **AC-9** J1–J4 journeys (§4.2) are walkable: from any entity page, newsletter signup
  is reachable in ≤ 2 clicks; a product landing page converts without site context.
- **AC-10 (Phase 3)** A new `validating` product landing page can be published by
  creating one record file, measured end-to-end in ≤ 30 minutes of content work.

---

## Appendix A — Seed content inventory (Phase 1)

Migrated/created from the current site and known artifacts:

- **`profile`**: name, positioning ("Building agentic AI systems that accelerate
  scientific research."), bio seeded from current App.tsx profile text, identity
  links (GitHub `tim-nish`, LinkedIn `nowwest`, email; placeholders per D-7).
- **`project: kagamios`** — kind `plugin`/`system` (implementer: use `system`), status
  `active`, summary from current card ("open-source Claude Code plugin for
  AI-assisted research planning, literature synthesis, and candidate generation"),
  link: GitHub.
- **`project: quantscenariobench`** — kind `benchmark`, status `active`, `featured:
  true`, summary and three links (GitHub, HF leaderboard, HF datasets) from current
  card; add `citation` when available.
- **Future records anticipated by the source material** (do NOT create yet; listed so
  the IA is checked against them): a signature-methods benchmark/reference-implementation
  project (`sig-bench`-shaped, kind `benchmark`); publications pairing arXiv preprints
  with repos; products from the validated backlog (arXiv frame-watcher, PDF
  results-table extractor, rebuttal assistant, arXiv-overlay extension,
  signature-features API); JP survey articles (external, Zenn); KagamiOS
  engineering-lessons articles (canonical, EN) with JP counterparts on Zenn.

## Appendix B — Traceability to source discussions

| Spec element | Source rationale |
|---|---|
| Hub-not-blog vision (§2), cadence honesty (§9) | response_2 Q4: site = portfolio + canonical hub; don't commit to continuous publishing |
| Division of labor table (§3) | response_2 Q4 (Zenn repo-sync, dev.to syndication); response_1 Part 3 (publication channels) |
| Email list everywhere (AP-5, §8.1) | response_1 §1.5/Part 3: list shared across portfolio, only owned compounding channel |
| Products as validation instruments; sunset as first-class state (AP-12, §6.4) | response_1 §1.2/§1.4: kill criteria, sunset to a static page, maintenance containment |
| Pain-phrase-driven product landing pages (§7.3, §8.2) | response_1 distribution: SEO on own domain targeting searched pain |
| Benchmarks elevated to a curated view (§7.1) | response_1 Part 2/3: benchmark-shaped OSS is the highest-leverage solo research move |
| Paper+code pairing required in publication links (§6.2) | response_1 Part 3 item 1: arXiv + repo shipped same day, always paired |
| Evidence-gated content (AP-10, §9) | response_2 Q5: publish what requires your evidence; generic content is crowded |
| Plain-markdown-in-git content layer (AP-2) | response_2 Q6: Claude Code's native substrate is files in a repo; avoid API-gated stores |
| Bilingual policy (AP-11, §8.4) | response_1 (JP wedge) + response_2 Q4 (Zenn canonical for JP) |
