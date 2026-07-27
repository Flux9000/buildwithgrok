/**
 * Build With Grok — pure progress logic (Phase 1).
 * Opened ≠ completed. Injectable storage for Node unit tests.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.GROK_PROGRESS_CORE = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const STORAGE_KEY = "grok-academy-progress-v2";
  const LEGACY_KEY = "grok-academy-progress-v1";

  /** Required phase ids for walkthrough overall-complete */
  const WALKTHROUGH_PHASES = {
    "wt-game": ["0", "1", "2", "3", "4", "5"],
    "wt-app": ["0", "1", "2", "3", "4", "5"],
  };

  function emptyState() {
    return { opened: {}, completed: {}, phases: {} };
  }

  function normalizeState(raw) {
    if (!raw || typeof raw !== "object") return emptyState();
    // Legacy v1: { pageId: true } meant opened only
    if (!raw.opened && !raw.completed && !raw.phases) {
      const opened = {};
      for (const k of Object.keys(raw)) {
        if (raw[k]) opened[k] = true;
      }
      return { opened, completed: {}, phases: {} };
    }
    return {
      opened: raw.opened && typeof raw.opened === "object" ? { ...raw.opened } : {},
      completed: raw.completed && typeof raw.completed === "object" ? { ...raw.completed } : {},
      phases: raw.phases && typeof raw.phases === "object" ? JSON.parse(JSON.stringify(raw.phases)) : {},
    };
  }

  function createMemoryStorage(seed) {
    let data = seed || "";
    return {
      getItem(k) {
        return k === STORAGE_KEY || k === LEGACY_KEY ? data : null;
      },
      setItem(k, v) {
        if (k === STORAGE_KEY) data = String(v);
      },
      removeItem(k) {
        if (k === STORAGE_KEY || k === LEGACY_KEY) data = "";
      },
    };
  }

  /**
   * @param {{ pageOrder: string[], storage?: Storage, storageKey?: string }} opts
   * pageOrder = curriculum lesson ids in order
   */
  function createProgressAPI(opts) {
    const pageOrder = opts.pageOrder || [];
    const storageKey = opts.storageKey || STORAGE_KEY;
    const storage =
      opts.storage ||
      (typeof localStorage !== "undefined" ? localStorage : createMemoryStorage());

    function read() {
      try {
        let raw = storage.getItem(storageKey);
        if (!raw) {
          const legacy = storage.getItem(LEGACY_KEY);
          if (legacy) {
            const migrated = normalizeState(JSON.parse(legacy));
            write(migrated);
            try {
              storage.removeItem(LEGACY_KEY);
            } catch {
              /* ignore */
            }
            return migrated;
          }
          return emptyState();
        }
        return normalizeState(JSON.parse(raw));
      } catch {
        return emptyState();
      }
    }

    function write(state) {
      try {
        storage.setItem(storageKey, JSON.stringify(state));
      } catch {
        /* private mode */
      }
      return state;
    }

    function isOpened(pageId) {
      const s = read();
      return !!(s.opened[pageId] || s.completed[pageId]);
    }

    function isCompleted(pageId) {
      if (WALKTHROUGH_PHASES[pageId]) {
        return isWalkthroughComplete(pageId);
      }
      return !!read().completed[pageId];
    }

    function markOpened(pageId) {
      if (!pageId) return read();
      const s = read();
      s.opened[pageId] = true;
      return write(s);
    }

    function markCompleted(pageId) {
      if (!pageId) return read();
      if (WALKTHROUGH_PHASES[pageId] && !isWalkthroughComplete(pageId)) {
        return read(); // refuse complete until phases done
      }
      const s = read();
      s.opened[pageId] = true;
      s.completed[pageId] = true;
      return write(s);
    }

    function unmarkCompleted(pageId) {
      if (!pageId) return read();
      const s = read();
      delete s.completed[pageId];
      return write(s);
    }

    function setPhaseComplete(walkthroughId, phaseId, complete) {
      const required = WALKTHROUGH_PHASES[walkthroughId];
      if (!required) return read();
      const s = read();
      if (!s.phases[walkthroughId]) s.phases[walkthroughId] = {};
      if (complete) s.phases[walkthroughId][String(phaseId)] = true;
      else delete s.phases[walkthroughId][String(phaseId)];
      s.opened[walkthroughId] = true;
      // Auto-complete walkthrough when all phases done
      if (isWalkthroughCompleteFromState(s, walkthroughId)) {
        s.completed[walkthroughId] = true;
      } else {
        delete s.completed[walkthroughId];
      }
      return write(s);
    }

    function getPhases(walkthroughId) {
      const s = read();
      return { ...(s.phases[walkthroughId] || {}) };
    }

    function isWalkthroughCompleteFromState(s, walkthroughId) {
      const required = WALKTHROUGH_PHASES[walkthroughId];
      if (!required) return !!s.completed[walkthroughId];
      const ph = s.phases[walkthroughId] || {};
      return required.every((id) => !!ph[id]);
    }

    function isWalkthroughComplete(walkthroughId) {
      return isWalkthroughCompleteFromState(read(), walkthroughId);
    }

    /**
     * First lesson in curriculum order that is not completed.
     * Returns { id, index } or null if all complete.
     */
    function nextIncomplete() {
      for (let i = 0; i < pageOrder.length; i++) {
        const id = pageOrder[i];
        if (!isCompleted(id)) return { id, index: i };
      }
      return null;
    }

    function progressStats() {
      const s = read();
      let opened = 0;
      let completed = 0;
      for (const id of pageOrder) {
        if (s.opened[id] || s.completed[id] || isCompleted(id)) opened++;
        if (isCompleted(id)) completed++;
      }
      return { opened, completed, total: pageOrder.length };
    }

    function resetProgress() {
      const empty = emptyState();
      write(empty);
      try {
        storage.removeItem(LEGACY_KEY);
      } catch {
        /* ignore */
      }
      return empty;
    }

    function getState() {
      return read();
    }

    return {
      STORAGE_KEY: storageKey,
      WALKTHROUGH_PHASES,
      emptyState,
      normalizeState,
      isOpened,
      isCompleted,
      markOpened,
      markCompleted,
      unmarkCompleted,
      setPhaseComplete,
      getPhases,
      isWalkthroughComplete,
      nextIncomplete,
      progressStats,
      resetProgress,
      getState,
    };
  }

  return {
    STORAGE_KEY,
    LEGACY_KEY,
    WALKTHROUGH_PHASES,
    emptyState,
    normalizeState,
    createMemoryStorage,
    createProgressAPI,
  };
});
