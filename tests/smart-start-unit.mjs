/**
 * Smart Start + track journey pure helpers (shipped curriculum.js).
 * Run: node tests/smart-start-unit.mjs
 */
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
globalThis.window = globalThis;
globalThis.location = { pathname: "/index.html" };
require(path.join(ROOT, "js/progress-core.js"));
require(path.join(ROOT, "js/search-core.js"));
require(path.join(ROOT, "js/version-core.js"));
require(path.join(ROOT, "js/a11y-perf.js"));
require(path.join(ROOT, "js/curriculum.js"));

const A = globalThis.GROK_ACADEMY;
let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed++;
  } else {
    console.log("OK:", msg);
  }
}

assert(typeof A.resolveSmartStartView === "function", "resolveSmartStartView");
assert(typeof A.resolveTrackJourneyStatus === "function", "resolveTrackJourneyStatus");

const z = A.resolveSmartStartView({ completed: 0, total: 26, next: { id: "glossary" }, base: "." });
assert(z.mode === "zero", "zero ignores next when completed 0");
assert(z.primaryLabel === "Start Learning Now", "zero Start Learning Now label");
assert(/01-getting-started/.test(z.primaryHref), "zero → getting started");

const mem = globalThis.GROK_PROGRESS_CORE.createMemoryStorage();
A._progressApi = globalThis.GROK_PROGRESS_CORE.createProgressAPI({
  pageOrder: A.flatPages().map((p) => p.id),
  storage: mem,
});
const api = A._progressApi;
api.markCompleted("start");
api.markCompleted("first");
const next = A.nextIncomplete();
const view = A.resolveSmartStartView({
  completed: A.progressStats().completed,
  total: A.progressStats().total,
  next,
  base: ".",
});
assert(view.mode === "continue", "live progress continue mode");
assert(view.primaryLabel === next.title, "continue primary is next lesson title");
assert(view.progressLabel.indexOf("/26") !== -1 || /\/\d+ complete/.test(view.progressLabel), "N/total complete");

const shipStatus = A.resolveTrackJourneyStatus({
  trackId: "intermediate",
  pageIds: ["git", "tools"],
  completedIds: ["start"],
  shipDone: true,
});
assert(shipStatus.locked === false, "intermediate unlocked after ship");

if (failed) {
  console.error(`\n${failed} failure(s)`);
  process.exit(1);
}
console.log("\nALL SMART START UNIT TESTS PASSED");
process.exit(0);
