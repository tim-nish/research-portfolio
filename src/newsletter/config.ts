export type NewsletterMode = "embed" | "link";

export interface NewsletterConfig {
  mode: NewsletterMode;
  /** iframe URL for the ESP's hosted signup form. Required when `mode: "embed"`. */
  embedSrc?: string;
  /** Always present: the link-out target used in "link" mode, and the NFR6 degrade target in "embed" mode. */
  fallbackHref: string;
  buttonLabel: string;
}

/**
 * ESP provider selection is deferred (spec D-3) — this ships in "link" mode (a
 * direct link-out, one of the two spec-sanctioned shapes) until the owner picks a
 * provider. Switching to "embed" mode + a real `embedSrc` is then a config change
 * here only, not a rewrite of `NewsletterCapture` or any page that uses it.
 */
export const NEWSLETTER_CONFIG: NewsletterConfig = {
  mode: "link",
  fallbackHref: "mailto:tomoya.imanishi.ti@gmail.com?subject=Newsletter%20signup",
  buttonLabel: "Get updates by email",
};
