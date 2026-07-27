/**
 * Unit tests for shipped search-core.js (Phase 2).
 * Drives real curriculum index via GROK_ACADEMY + search helpers.
 * Run: node tests/search-unit.mjs
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Browser-like globals so curriculum.js can load
globalThis.window = globalThis;
globalThis.location = { pathname: "/index.html" };

require(path.join(ROOT, "js/progress-core.js"));
const searchCore = require(path.join(ROOT, "js/search-core.js"));
require(path.join(ROOT, "js/curriculum.js"));

const academy = globalThis.GROK_ACADEMY;
if (!academy) {
  console.error("FAIL: GROK_ACADEMY not loaded");
  process.exit(1);
}

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed++;
  } else {
    console.log("OK:", msg);
  }
}

// --- pure helpers ---
assert(typeof searchCore.buildIndex === "function", "buildIndex exported");
assert(typeof searchCore.search === "function", "search exported");
assert(typeof searchCore.buildIndexFromAcademy === "function", "buildIndexFromAcademy exported");

const index = searchCore.buildIndexFromAcademy(academy);
assert(index.length >= 24, `index covers curriculum pages (got ${index.length})`);
assert(index.some((d) => d.id === "safety"), "index includes safety");
assert(index.some((d) => d.id === "mcp"), "index includes mcp");

// Empty / nonsense
assert(searchCore.search(index, "").length === 0, "empty query returns []");
assert(searchCore.search(index, "   ").length === 0, "whitespace query returns []");
const nonsense = searchCore.search(index, "zzzxqnotatopic999");
assert(Array.isArray(nonsense) && nonsense.length === 0, "nonsense query returns empty list");

// Defining queries
const sandboxHits = searchCore.search(index, "sandbox");
assert(sandboxHits.length > 0, "sandbox returns results");
assert(sandboxHits[0].id === "safety", `sandbox → safety first (got ${sandboxHits[0]?.id})`);

const mcpHits = searchCore.search(index, "MCP");
assert(mcpHits.length > 0, "MCP returns results");
assert(mcpHits[0].id === "mcp", `MCP → mcp first (got ${mcpHits[0]?.id})`);

const mcpLower = searchCore.search(index, "mcp");
assert(mcpLower[0]?.id === "mcp", "mcp lowercase → mcp lesson");

// Sensible secondary queries
const planHits = searchCore.search(index, "plan");
assert(planHits.some((r) => r.id === "plan"), "plan finds Plan Mode");

const dashHits = searchCore.search(index, "dashboard");
assert(dashHits[0]?.id === "dashboard", "dashboard → dashboard lesson");

// Day-2 git module discoverable via shipped search
const gitHits = searchCore.search(index, "git");
assert(gitHits.length > 0, "git returns results");
assert(
  gitHits.some((r) => r.id === "git"),
  `git query includes day-2 git lesson (got ${gitHits.map((r) => r.id).join(",")})`
);
assert(gitHits[0]?.id === "git", `git → git lesson first (got ${gitHits[0]?.id})`);
const commitHits = searchCore.search(index, "commit");
assert(
  commitHits.some((r) => r.id === "git"),
  "commit surfaces day-2 git lesson"
);

// Academy wrappers (shipped API used by UI)
assert(typeof academy.searchLessons === "function", "academy.searchLessons exists");
// Force index rebuild path
academy._searchIndex = null;
const viaAcademy = academy.searchLessons("sandbox");
assert(viaAcademy[0]?.id === "safety", "academy.searchLessons sandbox → safety");

// resolve hrefs hub vs pages
assert(
  searchCore.resolvePageHref("14-mcp.html", ".") === "pages/14-mcp.html",
  "hub resolve href"
);
assert(
  searchCore.resolvePageHref("14-mcp.html", "..") === "14-mcp.html",
  "pages resolve href"
);
assert(searchCore.detectBase("/pages/14-mcp.html") === "..", "detectBase pages");
assert(searchCore.detectBase("/index.html") === ".", "detectBase hub");

// Keywords present on safety for sandbox (index source of truth)
const safetyDoc = index.find((d) => d.id === "safety");
assert(
  safetyDoc && safetyDoc.keywords.some((k) => /sandbox/i.test(k)),
  "safety doc has sandbox keyword"
);

if (failed) {
  console.error(`\n${failed} failure(s)`);
  process.exit(1);
}
console.log("\nALL SEARCH UNIT TESTS PASSED");
process.exit(0);
