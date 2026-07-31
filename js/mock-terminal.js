/**
 * Hub mock macOS Terminal demo — pure sequence + thin DOM driver.
 * Dual-export: browser via window.GROK_MOCK_TERMINAL; Node via module.exports.
 */
(function (root) {
  "use strict";

  const PROMPT_HOME = "user@mac ~ % ";
  const PROMPT_PROJ = "user@mac grok-projects % ";
  const CMD_MKDIR = "mkdir grok-projects";
  const CMD_CD = "cd grok-projects";
  const CMD_GROK = "grok";
  const LAUNCH_LINE = "Launching Grok Build…";
  const FINAL_SIM =
    "This is a simulation. After you install, run these exact commands to start.";
  const SIM_LABEL =
    "This is a simulation — Install Grok Build to try these exact commands.";

  /** Ordered demo steps (data only — testable without DOM). */
  const DEMO_SEQUENCE = [
    { id: "prompt", kind: "prompt", text: PROMPT_HOME },
    { id: "type-mkdir", kind: "type", prompt: PROMPT_HOME, command: CMD_MKDIR },
    { id: "type-cd", kind: "type", prompt: PROMPT_HOME, command: CMD_CD },
    { id: "type-grok", kind: "type", prompt: PROMPT_PROJ, command: CMD_GROK },
    { id: "launch", kind: "status", text: LAUNCH_LINE },
    { id: "tui", kind: "tui" },
    { id: "final", kind: "final", text: FINAL_SIM },
  ];

  const COMMAND_STRINGS = [CMD_MKDIR, CMD_CD, CMD_GROK];

  /** Default happy-path timing (~18–22s with real commands). Overridable in tests. */
  const DEFAULT_TIMING = {
    startDelayMs: 1000,
    charBaseMs: 110,
    charJitterMs: 28,
    afterCommandMs: 1400,
    launchMs: 3200,
    tuiHoldMs: 3000,
    finalHoldMs: 600,
  };

  function prefersReducedMotion(win) {
    const w = win || (typeof window !== "undefined" ? window : null);
    if (!w || !w.matchMedia) return false;
    try {
      return !!w.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (_) {
      return false;
    }
  }

  function getFinalStateLines() {
    return [
      { cls: "mt-line mt-dim", text: PROMPT_HOME + CMD_MKDIR },
      { cls: "mt-line mt-dim", text: PROMPT_HOME + CMD_CD },
      { cls: "mt-line mt-dim", text: PROMPT_PROJ + CMD_GROK },
      { cls: "mt-line mt-status", text: LAUNCH_LINE },
      { cls: "mt-tui-banner", text: "Grok Build" },
      { cls: "mt-tui-status", text: "Ready · project: grok-projects" },
      {
        cls: "mt-line mt-prompt-line",
        text: "› ",
        cursor: true,
      },
      { cls: "mt-line mt-final", text: FINAL_SIM },
    ];
  }

  /**
   * @param {object} opts
   * @param {HTMLElement} opts.root - [data-mock-terminal]
   * @param {boolean} [opts.reducedMotion]
   * @param {() => number} [opts.now]
   * @param {(fn: Function, ms: number) => any} [opts.setTimeout]
   * @param {(id: any) => void} [opts.clearTimeout]
   */
  function createDemoController(opts) {
    const o = opts || {};
    const root = o.root;
    const setTimeoutFn = o.setTimeout || setTimeout;
    const clearTimeoutFn = o.clearTimeout || clearTimeout;
    const reduced =
      typeof o.reducedMotion === "boolean"
        ? o.reducedMotion
        : prefersReducedMotion();
    const timing = Object.assign({}, DEFAULT_TIMING, o.timing || {});
    // Snapshot hooks for tests (e.g. capture history mid-play)
    const onAfterCommand = typeof o.onAfterCommand === "function" ? o.onAfterCommand : null;

    let paused = false;
    let running = false;
    let finished = false;
    let timerIds = [];
    let abort = false;
    let phase = "idle";

    const screen = root && root.querySelector("[data-mt-screen]");
    const pauseBtn = root && root.querySelector("[data-mt-pause]");
    const replayBtn = root && root.querySelector("[data-mt-replay]");

    function clearTimers() {
      timerIds.forEach((id) => clearTimeoutFn(id));
      timerIds = [];
    }

    function wait(ms) {
      return new Promise((resolve) => {
        const id = setTimeoutFn(() => {
          timerIds = timerIds.filter((t) => t !== id);
          resolve();
        }, ms);
        timerIds.push(id);
      });
    }

    async function waitWhilePaused() {
      while (paused && !abort) {
        await wait(80);
      }
    }

    function setButtons() {
      if (pauseBtn) {
        pauseBtn.disabled = finished || reduced;
        pauseBtn.textContent = paused ? "Resume" : "Pause";
        pauseBtn.setAttribute("aria-pressed", paused ? "true" : "false");
      }
      if (replayBtn) {
        replayBtn.disabled = false;
      }
    }

    function renderLines(lines) {
      if (!screen) return;
      screen.innerHTML = "";
      lines.forEach((line) => {
        const div = document.createElement("div");
        div.className = line.cls || "mt-line";
        if (line.cursor) {
          div.innerHTML =
            '<span class="mt-prompt-char">' +
            escapeHtml(line.text || "› ") +
            '</span><span class="mt-cursor" aria-hidden="true"></span>';
        } else {
          div.textContent = line.text || "";
        }
        screen.appendChild(div);
      });
      screen.scrollTop = screen.scrollHeight;
    }

    /** Plain-text snapshot of screen (for tests + a11y dumps). */
    function getScreenText() {
      if (!screen) return "";
      if (screen.children && screen.children.length) {
        return Array.prototype.map
          .call(screen.children, (el) => el.textContent || "")
          .join("\n");
      }
      return (screen.textContent || screen.innerHTML || "").replace(/<[^>]+>/g, " ");
    }

    function escapeHtml(s) {
      return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    function appendLineEl(className, htmlOrText, asHtml) {
      if (!screen) return null;
      const div = document.createElement("div");
      div.className = className || "mt-line";
      if (asHtml) div.innerHTML = htmlOrText;
      else div.textContent = htmlOrText;
      screen.appendChild(div);
      screen.scrollTop = screen.scrollHeight;
      return div;
    }

    function applyFinalState() {
      phase = "final";
      finished = true;
      running = false;
      paused = false;
      renderLines(getFinalStateLines());
      if (root) root.setAttribute("data-mt-state", "final");
      setButtons();
    }

    /**
     * Type a command on a NEW line (appends — never wipes prior history).
     */
    async function typeCommand(prompt, command) {
      if (!screen) return;
      let typed = "";
      const line = document.createElement("div");
      line.className = "mt-line";
      line.innerHTML =
        '<span class="mt-prompt">' +
        escapeHtml(prompt) +
        '</span><span class="mt-cmd"></span><span class="mt-cursor" aria-hidden="true"></span>';
      screen.appendChild(line);
      screen.scrollTop = screen.scrollHeight;

      for (let i = 0; i < command.length; i++) {
        await waitWhilePaused();
        if (abort) return;
        typed += command[i];
        line.innerHTML =
          '<span class="mt-prompt">' +
          escapeHtml(prompt) +
          '</span><span class="mt-cmd">' +
          escapeHtml(typed) +
          '</span><span class="mt-cursor" aria-hidden="true"></span>';
        const delay = reduced
          ? 0
          : timing.charBaseMs + (i % 3) * Math.floor(timing.charJitterMs / 2);
        await wait(delay);
      }
      await waitWhilePaused();
      if (abort) return;
      line.innerHTML =
        '<span class="mt-prompt">' +
        escapeHtml(prompt) +
        '</span><span class="mt-cmd">' +
        escapeHtml(command) +
        "</span>";
      await wait(reduced ? 0 : timing.afterCommandMs);
      if (onAfterCommand) {
        try {
          onAfterCommand(command, getScreenText());
        } catch (_) {
          /* ignore test hook errors */
        }
      }
    }

    async function runSequence() {
      abort = false;
      finished = false;
      running = true;
      paused = false;
      phase = "playing";
      if (root) root.setAttribute("data-mt-state", "playing");
      setButtons();
      if (!screen) {
        applyFinalState();
        return;
      }
      screen.innerHTML = "";

      if (reduced) {
        applyFinalState();
        return;
      }

      // Initial empty prompt (will remain above typed history if we leave it —
      // remove it when first command starts by only showing blinking prompt briefly)
      const idle = appendLineEl(
        "mt-line",
        '<span class="mt-prompt">' +
          escapeHtml(PROMPT_HOME) +
          '</span><span class="mt-cursor" aria-hidden="true"></span>',
        true
      );
      await wait(timing.startDelayMs);
      await waitWhilePaused();
      if (abort) return;
      // Drop idle prompt line so history is only real commands
      if (idle && idle.parentNode === screen) {
        // removeChild may be missing on fakes — clear via re-filter
        if (typeof screen.removeChild === "function") {
          screen.removeChild(idle);
        } else if (screen.children) {
          const idx = screen.children.indexOf(idle);
          if (idx >= 0) screen.children.splice(idx, 1);
        }
      }

      await typeCommand(PROMPT_HOME, CMD_MKDIR);
      if (abort) return;

      await typeCommand(PROMPT_HOME, CMD_CD);
      if (abort) return;

      await typeCommand(PROMPT_PROJ, CMD_GROK);
      if (abort) return;

      await waitWhilePaused();
      if (abort) return;
      // History still visible: mkdir + cd + grok lines above status
      appendLineEl(
        "mt-line mt-status",
        '<span class="mt-spinner" aria-hidden="true"></span> ' + escapeHtml(LAUNCH_LINE),
        true
      );
      await wait(timing.launchMs);
      await waitWhilePaused();
      if (abort) return;

      // TUI frame (replaces shell history — intentional transition after launch)
      screen.innerHTML = "";
      const banner = document.createElement("div");
      banner.className = "mt-tui-banner";
      banner.textContent = "Grok Build";
      const st = document.createElement("div");
      st.className = "mt-tui-status";
      st.textContent = "Ready · project: grok-projects";
      const ready = document.createElement("div");
      ready.className = "mt-line mt-prompt-line";
      ready.innerHTML =
        '<span class="mt-prompt-char">› </span><span class="mt-cursor" aria-hidden="true"></span>';
      if (typeof screen.append === "function") screen.append(banner, st, ready);
      else {
        screen.appendChild(banner);
        screen.appendChild(st);
        screen.appendChild(ready);
      }
      await wait(timing.tuiHoldMs);
      await waitWhilePaused();
      if (abort) return;

      appendLineEl("mt-line mt-final", FINAL_SIM, false);
      await wait(timing.finalHoldMs);

      finished = true;
      running = false;
      phase = "final";
      if (root) root.setAttribute("data-mt-state", "final");
      setButtons();
    }

    function play() {
      if (running && !paused) return;
      if (finished) {
        replay();
        return;
      }
      if (paused) {
        paused = false;
        setButtons();
        return;
      }
      clearTimers();
      abort = false;
      runSequence();
    }

    function pause() {
      if (finished || reduced) return;
      paused = !paused;
      setButtons();
    }

    function replay() {
      clearTimers();
      abort = true;
      paused = false;
      finished = false;
      running = false;
      // allow abort to settle
      const id = setTimeoutFn(() => {
        abort = false;
        runSequence();
      }, 30);
      timerIds.push(id);
      setButtons();
    }

    function destroy() {
      abort = true;
      clearTimers();
    }

    function getState() {
      return {
        paused,
        running,
        finished,
        phase,
        reducedMotion: reduced,
        timing: Object.assign({}, timing),
      };
    }

    // Wire buttons once
    if (pauseBtn && !pauseBtn._mtBound) {
      pauseBtn._mtBound = true;
      pauseBtn.addEventListener("click", () => pause());
    }
    if (replayBtn && !replayBtn._mtBound) {
      replayBtn._mtBound = true;
      replayBtn.addEventListener("click", () => replay());
    }

    if (reduced) {
      applyFinalState();
    }

    return {
      play,
      pause,
      replay,
      applyFinalState,
      getState,
      getScreenText,
      destroy,
      COMMAND_STRINGS,
      DEMO_SEQUENCE,
      DEFAULT_TIMING,
    };
  }

  /**
   * Mount on hub: observe viewport and auto-play once.
   * @param {ParentNode} [doc]
   * @param {Window} [win]
   */
  function mountMockTerminal(doc, win) {
    const d = doc || (typeof document !== "undefined" ? document : null);
    const w = win || (typeof window !== "undefined" ? window : null);
    if (!d) return null;
    const root = d.querySelector("[data-mock-terminal]");
    if (!root) return null;

    const reduced = prefersReducedMotion(w);
    const controller = createDemoController({ root, reducedMotion: reduced });

    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      if (reduced) {
        controller.applyFinalState();
      } else {
        // brief delay so layout settles
        setTimeout(() => controller.play(), 350);
      }
    };

    if (w && "IntersectionObserver" in w) {
      const io = new w.IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              start();
              io.disconnect();
            }
          });
        },
        { threshold: 0.25 }
      );
      io.observe(root);
    } else {
      start();
    }

    return controller;
  }

  const api = {
    DEMO_SEQUENCE,
    COMMAND_STRINGS,
    DEFAULT_TIMING,
    PROMPT_HOME,
    PROMPT_PROJ,
    CMD_MKDIR,
    CMD_CD,
    CMD_GROK,
    LAUNCH_LINE,
    FINAL_SIM,
    SIM_LABEL,
    prefersReducedMotion,
    getFinalStateLines,
    createDemoController,
    mountMockTerminal,
  };

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.GROK_MOCK_TERMINAL = api;
})(typeof window !== "undefined" ? window : globalThis);
