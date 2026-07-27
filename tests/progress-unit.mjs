/**
 * Unit tests for shipped progress-core.js (Phase 1).
 * Run: node tests/progress-unit.mjs
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const core = require(path.join(__dirname, "../js/progress-core.js"));

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed++;
  } else {
    console.log("OK:", msg);
  }
}

const order = [
  "glossary",
  "start",
  "first",
  "tui",
  "keys",
  "games",
  "wt-game",
  "apps",
  "wt-app",
  "commands",
];

const mem = core.createMemoryStorage();
const api = core.createProgressAPI({ pageOrder: order, storage: mem });

// opened ≠ completed
api.markOpened("glossary");
assert(api.isOpened("glossary") === true, "markOpened sets opened");
assert(api.isCompleted("glossary") === false, "opened alone is not completed");
assert(api.nextIncomplete()?.id === "glossary", "next incomplete is glossary when only opened");

api.markCompleted("glossary");
assert(api.isCompleted("glossary") === true, "markCompleted sets completed");
assert(api.nextIncomplete()?.id === "start", "next skips completed glossary");

// skimming many pages does not finish path
api.markOpened("start");
api.markOpened("first");
api.markOpened("tui");
assert(api.nextIncomplete()?.id === "start", "next still start when later pages only opened");
assert(api.progressStats().completed === 1, "only one completed after skim");

// complete in order
api.markCompleted("start");
api.markCompleted("first");
api.markCompleted("tui");
api.markCompleted("keys");
api.markCompleted("games");
assert(api.nextIncomplete()?.id === "wt-game", "next is walkthrough after basics");

// walkthrough phases
assert(api.isCompleted("wt-game") === false, "wt-game incomplete without phases");
api.markOpened("wt-game");
api.markCompleted("wt-game");
assert(api.isCompleted("wt-game") === false, "cannot complete wt-game without phases");

for (const ph of ["0", "1", "2", "3", "4"]) {
  api.setPhaseComplete("wt-game", ph, true);
}
assert(api.isWalkthroughComplete("wt-game") === false, "five phases not enough");
api.setPhaseComplete("wt-game", "5", true);
assert(api.isWalkthroughComplete("wt-game") === true, "six phases complete walkthrough");
assert(api.isCompleted("wt-game") === true, "walkthrough complete counts as lesson complete");
assert(api.nextIncomplete()?.id === "apps", "next after wt-game is apps");

// uncheck phase undoes complete
api.setPhaseComplete("wt-game", "5", false);
assert(api.isCompleted("wt-game") === false, "missing phase reopens incomplete");

// reset
api.resetProgress();
assert(api.progressStats().completed === 0, "reset clears completed");
assert(api.progressStats().opened === 0, "reset clears opened");
assert(api.nextIncomplete()?.id === "glossary", "after reset next is first lesson");

// legacy migrate
const mem2 = {
  _d: JSON.stringify({ glossary: true, start: true }),
  getItem(k) {
    if (k === core.LEGACY_KEY) return this._d;
    if (k === core.STORAGE_KEY) return this._v2 || null;
    return null;
  },
  setItem(k, v) {
    if (k === core.STORAGE_KEY) this._v2 = v;
  },
  removeItem(k) {
    if (k === core.LEGACY_KEY) this._d = null;
  },
};
const api2 = core.createProgressAPI({ pageOrder: order, storage: mem2 });
assert(api2.isOpened("glossary") === true, "legacy v1 migrates to opened");
assert(api2.isCompleted("glossary") === false, "legacy v1 does not mark completed");

// normalizeState pure
const n = core.normalizeState({ foo: true });
assert(n.opened.foo === true && Object.keys(n.completed).length === 0, "normalizeState legacy map");

if (failed) {
  console.error(`\n${failed} failure(s)`);
  process.exit(1);
}
console.log("\nALL PROGRESS UNIT TESTS PASSED");
process.exit(0);
