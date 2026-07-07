import type { ReactNode } from "react";
import NewsletterCapture from "../components/NewsletterCapture";

interface SiteLayoutProps {
  children: ReactNode;
}

/**
 * Shared chrome for generated content pages. Primary nav now holds all 5
 * spec §7.2 items (Projects, Publications, Writing, Products, About).
 * Benchmarks and Newsletter are deliberately NOT primary-nav items per §7.2
 * ("reachable via home and footer; keep primary nav ≤ 5 items") — both are
 * linked from the footer instead. (Story 1.4 briefly put Benchmarks in the
 * primary nav; corrected in Story 1.7.) Note: `/products/<slug>/` pages use
 * ReducedChromeLayout instead of this component (spec §7.2's one exception).
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
          <a href="/publications/">Publications</a>
          <a href="/writing/">Writing</a>
          <a href="/products/">Products</a>
          <a href="/about/">About</a>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <NewsletterCapture
          variant="footer"
          heading="Get updates on new projects and benchmarks."
        />
        <p className="site-footer-links">
          <a href="/benchmarks/">Benchmarks</a>
          <span aria-hidden="true"> · </span>
          <a href="/newsletter/">Newsletter</a>
        </p>
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
