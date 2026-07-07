import { NEWSLETTER_CAPTURE_ENABLED, NEWSLETTER_CONFIG } from "../newsletter/config";

export interface NewsletterCaptureProps {
  variant?: "footer" | "inline" | "page";
  heading?: string;
  pitch?: string;
}

/**
 * The single shared newsletter-capture implementation (spec §8.1, FR6) — reused by
 * the global footer, `/newsletter/`, and the standard end-of-entity CTA block on
 * project/publication detail pages. One component, several rendering contexts.
 */
function NewsletterCapture({ variant = "inline", heading, pitch }: NewsletterCaptureProps) {
  if (!NEWSLETTER_CAPTURE_ENABLED) {
    return null;
  }

  const { mode, embedSrc, fallbackHref, buttonLabel } = NEWSLETTER_CONFIG;

  return (
    <div className={`newsletter-capture newsletter-capture-${variant}`}>
      {heading && <p className="newsletter-capture-heading">{heading}</p>}
      {pitch && <p className="newsletter-capture-pitch">{pitch}</p>}

      {mode === "embed" && embedSrc ? (
        <div className="newsletter-embed-wrapper" data-embed-fallback-href={fallbackHref}>
          <iframe src={embedSrc} title="Newsletter signup" loading="lazy" />
          <noscript>
            <a className="newsletter-capture-link" href={fallbackHref}>
              {buttonLabel}
            </a>
          </noscript>
        </div>
      ) : (
        <a className="newsletter-capture-link" href={fallbackHref}>
          {buttonLabel}
        </a>
      )}
    </div>
  );
}

export default NewsletterCapture;
