import type { ReactNode } from "react";

interface SiteLayoutProps {
  children: ReactNode;
}

/**
 * Shared chrome for generated content pages. Intentionally minimal: only nav
 * links to routes that exist today (Home, Projects, About). Publications,
 * Writing, Products, and the newsletter capture block join the footer/nav as
 * their own stories (1.5-1.7) land, per NFR8 — this is additive, not a fixed
 * final nav.
 */
function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <>
      <header className="site-header">
        <a className="site-wordmark" href="/">
          Tomoya Imanishi
        </a>
        <nav aria-label="Primary">
          <a href="/projects/">Projects</a>
          <a href="/about/">About</a>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <p>
          <a href="https://github.com/tim-nish">GitHub</a>
          <span aria-hidden="true"> · </span>
          <a href="https://www.linkedin.com/in/nowwest/">LinkedIn</a>
          <span aria-hidden="true"> · </span>
          <a href="mailto:tomoya.imanishi.ti@gmail.com">Email</a>
        </p>
        <p className="site-footer-copyright">© {new Date().getFullYear()} Tomoya Imanishi</p>
      </footer>
    </>
  );
}

export default SiteLayout;
