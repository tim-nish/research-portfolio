/**
 * Progressive-enhancement fallback for `mode: "embed"` (NFR6): if the ESP iframe
 * doesn't fire `load` before a timeout, or fires `error`, it's removed and replaced
 * with the plain link-out. Written as a single exported function (rather than
 * top-level script code) so it can run unmodified both under vitest+jsdom and,
 * serialized via `.toString()`, as the inline `<script>` on generated static pages —
 * the tested code is exactly the shipped code, nothing to keep in sync by hand.
 */
export function initNewsletterEmbedFallback(): void {
  var wrappers = document.querySelectorAll(".newsletter-embed-wrapper");

  wrappers.forEach(function (wrapper) {
    var iframe = wrapper.querySelector("iframe");
    var fallbackHref = wrapper.getAttribute("data-embed-fallback-href");
    if (!iframe || !fallbackHref) return;

    var loaded = false;

    var showFallback = function () {
      if (loaded || wrapper.querySelector(".newsletter-capture-fallback")) return;
      iframe!.remove();
      var link = document.createElement("a");
      link.href = fallbackHref!;
      link.className = "newsletter-capture-link newsletter-capture-fallback";
      link.textContent = "Subscribe by email";
      wrapper.appendChild(link);
    };

    iframe.addEventListener("load", function () {
      loaded = true;
    });
    iframe.addEventListener("error", showFallback);
    setTimeout(function () {
      if (!loaded) showFallback();
    }, 4000);
  });
}
