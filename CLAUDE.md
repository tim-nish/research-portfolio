# research-portfolio

Personal research portfolio site. React 19 + TypeScript + Vite 6. No test framework or linter is configured.

## Development environment

Development happens inside the dev container (`.devcontainer/`): Node 22, GitHub CLI, and the Claude Code CLI are installed there (`post-create.sh` handles Claude Code and `npm ci`). The container has host Docker access via docker-outside-of-docker, so the commands below all work from inside it.

## Commands

- `npm run dev` — Vite dev server at http://localhost:5173/ (port 5173 is forwarded)
- `npm run build` — type-check (`tsc -b`) then build to `dist/`
- `npm run preview` — serve the production build locally
- `docker compose up --build` — production build served by nginx at http://localhost:8080/, mirroring the GitHub Pages layout

## Architecture

- `src/main.tsx` — entry point
- `src/App.tsx` — page layout and project data
- `src/components/` — presentational components (e.g. `ProjectCard.tsx`)
- `src/styles.css` — global styles

## Important notes

- `vite.config.ts` sets `base: "/"` because the site deploys to the custom domain `https://tim-nish.dev` (not a GitHub Pages subpath). Don't remove the base setting.
- Deployment is automatic: `.github/workflows/deploy.yml` builds and publishes to GitHub Pages on push to `main`.
- `npm run build` runs the TypeScript compiler first, so use it as the type-check step before committing.
