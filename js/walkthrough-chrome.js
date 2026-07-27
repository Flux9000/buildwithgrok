/**
 * Build With Grok — walkthrough phase chrome (spy, badges, next incomplete).
 * Pure helpers dual-exported for Node unit tests + browser mount.
 * Consumes the same phase map as progress-core (phases 0–5); does not store state.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.GROK_WALKTHROUGH_CHROME = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const DEFAULT_PHASES = ["0", "1", "2", "3", "4", "5"];

  function normalizePhaseIds(requiredPhases) {
    if (!Array.isArray(requiredPhases) || requiredPhases.length === 0) {
      return DEFAULT_PHASES.slice();
    }
    return requiredPhases.map(String);
  }

  function normalizePhaseMap(phaseMap) {
    if (!phaseMap || typeof phaseMap !== "object") return {};
    const out = {};
    for (const k of Object.keys(phaseMap)) {
      if (phaseMap[k]) out[String(k)] = true;
    }
    return out;
  }

  /**
   * Count completed required phases.
   * @param {string[]} requiredPhases
   * @param {Record<string, boolean>} phaseMap
   */
  function countDone(requiredPhases, phaseMap) {
    const req = normalizePhaseIds(requiredPhases);
    const map = normalizePhaseMap(phaseMap);
    return req.filter((id) => !!map[id]).length;
  }

  /**
   * First incomplete required phase id, or null if all complete.
   */
  function nextIncompletePhase(requiredPhases, phaseMap) {
    const req = normalizePhaseIds(requiredPhases);
    const map = normalizePhaseMap(phaseMap);
    for (const id of req) {
      if (!map[id]) return id;
    }
    return null;
  }

  /**
   * Badge state per phase: "done" | "current" | "todo"
   * current = next incomplete only (one at a time).
   */
  function badgeStates(requiredPhases, phaseMap) {
    const req = normalizePhaseIds(requiredPhases);
    const map = normalizePhaseMap(phaseMap);
    const next = nextIncompletePhase(req, map);
    const states = {};
    for (const id of req) {
      if (map[id]) states[id] = "done";
      else if (next !== null && id === next) states[id] = "current";
      else states[id] = "todo";
    }
    return states;
  }

  /**
   * Human spy labels from the same phase map progress-core uses.
   * @returns {{
   *   done: number,
   *   total: number,
   *   nextId: string|null,
   *   allComplete: boolean,
   *   spyLabel: string,
   *   spyShort: string,
   *   badges: Record<string, "done"|"current"|"todo">,
   *   badgeLabel: (state: string) => string
   * }}
   */
  function computePhaseChrome(requiredPhases, phaseMap) {
    const req = normalizePhaseIds(requiredPhases);
    const map = normalizePhaseMap(phaseMap);
    const total = req.length;
    const done = countDone(req, map);
    const nextId = nextIncompletePhase(req, map);
    const allComplete = nextId === null && total > 0;
    const badges = badgeStates(req, map);

    let spyLabel;
    if (total === 0) {
      spyLabel = "No phases";
    } else if (allComplete) {
      spyLabel = `Phase ${total} of ${total} · complete`;
    } else {
      // next incomplete phase id is the learner's current work (0–5)
      spyLabel = `Phase ${nextId} of ${total}`;
    }
    const spyShort = `${done} / ${total}`;

    function badgeLabel(state) {
      if (state === "done") return "Done";
      if (state === "current") return "You are here";
      return "To do";
    }

    return {
      done,
      total,
      nextId,
      allComplete,
      spyLabel,
      spyShort,
      badges,
      badgeLabel,
      requiredPhases: req,
    };
  }

  /**
   * HTML for sticky phase spy (no DOM).
   */
  function spyHTML(chrome) {
    if (!chrome || !chrome.total) return "";
    const completeClass = chrome.allComplete ? " is-complete" : "";
    const nextLine = chrome.allComplete
      ? "All phases checked — walkthrough complete."
      : `Next: Phase ${chrome.nextId} · ${chrome.spyShort} done`;
    return `<div class="wt-phase-spy${completeClass}" data-walkthrough-spy role="status" aria-live="polite">
  <div class="wt-phase-spy-main">
    <span class="wt-phase-spy-label">${escapeHtml(chrome.spyLabel)}</span>
    <span class="wt-phase-spy-count">${escapeHtml(chrome.spyShort)}</span>
  </div>
  <p class="wt-phase-spy-next">${escapeHtml(nextLine)}</p>
  <ol class="wt-phase-spy-dots" aria-label="Phase progress">
    ${chrome.requiredPhases
      .map((id) => {
        const st = chrome.badges[id] || "todo";
        return `<li class="wt-spy-dot is-${st}" data-spy-phase="${escapeAttr(id)}" title="Phase ${escapeAttr(id)}: ${escapeAttr(chrome.badgeLabel(st))}"><span>${escapeHtml(id)}</span></li>`;
      })
      .join("")}
  </ol>
</div>`;
  }

  /**
   * HTML for a single phase badge.
   */
  function badgeHTML(phaseId, state, badgeLabelFn) {
    const label = typeof badgeLabelFn === "function" ? badgeLabelFn(state) : state;
    return `<span class="wt-phase-badge is-${escapeAttr(state)}" data-phase-badge="${escapeAttr(String(phaseId))}" data-badge-state="${escapeAttr(state)}">${escapeHtml(label)}</span>`;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  return {
    DEFAULT_PHASES,
    normalizePhaseIds,
    normalizePhaseMap,
    countDone,
    nextIncompletePhase,
    badgeStates,
    computePhaseChrome,
    spyHTML,
    badgeHTML,
  };
});
