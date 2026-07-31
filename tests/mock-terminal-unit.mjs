/**
 * Unit tests for shipped js/mock-terminal.js demo driver.
 * Run: node tests/mock-terminal-unit.mjs
 */
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const api = require(path.join(ROOT, "js/mock-terminal.js"));

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed++;
  } else {
    console.log("OK:", msg);
  }
}

assert(!!api, "mock-terminal API exports");
assert(Array.isArray(api.COMMAND_STRINGS), "COMMAND_STRINGS array");
assert(api.COMMAND_STRINGS.includes("mkdir grok-projects"), "sequence includes mkdir grok-projects");
assert(api.COMMAND_STRINGS.includes("cd grok-projects"), "sequence includes cd grok-projects");
assert(api.COMMAND_STRINGS.includes("grok"), "sequence includes grok");
assert(api.COMMAND_STRINGS.length === 3, "exactly three beginner commands");

assert(Array.isArray(api.DEMO_SEQUENCE), "DEMO_SEQUENCE array");
const cmds = api.DEMO_SEQUENCE.filter((s) => s.kind === "type").map((s) => s.command);
assert(cmds.join("|") === "mkdir grok-projects|cd grok-projects|grok", "type steps order");

assert(/simulation/i.test(api.SIM_LABEL), "SIM_LABEL mentions simulation");
assert(/Install Grok Build/i.test(api.SIM_LABEL), "SIM_LABEL points to Install");
assert(/simulation/i.test(api.FINAL_SIM), "FINAL_SIM simulation reminder");

const finalLines = api.getFinalStateLines();
assert(finalLines.length >= 4, "final state has multiple lines");
const finalText = finalLines.map((l) => l.text || "").join("\n");
assert(finalText.includes("mkdir grok-projects"), "final state shows mkdir");
assert(finalText.includes("cd grok-projects"), "final state shows cd");
assert(finalText.includes("grok"), "final state shows grok");
assert(/Grok Build/i.test(finalText) || finalLines.some((l) => /Grok Build/.test(l.text || "")), "final includes Grok Build banner");

// Reduced-motion path: applyFinalState without running typewriter
function makeFakeRoot() {
  const screen = {
    children: [],
    scrollTop: 0,
    get lastElementChild() {
      return this.children[this.children.length - 1] || null;
    },
    appendChild(el) {
      this.children.push(el);
      return el;
    },
    append(...els) {
      els.forEach((e) => this.appendChild(e));
    },
    set innerHTML(v) {
      this._html = v;
      this.children = [];
      if (v) {
        // minimal: one placeholder so length checks can use _html
        this.children.push({ innerHTML: v, textContent: v.replace(/<[^>]+>/g, "") });
      }
    },
    get innerHTML() {
      return this._html || "";
    },
  };
  const pauseBtn = {
    disabled: false,
    textContent: "Pause",
    attrs: {},
    setAttribute(k, v) {
      this.attrs[k] = v;
    },
    addEventListener() {},
  };
  const replayBtn = {
    disabled: false,
    textContent: "Replay",
    addEventListener() {},
  };
  const root = {
    attrs: {},
    setAttribute(k, v) {
      this.attrs[k] = v;
    },
    querySelector(sel) {
      if (sel === "[data-mt-screen]") return screen;
      if (sel === "[data-mt-pause]") return pauseBtn;
      if (sel === "[data-mt-replay]") return replayBtn;
      return null;
    },
  };
  // document.createElement used by controller
  globalThis.document = {
    createElement(tag) {
      return {
        tagName: tag,
        className: "",
        textContent: "",
        innerHTML: "",
        appendChild() {},
      };
    },
  };
  return { root, screen, pauseBtn, replayBtn };
}

const { root, screen, pauseBtn } = makeFakeRoot();
const ctrl = api.createDemoController({
  root,
  reducedMotion: true,
  setTimeout: (fn) => {
    fn();
    return 1;
  },
  clearTimeout() {},
});
assert(!!ctrl, "createDemoController returns controller");
assert(ctrl.getState().reducedMotion === true, "reducedMotion true");
assert(ctrl.getState().finished === true, "reduced motion finishes immediately");
assert(root.attrs["data-mt-state"] === "final", "root data-mt-state final");
assert(screen.innerHTML.length > 0 || screen.children.length > 0, "screen has final content");
assert(pauseBtn.disabled === true, "pause disabled under reduced motion");

// Non-reduced: pause/resume toggles state without finishing immediately
const fake2 = makeFakeRoot();
let t = 0;
const pending = [];
const ctrl2 = api.createDemoController({
  root: fake2.root,
  reducedMotion: false,
  setTimeout: (fn, ms) => {
    const id = ++t;
    pending.push({ id, fn, ms: ms || 0 });
    return id;
  },
  clearTimeout(id) {
    const i = pending.findIndex((p) => p.id === id);
    if (i >= 0) pending.splice(i, 1);
  },
});
assert(ctrl2.getState().finished === false, "non-reduced starts unfinished");
ctrl2.play();
assert(ctrl2.getState().running === true || ctrl2.getState().phase === "playing", "play starts sequence");
ctrl2.pause();
assert(ctrl2.getState().paused === true, "pause sets paused");
ctrl2.pause();
assert(ctrl2.getState().paused === false, "second pause resumes");
ctrl2.applyFinalState();
assert(ctrl2.getState().finished === true, "applyFinalState finishes");
assert(fake2.root.attrs["data-mt-state"] === "final", "manual final state");

// prefersReducedMotion false without matchMedia
assert(api.prefersReducedMotion({ matchMedia: () => ({ matches: false }) }) === false, "prefersReducedMotion false");
assert(api.prefersReducedMotion({ matchMedia: () => ({ matches: true }) }) === true, "prefersReducedMotion true");

if (failed) {
  console.error(`\n${failed} failure(s)`);
  process.exit(1);
}
console.log("\nALL MOCK TERMINAL UNIT TESTS PASSED");
process.exit(0);
