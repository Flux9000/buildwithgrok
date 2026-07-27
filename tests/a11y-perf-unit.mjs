/**
 * Unit tests for shipped a11y-perf.js helpers (no jsdom dependency).
 * Uses a minimal DOM mock that exercises the real enhance/skip/main paths.
 * Run: node tests/a11y-perf-unit.mjs
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const a11y = require(path.join(ROOT, "js/a11y-perf.js"));

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed++;
  } else {
    console.log("OK:", msg);
  }
}

/** Minimal element */
function el(tag, attrs = {}) {
  const classSet = new Set(
    String(attrs.className || attrs.class || "")
      .split(/\s+/)
      .filter(Boolean)
  );
  const node = {
    tagName: tag.toUpperCase(),
    id: attrs.id || "",
    attrs: { ...attrs },
    children: [],
    parent: null,
    classList: {
      add(...c) {
        c.forEach((x) => classSet.add(x));
      },
      contains(c) {
        return classSet.has(c);
      },
    },
    textContent: attrs.textContent || "",
    loading: attrs.loading || "",
    href: attrs.href || "",
    getAttribute(name) {
      if (name === "loading") return this.loading || this.attrs.loading || null;
      if (name === "class" || name === "className") return [...classSet].join(" ") || null;
      if (name === "href") return this.attrs.href || this.href || null;
      return this.attrs[name] ?? null;
    },
    setAttribute(name, val) {
      this.attrs[name] = String(val);
      if (name === "id") this.id = String(val);
      if (name === "loading") this.loading = String(val);
      if (name === "href") this.href = String(val);
      if (name === "class" || name === "className") {
        classSet.clear();
        String(val)
          .split(/\s+/)
          .filter(Boolean)
          .forEach((x) => classSet.add(x));
      }
    },
    get href() {
      return this.attrs.href || "";
    },
    set href(v) {
      this.attrs.href = String(v);
    },
    get className() {
      return [...classSet].join(" ");
    },
    set className(v) {
      classSet.clear();
      String(v || "")
        .split(/\s+/)
        .filter(Boolean)
        .forEach((x) => classSet.add(x));
      this.attrs.class = [...classSet].join(" ");
    },
    hasAttribute(name) {
      return name in this.attrs || (name === "loading" && !!this.loading) || (name === "id" && !!this.id);
    },
    appendChild(child) {
      child.parent = this;
      this.children.push(child);
      return child;
    },
    insertBefore(child, _ref) {
      child.parent = this;
      this.children.unshift(child);
      return child;
    },
    closest(sel) {
      let cur = this;
      while (cur) {
        if (matchSel(cur, sel)) return cur;
        cur = cur.parent;
      }
      return null;
    },
    querySelector(sel) {
      return queryAll(this, sel)[0] || null;
    },
    querySelectorAll(sel) {
      return queryAll(this, sel);
    },
  };
  return node;
}

function matchSel(node, sel) {
  if (!node || !sel) return false;
  // support simple: tag, .class, #id, [attr], [attr='x'], comma-separated in closest is rare
  const parts = sel.split(",").map((s) => s.trim());
  return parts.some((p) => matchOne(node, p));
}

function matchOne(node, sel) {
  if (sel.startsWith("#")) return node.id === sel.slice(1);
  if (sel.startsWith(".")) return node.classList.contains(sel.slice(1));
  if (sel.startsWith("[")) {
    const m = sel.match(/^\[([^\=\]]+)(?:=['"]?([^'"\]]+)['"]?)?\]/);
    if (!m) return false;
    const val = node.getAttribute(m[1]);
    if (m[2] !== undefined) return val === m[2];
    return val != null || node.hasAttribute(m[1]);
  }
  if (sel.includes(".")) {
    const [tag, cls] = sel.split(".");
    if (tag && node.tagName !== tag.toUpperCase()) return false;
    return node.classList.contains(cls);
  }
  if (sel.includes("#")) {
    const [tag, id] = sel.split("#");
    if (tag && node.tagName !== tag.toUpperCase()) return false;
    return node.id === id;
  }
  // compound like .hub-hero-bg, [data-eager-images] for closest — single
  if (sel.includes(",")) return false;
  return node.tagName === sel.toUpperCase();
}

function queryAll(root, sel) {
  const out = [];
  function walk(n) {
    if (matchSel(n, sel)) out.push(n);
    for (const c of n.children || []) walk(c);
  }
  walk(root);
  return out;
}

function makeDoc() {
  const body = el("body");
  const html = el("html");
  html.appendChild(body);
  const nav = el("header", { className: "site-nav" });
  nav.setAttribute("data-topnav", "");
  const layout = el("div", { className: "layout" });
  const side = el("aside", { className: "sidebar" });
  side.setAttribute("data-sidebar", "");
  const mainCol = el("div", { className: "main-col" });
  const article = el("article", { className: "wrap narrow prose" });
  const img1 = el("img");
  img1.attrs.src = "a.jpg";
  const img2 = el("img");
  img2.attrs.src = "b.jpg";
  img2.setAttribute("alt", "photo");
  article.appendChild(img1);
  article.appendChild(img2);
  mainCol.appendChild(article);
  layout.appendChild(side);
  layout.appendChild(mainCol);
  const heroWrap = el("div", { className: "hub-hero-bg" });
  heroWrap.setAttribute("data-eager-images", "");
  const heroImg = el("img");
  heroImg.attrs.src = "hero.jpg";
  heroImg.setAttribute("alt", "");
  heroWrap.appendChild(heroImg);
  body.appendChild(nav);
  body.appendChild(layout);
  body.appendChild(heroWrap);

  const doc = {
    body,
    documentElement: html,
    getElementById(id) {
      return queryAll(html, `#${id}`)[0] || null;
    },
    querySelector(sel) {
      return queryAll(html, sel)[0] || null;
    },
    querySelectorAll(sel) {
      return queryAll(html, sel);
    },
    createElement(tag) {
      return el(tag);
    },
  };
  // body methods used by ensureSkipLink
  body.insertBefore = function (child, _ref) {
    child.parent = body;
    body.children.unshift(child);
    return child;
  };
  return { doc, body, nav, article, img1, img2, heroImg, heroWrap };
}

assert(typeof a11y.installA11yPerf === "function", "installA11yPerf exported");
assert(typeof a11y.shouldLazyLoad === "function", "shouldLazyLoad exported");
assert(a11y.MAIN_ID === "main-content", "MAIN_ID");
assert(a11y.SKIP_ID === "skip-to-content", "SKIP_ID");

// Pure shouldLazyLoad
function mockImg(opts = {}) {
  return {
    loading: opts.loading || "",
    getAttribute(name) {
      if (name === "loading") return this.loading || null;
      return opts.attrs?.[name] ?? null;
    },
    closest(sel) {
      if (opts.closestEager && (sel.includes("hub-hero") || sel.includes("eager"))) return {};
      return null;
    },
  };
}
assert(a11y.shouldLazyLoad(mockImg()) === true, "default img should lazy");
assert(a11y.shouldLazyLoad(mockImg({ loading: "eager" })) === false, "eager not lazy");
assert(
  a11y.shouldLazyLoad(mockImg({ attrs: { "data-eager": "true" } })) === false,
  "data-eager not lazy"
);
assert(a11y.shouldLazyLoad(mockImg({ closestEager: true })) === false, "hero container not lazy");
assert(a11y.shouldLazyLoad(null) === false, "null false");

const { doc, nav, img1, img2, heroImg } = makeDoc();

const main = a11y.ensureMainLandmark(doc);
assert(!!main, "main landmark");
assert(main.id === "main-content", "main id");
assert(main.getAttribute("tabindex") === "-1", "main tabindex -1");

const skip = a11y.ensureSkipLink(doc);
assert(!!skip, "skip link");
assert(skip.id === "skip-to-content", "skip id");
assert(skip.getAttribute("href") === "#main-content", "skip href #main-content");
assert(skip.classList.contains("skip-link"), "skip-link class");
assert(doc.body.children[0] === skip || doc.body.children[0].id === "skip-to-content", "skip near top");

const stats = a11y.enhanceImages(doc);
assert(stats.total === 3, `total images 3 got ${stats.total}`);
assert(stats.lazy === 2, `lazy 2 got ${stats.lazy}`);
assert(img1.getAttribute("loading") === "lazy", "content img1 lazy");
assert(img2.getAttribute("loading") === "lazy", "content img2 lazy");
assert(img1.getAttribute("decoding") === "async", "decoding async");
assert(
  heroImg.getAttribute("loading") === "eager" || heroImg.loading === "eager",
  "hero eager"
);

const marks = a11y.markPrintChrome(doc);
assert(marks >= 1, "print marks");
assert(nav.classList.contains("no-print"), "nav no-print");

const installed = a11y.installA11yPerf({ document: doc });
assert(installed.ok === true, "install ok");
assert(doc.documentElement.classList.contains("a11y-perf-ready"), "ready class");
a11y.ensureSkipLink(doc);
assert(doc.querySelectorAll("#skip-to-content").length === 1, "single skip link");

assert(a11y.enhanceImages(null).total === 0, "null enhance safe");
assert(a11y.ensureSkipLink(null) === null, "null skip safe");
assert(a11y.ensureMainLandmark(null) === null, "null main safe");
assert(a11y.installA11yPerf({ document: null }).ok === false, "null install not ok");

if (failed) {
  console.error(`\n${failed} failure(s)`);
  process.exit(1);
}
console.log("\nALL A11Y-PERF UNIT TESTS PASSED");
process.exit(0);
