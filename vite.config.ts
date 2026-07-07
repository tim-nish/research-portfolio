import path from "node:path";
import { defineConfig } from "vite";

// No client-side app remains (Story 1.11 cutover): every page is prerendered by
// scripts/generate-static.tsx via react-dom/server, none of them hydrate. The only
// thing the production build needs from Vite is the hashed, cache-busted CSS asset
// that every generated page links to — so styles.css is the build's only entry,
// and no React/JSX bundle is produced at all.
export default defineConfig({
  base: "/",
  build: {
    manifest: true,
    rollupOptions: {
      input: path.resolve(__dirname, "src/styles.css"),
    },
  },
});
