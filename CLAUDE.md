# research-portfolio

Personal research portfolio site. React 19 + TypeScript + Vite 6, statically generated
from markdown+frontmatter content records — no client-side app, no server. Test
framework: Vitest.

## Development environment

Development happens inside the dev container (`.devcontainer/`): Node 22, GitHub CLI, and the Claude Code CLI are installed there (`post-create.sh` handles Claude Code and `npm ci`). The container has host Docker access via docker-outside-of-docker, so the commands below all work from inside it.

## Commands

- `npm run dev` — Vite dev server at http://localhost:5173/ (port 5173 is forwarded); serves a static placeholder only — there's no client-rendered app to preview live. Use `npm run build && npm run preview` to see the actual generated site.
- `npm run validate:content` — validates every record under `content/` against its schema, standalone
- `npm run build` — validates content, type-checks (`tsc -b`), builds the CSS bundle (`vite build`), then statically generates every page (`scripts/generate-static.tsx`) into `dist/`
- `npm run preview` — serve the production build locally
- `npm test` — run the Vitest suite
- `docker compose up --build` — production build served by nginx at http://localhost:8080/, mirroring the GitHub Pages layout (including custom 404 handling, via `nginx.conf`)

## Architecture

See `docs/architecture.md` for the full design; in brief:

- `content/` — markdown + YAML frontmatter records (source of truth): `profile.md`, `projects/`, `products/`, `publications/`, `articles/`, `newsletter-issues/`, `redirects.yml`
- `src/content/` — zod schemas (`schema/`) + the build-time loader/validator (`load.ts`) that produces the typed, in-memory content registry
- `src/pages/` — one component per route, consumed only by `scripts/generate-static.tsx` (rendered via `react-dom/server`, never hydrated client-side)
- `src/components/` — presentational components used by the page templates
- `src/layout/SiteLayout.tsx` — shared header/nav/footer
- `src/seo/`, `src/feed/`, `src/redirects/`, `src/routing/`, `src/newsletter/` — cross-cutting concerns (metadata/JSON-LD/sitemap, RSS/Atom feed, redirect stubs, trailing-slash policy, the shared newsletter-capture component)
- `scripts/validate-content.ts`, `scripts/generate-static.tsx` — the two build-time steps `npm run build` runs, in order
- `src/styles.css` — global styles; the only thing `vite build` actually bundles (a pure CSS entry — no JS ships to visitors beyond a couple of small inline progressive-enhancement scripts)

## Important notes

- `vite.config.ts` sets `base: "/"` because the site deploys to the custom domain `https://tim-nish.dev` (not a GitHub Pages subpath). Don't remove the base setting.
- Deployment is automatic: `.github/workflows/deploy.yml` builds and publishes to GitHub Pages on push to `main`.
- `npm run build` runs the TypeScript compiler first, so use it as the type-check step before committing.
- Adding a new content record of an already-supported type (e.g. another `project`) requires only a new file under `content/` — no code changes for standard rendering.
