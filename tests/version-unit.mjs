/**
 * Unit tests for shipped version-core.js (Phase 3).
 * Drives real curriculum stamps + pure resolve/stale helpers.
 * Run: node tests/version-unit.mjs
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

globalThis.window = globalThis;
globalThis.location = { pathname: "/index.html" };

require(path.join(ROOT, "js/progress-core.js"));
require(path.join(ROOT, "js/search-core.js"));
const versionCore = require(path.join(ROOT, "js/version-core.js"));
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

assert(typeof versionCore.resolveStamp === "function", "resolveStamp exported");
assert(typeof versionCore.isStale === "function", "isStale exported");
assert(typeof versionCore.ribbonHTML === "function", "ribbonHTML exported");
assert(Array.isArray(versionCore.FLAG_HEAVY_IDS), "FLAG_HEAVY_IDS present");

const required = ["safety", "commands", "mcp", "auto", "workflows", "dashboard"];
for (const id of required) {
  assert(versionCore.FLAG_HEAVY_IDS.includes(id), `FLAG_HEAVY includes ${id}`);
  const page = academy.findPage(id);
  assert(!!page, `curriculum has page ${id}`);
  const stamp = versionCore.resolveStamp(page, "2026-07-27");
  assert(!!stamp, `${id} has resolvable stamp`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(stamp.verifiedISO), `${id} verified ISO ${stamp.verifiedISO}`);
  assert(typeof stamp.stale === "boolean", `${id} stale is boolean`);
  assert(stamp.reviewEveryDays >= 1, `${id} has reviewEveryDays`);
  assert(stamp.ribbonText.includes(stamp.verifiedISO), `${id} ribbonText includes date`);
  assert(/\/docs/.test(stamp.ribbonText), `${id} ribbon points to /docs`);
  const html = versionCore.ribbonHTML(stamp);
  assert(html.includes("data-version-ribbon"), `${id} ribbonHTML has data-version-ribbon`);
  assert(html.includes(stamp.verifiedISO), `${id} ribbonHTML includes date`);
  assert(html.includes(`datetime="${stamp.verifiedISO}"`), `${id} ribbonHTML has time datetime`);
}

// Missing stamp on beginner lesson — sane null / not stale
const glossary = academy.findPage("glossary");
assert(!!glossary, "glossary page exists");
assert(versionCore.resolveStamp(glossary) === null, "glossary has no stamp → null");
assert(versionCore.isStale(glossary, "2026-07-27") === false, "missing stamp is not stale");
assert(versionCore.ribbonHTML(null) === "", "ribbonHTML(null) empty");

// Fixed-date staleness: verified 2026-01-01, review every 30 days
const synthetic = { verified: "2026-01-01", reviewEveryDays: 30 };
const current = versionCore.resolveStamp(synthetic, "2026-01-15");
assert(current && current.stale === false, "within cadence → not stale");
assert(current.nextReviewISO === "2026-01-31", `nextReview 2026-01-31 got ${current.nextReviewISO}`);
assert(versionCore.isStale(synthetic, "2026-01-15") === false, "isStale false mid-window");

const overdue = versionCore.resolveStamp(synthetic, "2026-02-01");
assert(overdue && overdue.stale === true, "after nextReview → stale");
assert(overdue.status === "stale", "status stale");
assert(overdue.label === "Review overdue", "overdue label");
assert(versionCore.isStale(synthetic, "2026-02-01") === true, "isStale true when overdue");
assert(versionCore.ribbonHTML(overdue).includes("is-stale"), "stale ribbon has is-stale class");

// Boundary: asOf === nextReview counts as stale
const onBoundary = versionCore.resolveStamp(synthetic, "2026-01-31");
assert(onBoundary && onBoundary.stale === true, "asOf === nextReview is stale");

// parseISO rejects garbage
assert(versionCore.parseISODate("not-a-date") === null, "bad date null");
assert(versionCore.parseISODate("2026-13-40") === null, "invalid calendar null");
assert(versionCore.resolveStamp({ verified: "bogus" }) === null, "bogus verified → null");

// Academy wrapper
assert(typeof academy.resolveLessonStamp === "function", "resolveLessonStamp on academy");
const viaId = academy.resolveLessonStamp("safety", "2026-07-27");
assert(viaId && viaId.verifiedISO, "resolveLessonStamp by id");
assert(viaId.verifiedISO === versionCore.resolveStamp(academy.findPage("safety")).verifiedISO, "wrapper matches core");

// Default review days when omitted
const defOnly = versionCore.resolveStamp({ verified: "2026-06-01" }, "2026-06-10");
assert(defOnly.reviewEveryDays === versionCore.DEFAULT_REVIEW_EVERY_DAYS, "default reviewEveryDays");

if (failed) {
  console.error(`\n${failed} failure(s)`);
  process.exit(1);
}
console.log("\nALL VERSION UNIT TESTS PASSED");
process.exit(0);
