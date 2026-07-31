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
assert(/Grok Build/i.test(finalText), "final includes Grok Build branding");
// Realistic TUI home markers (match real product home after `grok`)
assert(!!api.TUI_HOME, "TUI_HOME config exported");
assert(/~\/grok-projects/.test(api.TUI_HOME.cwd), "TUI cwd is ~/grok-projects");
assert(
  api.TUI_HOME.menu.some((m) => /New worktree/i.test(m.label)),
  "TUI menu includes New worktree"
);
assert(
  api.TUI_HOME.menu.some((m) => /Resume session/i.test(m.label)),
  "TUI menu includes Resume session"
);
assert(/Grok 4\.5 is here/i.test(api.TUI_HOME.announce), "TUI announce Grok 4.5");
assert(/always-approve/i.test(api.TUI_HOME.statusModel), "TUI status shows always-approve");
const tuiPlain = api.getTuiHomePlainLines().join("\n");
assert(/New worktree/.test(tuiPlain) && /Quit/.test(tuiPlain), "TUI plain lines include menu");
assert(/Grok Build/.test(tuiPlain), "TUI plain lines include product footer");

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

// Timing defaults target watchable demo (~18–22s)
const tim = api.DEFAULT_TIMING;
assert(!!tim && tim.charBaseMs >= 60, "char typing delay is watchable");
assert(tim.afterCommandMs >= 600, "pause after each command");
assert(tim.launchMs >= 1800, "launch beat is long enough");
assert(tim.tuiHoldMs >= 1500, "TUI hold is long enough");
const estMs =
  tim.startDelayMs +
  (18 + 16 + 4) * (tim.charBaseMs + tim.charJitterMs / 4) +
  3 * tim.afterCommandMs +
  tim.launchMs +
  tim.tuiHoldMs +
  tim.finalHoldMs;
assert(estMs >= 16000 && estMs <= 35000, "estimated full demo duration ~18–22s band (got " + Math.round(estMs) + "ms)");

// --- History accumulation: play() must keep mkdir AND cd on screen together ---
function makeHistoryRoot() {
  const children = [];
  const screen = {
    children,
    scrollTop: 0,
    get lastElementChild() {
      return children.length ? children[children.length - 1] : null;
    },
    appendChild(el) {
      children.push(el);
      return el;
    },
    append(...els) {
      els.forEach((e) => this.appendChild(e));
    },
    removeChild(el) {
      const i = children.indexOf(el);
      if (i >= 0) children.splice(i, 1);
      return el;
    },
    set innerHTML(v) {
      this._html = v;
      children.length = 0;
    },
    get innerHTML() {
      return children.map((c) => c.innerHTML || c.textContent || "").join("") || this._html || "";
    },
    get textContent() {
      return children.map((c) => c.textContent || "").join("\n");
    },
  };
  const root = {
    attrs: {},
    setAttribute(k, v) {
      this.attrs[k] = v;
    },
    querySelector(sel) {
      if (sel === "[data-mt-screen]") return screen;
      if (sel === "[data-mt-pause]") {
        return {
          disabled: false,
          textContent: "Pause",
          setAttribute() {},
          addEventListener() {},
        };
      }
      if (sel === "[data-mt-replay]") {
        return { disabled: false, addEventListener() {} };
      }
      return null;
    },
  };
  globalThis.document = {
    createElement() {
      const kids = [];
      const el = {
        className: "",
        _text: "",
        _html: "",
        parentNode: null,
        children: kids,
        get textContent() {
          if (kids.length) return kids.map((k) => k.textContent || "").join("");
          return this._text;
        },
        set textContent(v) {
          this._text = String(v);
          this._html = String(v);
        },
        get innerHTML() {
          return this._html;
        },
        set innerHTML(v) {
          this._html = String(v);
          this._text = String(v).replace(/<[^>]+>/g, "");
        },
        setAttribute() {},
        appendChild(child) {
          kids.push(child);
          child.parentNode = el;
          return child;
        },
      };
      return el;
    },
  };
  return { root, screen, children };
}

const hist = makeHistoryRoot();
const snapshots = {};
let tid = 0;
const queue = [];
const ctrlHist = api.createDemoController({
  root: hist.root,
  reducedMotion: false,
  // Tiny delays; flushAll drains the fake timer queue
  timing: {
    startDelayMs: 1,
    charBaseMs: 0,
    charJitterMs: 0,
    afterCommandMs: 1,
    launchMs: 1,
    tuiHoldMs: 1,
    finalHoldMs: 1,
  },
  onAfterCommand(cmd, screenText) {
    snapshots[cmd] = screenText;
  },
  setTimeout(fn, ms) {
    const id = ++tid;
    queue.push({ id, fn, ms: ms || 0 });
    return id;
  },
  clearTimeout(id) {
    const i = queue.findIndex((p) => p.id === id);
    if (i >= 0) queue.splice(i, 1);
  },
});

// Track parentNode on append for removeChild of idle prompt
const _append = hist.screen.appendChild.bind(hist.screen);
hist.screen.appendChild = function (el) {
  el.parentNode = hist.screen;
  return _append(el);
};

// Drain async typewriter using microtask + fake timers
async function flushAll(maxSteps = 8000) {
  for (let i = 0; i < maxSteps; i++) {
    if (!queue.length) {
      await Promise.resolve();
      await Promise.resolve();
      if (!queue.length) {
        // allow runSequence promise chain to schedule more waits
        await new Promise((r) => setImmediate(r));
        if (!queue.length) break;
      }
    }
    const job = queue.shift();
    job.fn();
  }
}

await (async () => {
  ctrlHist.play();
  await flushAll();
})();

assert(!!snapshots["mkdir grok-projects"], "snapshot after mkdir");
assert(!!snapshots["cd grok-projects"], "snapshot after cd");
const afterCd = snapshots["cd grok-projects"] || "";
assert(
  afterCd.includes("mkdir grok-projects") && afterCd.includes("cd grok-projects"),
  "after cd, screen still shows mkdir AND cd (history not wiped)"
);
const afterGrok = snapshots["grok"] || "";
assert(
  afterGrok.includes("mkdir grok-projects") &&
    afterGrok.includes("cd grok-projects") &&
    /\bgrok\b/.test(afterGrok),
  "after grok, all three commands still visible before TUI"
);

// getScreenText API exists on controller
assert(typeof ctrlHist.getScreenText === "function", "getScreenText exported on controller");

if (failed) {
  console.error(`\n${failed} failure(s)`);
  process.exit(1);
}
console.log("\nALL MOCK TERMINAL UNIT TESTS PASSED");
process.exit(0);
