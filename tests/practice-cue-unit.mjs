/**
 * Practice-due cue + brand/disclaimer helpers on shipped GROK_ACADEMY.
 * Run: node tests/practice-cue-unit.mjs
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

const academy = globalThis.GROK_ACADEMY;
let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed++;
  } else {
    console.log("OK:", msg);
  }
}

assert(academy.title === "Build With Grok", "brand title Build With Grok");
assert(typeof academy.getPracticeDueCue === "function", "getPracticeDueCue exists");
assert(typeof academy.resolveHubPrimaryCta === "function", "resolveHubPrimaryCta exists");
assert(typeof academy.resolveSmartStartView === "function", "resolveSmartStartView exists");
assert(typeof academy.resolveTrackJourneyStatus === "function", "resolveTrackJourneyStatus exists");
assert(/not affiliated/i.test(academy.LEGAL_DISCLAIMER_HTML), "disclaimer not affiliated");

// Smart Start pure view-model
const ssZero = academy.resolveSmartStartView({ completed: 0, total: 26, next: null, base: "." });
assert(ssZero.mode === "zero", "smart start zero mode");
assert(/three steps/i.test(ssZero.headline), "smart start zero headline");
assert(/Install Grok Build/i.test(ssZero.primaryLabel), "smart start zero Install label");
assert(/01-getting-started/.test(ssZero.primaryHref), "smart start zero href Getting Started");
assert(ssZero.showSteps === true, "smart start zero shows steps");
assert(/2 hours/i.test(ssZero.reassurance || ""), "smart start reassurance");

const ssCont = academy.resolveSmartStartView({
  completed: 3,
  total: 26,
  next: { id: "tui", href: "03-tui-mastery.html", title: "The Grok Screen" },
  base: ".",
});
assert(ssCont.mode === "continue", "smart start continue mode");
assert(/left off/i.test(ssCont.headline), "smart start continue headline");
assert(ssCont.primaryLabel === "The Grok Screen", "smart start continue uses next lesson title");
assert(/03-tui-mastery/.test(ssCont.primaryHref), "smart start continue href");
assert(ssCont.progressLabel === "3/26 complete", "smart start progress label");
assert(ssCont.showSteps === false, "smart start continue hides steps");

const tjLocked = academy.resolveTrackJourneyStatus({
  trackId: "advanced",
  pageIds: ["rules", "mcp"],
  completedIds: ["start"],
  shipDone: false,
});
assert(tjLocked.locked === true, "advanced locked before first ship");
assert(/after your first ship/i.test(tjLocked.badge), "advanced badge after first ship");

const tjStart = academy.resolveTrackJourneyStatus({
  trackId: "beginner",
  pageIds: ["glossary", "start"],
  completedIds: [],
  openedIds: [],
  shipDone: false,
});
assert(tjStart.badgeKind === "start", "beginner start-here badge");
assert(tjStart.expandedDefault === true, "beginner expanded by default");
assert(/SpaceXAI|xAI/i.test(academy.LEGAL_DISCLAIMER_HTML), "disclaimer names xAI/SpaceXAI");
assert(/buildwithgrok\.com/i.test(academy.LEGAL_DISCLAIMER_HTML), "disclaimer names domain");

// --- First-win funnel: empty progress → install / Getting Started ---
const emptyCta = academy.resolveHubPrimaryCta({ completed: 0, next: null, base: "." });
assert(emptyCta.mode === "install", "empty progress mode is install");
assert(/01-getting-started\.html/.test(emptyCta.href), "empty progress href is Getting Started");
assert(/Install Grok Build/i.test(emptyCta.label + emptyCta.heroLabel), "empty progress CTA says Install");
assert(!/00-glossary/.test(emptyCta.href), "empty progress primary CTA is not glossary");

// Returning learner: completed ≥1 and next incomplete → continue that lesson
const continueCta = academy.resolveHubPrimaryCta({
  completed: 2,
  next: {
    id: "tui",
    href: "03-tui-mastery.html",
    title: "The Grok Screen",
    track: { name: "Beginner" },
  },
  base: ".",
});
assert(continueCta.mode === "continue", "returner mode is continue");
assert(/03-tui-mastery\.html/.test(continueCta.href), "returner href is next incomplete");
assert(/The Grok Screen/i.test(continueCta.label + continueCta.descHtml), "returner names next lesson");

// Path complete → cheatsheet
const doneCta = academy.resolveHubPrimaryCta({ completed: 10, next: null, base: "." });
assert(doneCta.mode === "complete", "path complete mode is complete");
assert(/cheatsheet\.html/.test(doneCta.href), "path complete href is cheatsheet");

// Hub-from-pages base still installs to Getting Started when empty
const emptyFromPages = academy.resolveHubPrimaryCta({ completed: 0, next: null, base: ".." });
assert(emptyFromPages.href === "01-getting-started.html", "base .. empty install href has no pages/ prefix");

const mem = globalThis.GROK_PROGRESS_CORE.createMemoryStorage();
academy._progressApi = globalThis.GROK_PROGRESS_CORE.createProgressAPI({
  pageOrder: academy.flatPages().map((p) => p.id),
  storage: mem,
});
assert(academy.getPracticeDueCue({ storage: mem, now: Date.now() }) === null, "no cue without completed");

// End-to-end via shipped progress API: zero completed → install CTA
const zeroStats = academy.progressStats();
const zeroNext = academy.nextIncomplete();
const liveEmpty = academy.resolveHubPrimaryCta({
  completed: zeroStats.completed,
  next: zeroNext,
  base: ".",
});
assert(zeroStats.completed === 0, "fresh progress API has 0 completed");
assert(liveEmpty.mode === "install", "live empty stats resolve to install");
assert(/01-getting-started/.test(liveEmpty.href), "live empty stats href Getting Started");

// Complete walkthrough via phases (real completion path)
const api = academy._progressApi;
for (const id of ["0", "1", "2", "3", "4", "5"]) {
  api.setPhaseComplete("wt-game", id, true);
}
assert(api.isCompleted("wt-game") === true, "wt-game complete after phases");

const store = {
  data: {},
  getItem(k) {
    return Object.prototype.hasOwnProperty.call(this.data, k) ? this.data[k] : null;
  },
  setItem(k, v) {
    this.data[k] = String(v);
  },
};
const now = Date.now();
store.setItem("grok-academy-last-visit-ms", String(now - 3 * 24 * 60 * 60 * 1000));
const cue = academy.getPracticeDueCue({ storage: store, now });
assert(!!cue, "cue when completed ship");
assert(/First Game|Practice tip|practice/i.test(cue.message + " " + cue.title), "cue names ship practice");
assert(/21-walkthrough|walkthrough-first-game/i.test(cue.href), "cue href walkthrough");

if (failed) {
  console.error(`\n${failed} failure(s)`);
  process.exit(1);
}
console.log("\nALL PRACTICE CUE UNIT TESTS PASSED");
process.exit(0);
