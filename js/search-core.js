/**
 * Build With Grok — pure client-side search (Phase 2).
 * Index from curriculum metadata; dual-export for Node unit tests + browser.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.GROK_SEARCH_CORE = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  /**
   * Tokenize query/text into lowercase alphanumeric tokens.
   * Keeps short tokens like "mcp" and multi-part ids.
   */
  function tokenize(text) {
    if (!text) return [];
    return String(text)
      .toLowerCase()
      .split(/[^a-z0-9+#./_-]+/)
      .map((t) => t.replace(/^[\s./_-]+|[\s./_-]+$/g, ""))
      .filter((t) => t.length > 0);
  }

  function normalizeQuery(q) {
    return String(q || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  /**
   * Build a searchable index entry from a curriculum page object.
   * @param {{ id: string, href: string, title: string, blurb?: string, keywords?: string[]|string, track?: { id?: string, name?: string } }} page
   */
  function pageToDoc(page) {
    const keywords = Array.isArray(page.keywords)
      ? page.keywords
      : typeof page.keywords === "string"
        ? page.keywords.split(/[\s,]+/).filter(Boolean)
        : [];
    const trackName = (page.track && page.track.name) || page.trackName || "";
    const trackId = (page.track && page.track.id) || page.trackId || "";
    const fields = {
      id: String(page.id || ""),
      href: String(page.href || ""),
      title: String(page.title || ""),
      blurb: String(page.blurb || ""),
      trackName: String(trackName),
      trackId: String(trackId),
      keywords: keywords.map(String),
    };
    const haystack = [
      fields.id,
      fields.title,
      fields.blurb,
      fields.trackName,
      fields.trackId,
      ...fields.keywords,
    ]
      .join(" ")
      .toLowerCase();
    const titleTokens = new Set(tokenize(fields.title));
    const keywordTokens = new Set(tokenize(fields.keywords.join(" ")));
    const blurbTokens = new Set(tokenize(fields.blurb));
    const idTokens = new Set(tokenize(fields.id));
    return {
      ...fields,
      haystack,
      titleTokens,
      keywordTokens,
      blurbTokens,
      idTokens,
    };
  }

  /**
   * @param {Array} pages — curriculum flat pages or raw page objects
   * @returns {Array} index docs
   */
  function buildIndex(pages) {
    if (!Array.isArray(pages)) return [];
    return pages.map(pageToDoc);
  }

  /**
   * Build index from GROK_ACADEMY-like object with tracks / flatPages().
   */
  function buildIndexFromAcademy(academy) {
    if (!academy) return [];
    if (typeof academy.flatPages === "function") {
      return buildIndex(academy.flatPages());
    }
    if (Array.isArray(academy.tracks)) {
      const pages = [];
      for (const track of academy.tracks) {
        for (const p of track.pages || []) {
          pages.push({ ...p, track });
        }
      }
      return buildIndex(pages);
    }
    return [];
  }

  /**
   * Score one doc against a normalized query string and its tokens.
   * Higher is better.
   */
  function scoreDoc(doc, qNorm, qTokens) {
    if (!qNorm) return 0;
    let score = 0;

    // Full-phrase / substring boosts
    if (doc.id === qNorm) score += 200;
    if (doc.title.toLowerCase() === qNorm) score += 180;
    if (doc.id.includes(qNorm)) score += 80;
    if (doc.title.toLowerCase().includes(qNorm)) score += 70;
    if (doc.keywords.some((k) => k.toLowerCase() === qNorm)) score += 100;
    if (doc.keywords.some((k) => k.toLowerCase().includes(qNorm))) score += 60;
    if (doc.blurb.toLowerCase().includes(qNorm)) score += 35;
    if (doc.haystack.includes(qNorm)) score += 15;

    for (const tok of qTokens) {
      if (!tok) continue;
      if (doc.idTokens.has(tok)) score += 50;
      if (doc.titleTokens.has(tok)) score += 40;
      if (doc.keywordTokens.has(tok)) score += 45;
      if (doc.blurbTokens.has(tok)) score += 18;
      // prefix match on title tokens
      for (const t of doc.titleTokens) {
        if (t.startsWith(tok) && t !== tok) score += 12;
      }
      for (const t of doc.keywordTokens) {
        if (t.startsWith(tok) && t !== tok) score += 10;
      }
      if (doc.haystack.includes(tok)) score += 5;
    }

    return score;
  }

  /**
   * Search the index. Empty query → []; nonsense → [].
   * @param {Array} index
   * @param {string} query
   * @param {{ limit?: number }} [opts]
   * @returns {Array<{ id, href, title, blurb, trackName, score }>}
   */
  function search(index, query, opts) {
    const limit = (opts && opts.limit) || 12;
    const qNorm = normalizeQuery(query);
    if (!qNorm) return [];
    if (!Array.isArray(index) || index.length === 0) return [];

    const qTokens = tokenize(qNorm);
    const scored = [];
    for (const doc of index) {
      const score = scoreDoc(doc, qNorm, qTokens);
      if (score > 0) {
        scored.push({
          id: doc.id,
          href: doc.href,
          title: doc.title,
          blurb: doc.blurb,
          trackName: doc.trackName,
          score,
        });
      }
    }
    scored.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
    return scored.slice(0, limit);
  }

  /**
   * Resolve lesson href relative to hub (.) vs pages/ depth.
   * @param {string} href — curriculum page href e.g. "14-mcp.html"
   * @param {string} [base] — "." hub or ".." pages
   */
  function resolvePageHref(href, base) {
    const b = base === ".." || base === "pages" ? ".." : ".";
    if (b === ".") return `pages/${href}`;
    return href;
  }

  /**
   * Detect base from pathname (browser) or explicit opt.
   */
  function detectBase(pathname) {
    const path = String(pathname || "").replace(/\\/g, "/");
    return path.includes("/pages/") ? ".." : ".";
  }

  /** Install once; safe to call after remount (rebinds open button). */
  let _paletteInstalled = false;
  let _boundOpen = null;

  /**
   * Progressive-enhancement palette UI.
   * @param {{
   *   getIndex: () => Array,
   *   getBase?: () => string,
   *   search?: typeof search,
   *   document?: Document,
   *   window?: Window
   * }} opts
   */
  function installSearchPalette(opts) {
    const doc = (opts && opts.document) || (typeof document !== "undefined" ? document : null);
    const win = (opts && opts.window) || (typeof window !== "undefined" ? window : null);
    if (!doc || !win) return { open() {}, close() {}, isOpen() { return false; } };

    const getIndex = opts.getIndex;
    const searchFn = opts.search || search;
    const getBase =
      opts.getBase ||
      function () {
        return detectBase(win.location && win.location.pathname);
      };

    function ensurePaletteDom() {
      let root = doc.getElementById("search-palette");
      if (root) return root;
      root = doc.createElement("div");
      root.id = "search-palette";
      root.className = "search-palette";
      root.setAttribute("hidden", "");
      root.setAttribute("role", "dialog");
      root.setAttribute("aria-modal", "true");
      root.setAttribute("aria-label", "Jump to lesson");
      root.innerHTML = `
        <div class="search-palette-backdrop" data-palette-close tabindex="-1"></div>
        <div class="search-palette-panel">
          <div class="search-palette-head">
            <label class="search-palette-label" for="search-palette-input">Search lessons</label>
            <input type="search" id="search-palette-input" class="search-palette-input"
              placeholder="Search lessons… try sandbox, MCP, plan"
              autocomplete="off" spellcheck="false" />
            <kbd class="search-palette-esc">Esc</kbd>
          </div>
          <ul class="search-palette-results" id="search-palette-results" role="listbox"></ul>
          <p class="search-palette-empty" id="search-palette-empty" hidden>No matching lessons</p>
          <p class="search-palette-hint">↑↓ navigate · Enter open · Esc close</p>
        </div>
      `;
      doc.body.appendChild(root);
      return root;
    }

    const root = ensurePaletteDom();
    const input = root.querySelector("#search-palette-input");
    const list = root.querySelector("#search-palette-results");
    const emptyEl = root.querySelector("#search-palette-empty");
    let activeIndex = 0;
    let currentResults = [];

    function isOpen() {
      return !root.hasAttribute("hidden");
    }

    function close() {
      root.setAttribute("hidden", "");
      root.classList.remove("is-open");
      doc.body.classList.remove("palette-open");
      if (input) input.value = "";
      currentResults = [];
      activeIndex = 0;
      if (list) list.innerHTML = "";
      if (emptyEl) emptyEl.hidden = true;
    }

    function open() {
      root.removeAttribute("hidden");
      root.classList.add("is-open");
      doc.body.classList.add("palette-open");
      renderResults("");
      requestAnimationFrame(() => {
        if (input) {
          input.focus();
          input.select();
        }
      });
    }

    function navigateTo(result) {
      if (!result || !result.href) return;
      const href = resolvePageHref(result.href, getBase());
      close();
      win.location.href = href;
    }

    function renderResults(query) {
      currentResults = searchFn(getIndex(), query, { limit: 10 });
      activeIndex = 0;
      if (!list) return;
      if (!query || !String(query).trim()) {
        // Show top lessons as browse hints when empty
        const idx = getIndex() || [];
        currentResults = idx.slice(0, 8).map((d) => ({
          id: d.id,
          href: d.href,
          title: d.title,
          blurb: d.blurb,
          trackName: d.trackName,
          score: 0,
        }));
      }
      if (currentResults.length === 0) {
        list.innerHTML = "";
        if (emptyEl) emptyEl.hidden = false;
        return;
      }
      if (emptyEl) emptyEl.hidden = true;
      list.innerHTML = currentResults
        .map((r, i) => {
          const active = i === activeIndex ? " is-active" : "";
          const track = r.trackName ? `<span class="search-result-track">${escapeHtml(r.trackName)}</span>` : "";
          const blurb = r.blurb
            ? `<span class="search-result-blurb">${escapeHtml(r.blurb)}</span>`
            : "";
          return `<li class="search-result${active}" role="option" data-result-index="${i}" aria-selected="${i === activeIndex}">
            <span class="search-result-title">${escapeHtml(r.title)}</span>
            ${track}${blurb}
          </li>`;
        })
        .join("");
    }

    function escapeHtml(s) {
      return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function setActive(i) {
      if (!currentResults.length) return;
      activeIndex = (i + currentResults.length) % currentResults.length;
      list.querySelectorAll(".search-result").forEach((el, j) => {
        el.classList.toggle("is-active", j === activeIndex);
        el.setAttribute("aria-selected", j === activeIndex ? "true" : "false");
      });
      const active = list.querySelector(".search-result.is-active");
      if (active && active.scrollIntoView) active.scrollIntoView({ block: "nearest" });
    }

    if (!_paletteInstalled) {
      _paletteInstalled = true;
      input?.addEventListener("input", () => {
        renderResults(input.value);
      });
      input?.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setActive(activeIndex + 1);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setActive(activeIndex - 1);
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (currentResults[activeIndex]) navigateTo(currentResults[activeIndex]);
        } else if (e.key === "Escape") {
          e.preventDefault();
          close();
        }
      });
      list?.addEventListener("click", (e) => {
        const li = e.target.closest("[data-result-index]");
        if (!li) return;
        const i = Number(li.getAttribute("data-result-index"));
        if (currentResults[i]) navigateTo(currentResults[i]);
      });
      root.querySelector("[data-palette-close]")?.addEventListener("click", close);
      win.addEventListener("keydown", (e) => {
        const isK = e.key === "k" || e.key === "K";
        if (isK && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          if (isOpen()) close();
          else open();
          return;
        }
        if (e.key === "Escape" && isOpen()) {
          e.preventDefault();
          close();
        }
      });
    }

    // Open control in topnav (recreated on remount)
    function bindOpenControl() {
      const host = doc.querySelector("[data-topnav] .top-meta") || doc.querySelector("[data-topnav]");
      if (!host) return;
      let btn = doc.getElementById("search-open-btn");
      if (!btn) {
        btn = doc.createElement("button");
        btn.type = "button";
        btn.id = "search-open-btn";
        btn.className = "search-open-btn";
        btn.setAttribute("aria-label", "Search lessons (Ctrl+K or Cmd+K)");
        btn.innerHTML = `<span class="search-open-label">Search</span><kbd class="search-open-kbd">⌘K</kbd>`;
        // Insert before nav-toggle if present
        const toggle = host.parentElement && host.parentElement.querySelector(".nav-toggle");
        if (toggle && toggle.parentElement === host.parentElement) {
          host.parentElement.insertBefore(btn, toggle);
        } else if (host.classList && host.classList.contains("top-meta")) {
          host.appendChild(btn);
        } else {
          host.appendChild(btn);
        }
      }
      // Platform hint
      const isMac = /Mac|iPhone|iPad|iPod/.test(win.navigator?.platform || "") ||
        (win.navigator?.userAgent || "").includes("Mac");
      const kbd = btn.querySelector(".search-open-kbd");
      if (kbd) kbd.textContent = isMac ? "⌘K" : "Ctrl+K";

      if (_boundOpen) btn.removeEventListener("click", _boundOpen);
      _boundOpen = () => open();
      btn.addEventListener("click", _boundOpen);
    }

    bindOpenControl();

    return { open, close, isOpen, bindOpenControl, renderResults };
  }

  return {
    tokenize,
    normalizeQuery,
    buildIndex,
    buildIndexFromAcademy,
    scoreDoc,
    search,
    resolvePageHref,
    detectBase,
    installSearchPalette,
    pageToDoc,
  };
});
