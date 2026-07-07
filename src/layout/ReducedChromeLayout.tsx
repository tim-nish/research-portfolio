import type { ReactNode } from "react";
import NewsletterCapture from "../components/NewsletterCapture";

interface ReducedChromeLayoutProps {
  children: ReactNode;
}

/**
 * The one deliberate exception to global nav in the whole spec (§7.2): product
 * landing pages (`validating`/`live`) get a wordmark-only header, no primary nav,
 * so the page reads as a standalone landing surface for J2 arrivals. A separate
 * component from SiteLayout — not a conditional branch inside it — so this chrome
 * can never leak onto any other page type by accident.
 */
function ReducedChromeLayout({ children }: ReducedChromeLayoutProps) {
  return (
    <>
      <header className="site-header site-header-reduced">
        <a className="site-wordmark" href="/">
          Tomoya Imanishi
        </a>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <NewsletterCapture variant="footer" heading="Get notified about what I build next." />
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

export default ReducedChromeLayout;
