/**
 * Build With Grok — accessibility + performance helpers.
 * Skip link, main landmark, lazy images. Dual-export for Node tests + browser.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.GROK_A11Y_PERF = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const MAIN_ID = "main-content";
  const SKIP_ID = "skip-to-content";

  /**
   * Whether an image should get loading="lazy".
   * Eager: first hero, anything already eager, or marked data-eager.
   */
  function shouldLazyLoad(img) {
    if (!img || typeof img !== "object") return false;
    if (img.getAttribute && img.getAttribute("data-eager") === "true") return false;
    if (img.loading === "eager") return false;
    if (img.closest && img.closest(".hub-hero-bg, [data-eager-images]")) return false;
    // decorative empty alt in hero already covered
    return true;
  }

  /**
   * Apply lazy/async decoding to content images. Pure DOM side effects when doc provided.
   * @returns {{ lazy: number, eager: number, total: number }}
   */
  function enhanceImages(doc) {
    if (!doc || !doc.querySelectorAll) return { lazy: 0, eager: 0, total: 0 };
    const imgs = [...doc.querySelectorAll("img")];
    let lazy = 0;
    let eager = 0;
    for (const img of imgs) {
      if (shouldLazyLoad(img)) {
        img.setAttribute("loading", "lazy");
        img.setAttribute("decoding", "async");
        lazy++;
      } else {
        if (!img.getAttribute("decoding")) img.setAttribute("decoding", "async");
        // Keep LCP hero eager
        if (!img.getAttribute("loading")) img.setAttribute("loading", "eager");
        eager++;
      }
      // Empty alt for decorative if missing and aria-hidden parent
      if (
        !img.hasAttribute("alt") &&
        img.closest &&
        img.closest("[aria-hidden='true']")
      ) {
        img.setAttribute("alt", "");
      }
    }
    return { lazy, eager, total: imgs.length };
  }

  /**
   * Ensure a single main landmark with stable id for skip target.
   */
  function ensureMainLandmark(doc) {
    if (!doc || !doc.querySelector) return null;
    let main =
      doc.getElementById(MAIN_ID) ||
      doc.querySelector("main#main-content") ||
      doc.querySelector("[data-main-content]");
    if (main) {
      if (!main.id) main.id = MAIN_ID;
      if (!main.getAttribute("role") && main.tagName !== "MAIN") {
        main.setAttribute("role", "main");
      }
      if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
      return main;
    }

    // Prefer existing content hosts
    const candidate =
      doc.querySelector("article.prose") ||
      doc.querySelector(".main-col") ||
      doc.querySelector(".hub-hero") ||
      doc.querySelector("body > section") ||
      doc.body;
    if (!candidate || candidate === doc.body) {
      // wrap is heavy; mark first section + rest as main via first content wrapper
      const wrap = doc.querySelector(".wrap") || doc.body;
      wrap.id = MAIN_ID;
      wrap.setAttribute("role", "main");
      wrap.setAttribute("tabindex", "-1");
      wrap.setAttribute("data-main-content", "");
      return wrap;
    }

    if (candidate.tagName === "ARTICLE" || candidate.classList.contains("main-col")) {
      candidate.id = MAIN_ID;
      if (candidate.tagName !== "MAIN") candidate.setAttribute("role", "main");
      candidate.setAttribute("tabindex", "-1");
      candidate.setAttribute("data-main-content", "");
      return candidate;
    }

    candidate.id = MAIN_ID;
    candidate.setAttribute("role", "main");
    candidate.setAttribute("tabindex", "-1");
    candidate.setAttribute("data-main-content", "");
    return candidate;
  }

  /**
   * Skip link as first focusable in body.
   */
  function ensureSkipLink(doc) {
    if (!doc || !doc.body) return null;
    let a = doc.getElementById(SKIP_ID);
    if (!a) {
      a = doc.createElement("a");
      a.setAttribute("id", SKIP_ID);
      a.id = SKIP_ID;
      a.setAttribute("class", "skip-link");
      if ("className" in a) a.className = "skip-link";
      a.setAttribute("href", `#${MAIN_ID}`);
      if ("href" in a || a.href !== undefined) {
        try {
          a.href = `#${MAIN_ID}`;
        } catch {
          /* mock DOM may only support setAttribute */
        }
      }
      a.textContent = "Skip to content";
      a.setAttribute("data-skip-link", "");
      doc.body.insertBefore(a, doc.body.firstChild);
    } else {
      a.setAttribute("href", `#${MAIN_ID}`);
      try {
        a.href = `#${MAIN_ID}`;
      } catch {
        /* ignore */
      }
    }
    return a;
  }

  /**
   * Mark print-only utility classes on chrome that should hide in print
   * (CSS also uses structural selectors; this is progressive).
   */
  function markPrintChrome(doc) {
    if (!doc || !doc.querySelectorAll) return 0;
    const selectors = [
      ".site-nav",
      "[data-topnav]",
      ".sidebar",
      "[data-sidebar]",
      ".nav-drawer",
      ".nav-overlay",
      ".back-top",
      "#scroll-progress",
      ".search-palette",
      ".search-open-btn",
      ".wt-sticky-spy",
      ".nav-toggle",
    ];
    let n = 0;
    for (const sel of selectors) {
      doc.querySelectorAll(sel).forEach((el) => {
        el.classList.add("no-print");
        n++;
      });
    }
    return n;
  }

  /**
   * Install all progressive enhancements once.
   */
  function installA11yPerf(opts) {
    const doc = (opts && opts.document) || (typeof document !== "undefined" ? document : null);
    if (!doc) return { ok: false };
    ensureMainLandmark(doc);
    ensureSkipLink(doc);
    const images = enhanceImages(doc);
    const printMarks = markPrintChrome(doc);
    doc.documentElement.classList.add("a11y-perf-ready");
    return { ok: true, images, printMarks, mainId: MAIN_ID };
  }

  return {
    MAIN_ID,
    SKIP_ID,
    shouldLazyLoad,
    enhanceImages,
    ensureMainLandmark,
    ensureSkipLink,
    markPrintChrome,
    installA11yPerf,
  };
});
