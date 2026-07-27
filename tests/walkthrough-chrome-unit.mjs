/**
 * Unit tests for shipped walkthrough-chrome.js helpers.
 * Drive real computePhaseChrome / nextIncomplete / badges — not a reimplementation.
 * Run: node tests/walkthrough-chrome-unit.mjs
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const chrome = require(path.join(ROOT, "js/walkthrough-chrome.js"));
const progressCore = require(path.join(ROOT, "js/progress-core.js"));

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed++;
  } else {
    console.log("OK:", msg);
  }
}

const req = ["0", "1", "2", "3", "4", "5"];
assert(chrome.DEFAULT_PHASES.join(",") === req.join(","), "default phases 0-5");

// Empty map → first phase incomplete
const empty = chrome.computePhaseChrome(req, {});
assert(empty.done === 0, "empty done=0");
assert(empty.total === 6, "total=6");
assert(empty.nextId === "0", "empty next is 0");
assert(empty.allComplete === false, "empty not complete");
assert(empty.spyLabel === "Phase 0 of 6", `spyLabel empty got ${empty.spyLabel}`);
assert(empty.spyShort === "0 / 6", "spyShort 0/6");
assert(empty.badges["0"] === "current", "phase 0 current");
assert(empty.badges["1"] === "todo", "phase 1 todo");
assert(empty.badges["5"] === "todo", "phase 5 todo");
assert(chrome.nextIncompletePhase(req, {}) === "0", "nextIncomplete empty → 0");
assert(chrome.countDone(req, {}) === 0, "countDone empty");

// Partial map: 0,1 done → next 2
const partialMap = { "0": true, "1": true };
const partial = chrome.computePhaseChrome(req, partialMap);
assert(partial.done === 2, "partial done=2");
assert(partial.nextId === "2", "next is 2");
assert(partial.spyLabel === "Phase 2 of 6", `spy partial ${partial.spyLabel}`);
assert(partial.spyShort === "2 / 6", "spyShort 2/6");
assert(partial.badges["0"] === "done", "0 done");
assert(partial.badges["1"] === "done", "1 done");
assert(partial.badges["2"] === "current", "2 current");
assert(partial.badges["3"] === "todo", "3 todo");
assert(chrome.badgeStates(req, partialMap)["2"] === "current", "badgeStates current");

// All six complete
const allMap = { "0": true, "1": true, "2": true, "3": true, "4": true, "5": true };
const all = chrome.computePhaseChrome(req, allMap);
assert(all.done === 6, "all done=6");
assert(all.nextId === null, "all next null");
assert(all.allComplete === true, "allComplete");
assert(/6 of 6/.test(all.spyLabel) && /complete/i.test(all.spyLabel), `spy all ${all.spyLabel}`);
assert(all.spyShort === "6 / 6", "spyShort 6/6");
assert(Object.values(all.badges).every((s) => s === "done"), "all badges done");
assert(chrome.nextIncompletePhase(req, allMap) === null, "nextIncomplete all null");
assert(chrome.countDone(req, allMap) === 6, "countDone 6");

// HTML helpers include spy hooks
const spy = chrome.spyHTML(partial);
assert(spy.includes("data-walkthrough-spy"), "spyHTML has data-walkthrough-spy");
assert(spy.includes("Phase 2 of 6"), "spyHTML shows Phase 2 of 6");
assert(spy.includes("2 / 6"), "spyHTML shows count");
const badge = chrome.badgeHTML("2", "current", partial.badgeLabel);
assert(badge.includes("data-phase-badge"), "badgeHTML hook");
assert(badge.includes("You are here") || badge.includes("current"), `badge label ${badge}`);

// Progress-core phase map compatibility (same keys wt-game uses)
const mem = progressCore.createMemoryStorage();
const api = progressCore.createProgressAPI({
  pageOrder: ["wt-game", "wt-app"],
  storage: mem,
});
assert(!!api.WALKTHROUGH_PHASES["wt-game"], "wt-game phases in progress-core");
const wtReq = api.WALKTHROUGH_PHASES["wt-game"];
assert(wtReq.length === 6, "wt-game has 6 phases");
api.setPhaseComplete("wt-game", "0", true);
api.setPhaseComplete("wt-game", "1", true);
api.setPhaseComplete("wt-game", "2", true);
const fromCore = chrome.computePhaseChrome(wtReq, api.getPhases("wt-game"));
assert(fromCore.nextId === "3", "chrome next from progress-core map is 3");
assert(fromCore.spyLabel === "Phase 3 of 6", `fromCore spy ${fromCore.spyLabel}`);
assert(fromCore.done === 3, "done 3 from core");

// Complete all via progress-core → chrome complete
for (const id of wtReq) api.setPhaseComplete("wt-game", id, true);
const doneCore = chrome.computePhaseChrome(wtReq, api.getPhases("wt-game"));
assert(doneCore.allComplete === true, "all complete via progress-core");
assert(doneCore.nextId === null, "no next when complete");

// String coercion of numeric keys
const numMap = { 0: true, 1: true };
assert(chrome.nextIncompletePhase(req, numMap) === "2", "numeric keys coerced");

if (failed) {
  console.error(`\n${failed} failure(s)`);
  process.exit(1);
}
console.log("\nALL WALKTHROUGH CHROME UNIT TESTS PASSED");
process.exit(0);
