/**
 * Build With Grok — shared curriculum & layout injection
 * Order is intentional: learn basics → ship something → daily habits → power tools → mastery.
 */
window.GROK_ACADEMY = {
  title: "Build With Grok",
  tracks: [
    {
      id: "beginner",
      name: "Beginner",
      subtitle: "Learn the basics",
      color: "cyan",
      pages: [
        { id: "glossary", href: "00-glossary.html", title: "Words You’ll See", time: "10 min", blurb: "Plain meanings for every important word", keywords: ["glossary", "definitions", "vocabulary", "terms"] },
        { id: "start", href: "01-getting-started.html", title: "Getting Started", time: "25 min", blurb: "Install Grok, sign in, prove it works", keywords: ["install", "signup", "login", "setup"] },
        { id: "first", href: "02-first-session.html", title: "Your First Session", time: "30 min", blurb: "Send a goal, approve tools, check the result", keywords: ["first chat", "approve", "tools", "@files"] },
        { id: "tui", href: "03-tui-mastery.html", title: "The Grok Screen", time: "20 min", blurb: "History above, typing box below", keywords: ["tui", "terminal ui", "layout", "screen"] },
        { id: "keys", href: "04-keyboard.html", title: "Keyboard Basics", time: "15 min", blurb: "The few keys you need every day", keywords: ["shortcuts", "hotkeys", "ctrl", "escape"] },
      ],
    },
    {
      id: "ship",
      name: "First ship",
      subtitle: "Build a real mini project",
      color: "green",
      pages: [
        { id: "games", href: "17-building-games.html", title: "How Game Projects Work", time: "12 min", blurb: "What a small complete game piece looks like—before the full walkthrough", keywords: ["game", "sprite", "canvas", "vertical slice"] },
        { id: "wt-game", href: "21-walkthrough-first-game.html", title: "Walkthrough: First Game", time: "60 min", blurb: "Build Star Clicker Arena step by step", keywords: ["star clicker", "walkthrough", "ship game"] },
        { id: "apps", href: "18-building-apps.html", title: "How App Projects Work", time: "12 min", blurb: "Map the user steps—before the full walkthrough", keywords: ["app", "ui", "journey", "web app"] },
        { id: "wt-app", href: "22-walkthrough-first-app.html", title: "Walkthrough: First App", time: "60 min", blurb: "Build Focus List step by step", keywords: ["focus list", "walkthrough", "ship app"] },
      ],
    },
    {
      id: "intermediate",
      name: "Intermediate",
      subtitle: "Daily habits after your first ship",
      color: "violet",
      pages: [
        { id: "git", href: "24-day2-git.html", title: "Day-2 Git with Grok", time: "20 min", blurb: "Status, diff, and safe commits after your first ship", keywords: ["git", "commit", "diff", "status", "day-2", "day2", "repository", "stage", "version control"] },
        { id: "commands", href: "05-slash-commands.html", title: "Slash Commands", time: "30 min", blurb: "Commands that control Grok (start with /)", keywords: ["slash", "/help", "/compact", "commands", "/delete", "/undo", "/gboom", "easter egg"], verified: "2026-08-07", reviewEveryDays: 60 },
        { id: "tools", href: "06-tools.html", title: "Built-in Tools", time: "20 min", blurb: "What Grok can do on your computer", keywords: ["edit", "bash", "web search", "shell"] },
        { id: "sessions", href: "07-sessions-memory.html", title: "Sessions & Memory", time: "20 min", blurb: "Save chats, free space, optional memory", keywords: ["compact", "resume", "context", "memory", "/delete", "/undo"] },
        { id: "safety", href: "08-permissions-safety.html", title: "Permissions & Safety", time: "25 min", blurb: "Three safety layers, explained simply", keywords: ["sandbox", "permissions", "allow", "deny", "always-approve", "always allow", "yolo", "ask mode", "auto mode", "os sandbox"], verified: "2026-08-07", reviewEveryDays: 60 },
        { id: "config", href: "09-configuration.html", title: "Configuration", time: "15 min", blurb: "Settings you might change later", keywords: ["settings", "config", "theme", "model"] },
        { id: "prompts", href: "19-prompt-craft.html", title: "Prompt Craft", time: "20 min", blurb: "Write goals Grok can follow every time", keywords: ["prompt", "goals", "instructions"] },
      ],
    },
    {
      id: "advanced",
      name: "Advanced",
      subtitle: "Full power—after you ship",
      color: "amber",
      pages: [
        { id: "rules", href: "10-project-rules.html", title: "Project Rules", time: "15 min", blurb: "AGENTS.md so you stop repeating yourself", keywords: ["AGENTS.md", "project rules", "conventions"] },
        { id: "skills", href: "11-skills-plugins-hooks.html", title: "Skills, Plugins & Hooks", time: "25 min", blurb: "Saved playbooks, installable packs, and automatic scripts", keywords: ["skills", "plugins", "hooks", "SKILL.md", "user-invocable", "resume-claude", "resume-codex", "resume-cursor", "folder trust"], verified: "2026-08-08", reviewEveryDays: 90 },
        { id: "plan", href: "12-plan-mode.html", title: "Plan Mode", time: "15 min", blurb: "Approve a plan before big code changes", keywords: ["plan", "design", "approve plan"], verified: "2026-08-07", reviewEveryDays: 90 },
        { id: "agents", href: "13-subagents.html", title: "Subagents & Personas", time: "15 min", blurb: "Helper chats that research or work in parallel", keywords: ["subagent", "explore", "parallel", "personas"], verified: "2026-08-07", reviewEveryDays: 90 },
        { id: "mcp", href: "14-mcp.html", title: "MCP Integrations", time: "20 min", blurb: "Connect Grok to other apps you trust", keywords: ["mcp", "model context protocol", "integrations", "servers", "tools servers"], verified: "2026-08-07", reviewEveryDays: 60 },
        { id: "auto", href: "15-automation.html", title: "Headless & Agent Mode", time: "25 min", blurb: "Run Grok from scripts or inside your editor", keywords: ["headless", "ci", "acp", "max-turns", "agent mode", "yolo"], verified: "2026-08-07", reviewEveryDays: 60 },
        { id: "workflows", href: "16-workflows-goals.html", title: "Workflows, Goals & Loops", time: "20 min", blurb: "Timers, long goals, and multi-agent runs", keywords: ["workflow", "goal", "loop", "deep-research", "rhai"], verified: "2026-08-07", reviewEveryDays: 60 },
        { id: "dashboard", href: "23-dashboard-multisession.html", title: "Dashboard & Multi-Session", time: "15 min", blurb: "Several Grok chats at once—kept organized", keywords: ["dashboard", "multi-session", "worktree", "parallel chats", "/delete", "/agents-dashboard"], verified: "2026-08-07", reviewEveryDays: 60 },
      ],
    },
    {
      id: "mastery",
      name: "Mastery",
      subtitle: "Keep getting better",
      color: "cyan",
      pages: [
        { id: "master", href: "20-mastery.html", title: "Path to Mastery", time: "15 min", blurb: "Weekly practice plus a simple final check", keywords: ["mastery", "practice", "exam"] },
        { id: "cheat", href: "cheatsheet.html", title: "Master Cheatsheet", time: "ref", blurb: "Quick lookup while you work", keywords: ["cheatsheet", "reference", "shortcuts list"] },
      ],
    },
  ],
};

window.GROK_ACADEMY.flatPages = function flatPages() {
  const out = [];
  for (const track of this.tracks) {
    for (const p of track.pages) out.push({ ...p, track });
  }
  return out;
};

window.GROK_ACADEMY.findPage = function findPage(id) {
  return this.flatPages().find((p) => p.id === id) || null;
};

window.GROK_ACADEMY.neighbors = function neighbors(id) {
  const pages = this.flatPages();
  const i = pages.findIndex((p) => p.id === id);
  return {
    prev: i > 0 ? pages[i - 1] : null,
    next: i >= 0 && i < pages.length - 1 ? pages[i + 1] : null,
    index: i,
    total: pages.length,
  };
};

window.GROK_ACADEMY.base = function base() {
  const path = location.pathname.replace(/\\/g, "/");
  return path.includes("/pages/") ? ".." : ".";
};

window.GROK_ACADEMY.pageHref = function pageHref(href) {
  const b = this.base();
  if (b === ".") return `pages/${href}`;
  return href;
};

window.GROK_ACADEMY.homeHref = function homeHref() {
  return this.base() === "." ? "index.html" : "../index.html";
};

window.GROK_ACADEMY.asset = function asset(name) {
  return `${this.base()}/assets/${name}`;
};

/** Phase-1 progress: opened vs completed (progress-core.js must load first). */
window.GROK_ACADEMY._progressApi = null;

window.GROK_ACADEMY.progress = function progress() {
  if (!this._progressApi) {
    const core = globalThis.GROK_PROGRESS_CORE;
    if (!core) {
      console.warn("GROK_PROGRESS_CORE missing — load progress-core.js before curriculum.js");
      return null;
    }
    const pageOrder = this.flatPages().map((p) => p.id);
    this._progressApi = core.createProgressAPI({ pageOrder });
  }
  return this._progressApi;
};

/** Legacy: map of opened ids (for hub path-list compatibility). */
window.GROK_ACADEMY.getProgress = function getProgress() {
  const api = this.progress();
  if (!api) return {};
  const s = api.getState();
  const map = {};
  for (const id of Object.keys(s.opened || {})) if (s.opened[id]) map[id] = true;
  for (const id of Object.keys(s.completed || {})) if (s.completed[id]) map[id] = true;
  // walkthroughs completed via phases
  for (const id of Object.keys(coreWalkthroughIds())) {
    if (api.isCompleted(id)) map[id] = true;
  }
  return map;
};

function coreWalkthroughIds() {
  const core = globalThis.GROK_PROGRESS_CORE;
  return (core && core.WALKTHROUGH_PHASES) || {};
}

window.GROK_ACADEMY.markProgress = function markProgress(pageId) {
  const api = this.progress();
  if (!api) return {};
  api.markOpened(pageId);
  return this.getProgress();
};

window.GROK_ACADEMY.markCompleted = function markCompleted(pageId) {
  const api = this.progress();
  if (!api) return false;
  api.markCompleted(pageId);
  return api.isCompleted(pageId);
};

window.GROK_ACADEMY.isCompleted = function isCompleted(pageId) {
  const api = this.progress();
  return api ? api.isCompleted(pageId) : false;
};

window.GROK_ACADEMY.nextIncomplete = function nextIncomplete() {
  const api = this.progress();
  if (!api) return null;
  const n = api.nextIncomplete();
  if (!n) return null;
  const page = this.findPage(n.id);
  if (!page) return null;
  return { ...page, index: n.index };
};

window.GROK_ACADEMY.progressStats = function progressStats() {
  const api = this.progress();
  if (!api) {
    const total = this.flatPages().length;
    return { opened: 0, completed: 0, done: 0, total };
  }
  const s = api.progressStats();
  return { ...s, done: s.completed };
};

window.GROK_ACADEMY.resetProgress = function resetProgress() {
  const api = this.progress();
  if (api) api.resetProgress();
  this._progressApi = null; // recreate with fresh storage read
};

window.GROK_ACADEMY.mount = function mount(opts = {}) {
  const pageId = opts.pageId || null;
  const page = pageId ? this.findPage(pageId) : null;
  const { prev, next, index, total } = pageId
    ? this.neighbors(pageId)
    : { prev: null, next: this.flatPages()[0], index: -1, total: this.flatPages().length };

  const api = this.progress();
  if (pageId && api) api.markOpened(pageId);
  const stats = this.progressStats();

  if (!document.getElementById("scroll-progress")) {
    const bar = document.createElement("div");
    bar.id = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.prepend(bar);
  }

  if (!document.querySelector('link[rel="icon"]')) {
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    link.href = `${this.base()}/assets/favicon.svg`;
    document.head.appendChild(link);
  }

  const topHost = document.querySelector("[data-topnav]");
  if (topHost) {
    topHost.innerHTML = `
      <a class="nav-brand" href="${this.homeHref()}">
        <span class="brand-mark" aria-hidden="true"></span>
        <span class="brand-text">Build With Grok</span>
      </a>
      <div class="top-meta">
        <span class="progress-pill" title="Lessons marked complete (not merely opened)">
          <strong>${stats.completed}</strong> / ${stats.total} complete
        </span>
        ${page ? `<span class="top-track ${page.track.color}">${page.track.name}</span>
        <span class="top-progress">Lesson ${index + 1} / ${total}</span>` : `<span class="top-progress">Start here — no experience required</span>`}
      </div>
      <button class="nav-toggle" type="button" aria-label="Open curriculum" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    `;
  }

  // Full curriculum list for sidebar and/or mobile drawer (hub has no sidebar)
  let navListHtml = `<div class="side-head">
      <a href="${this.homeHref()}" class="side-home">← Home</a>
      <p class="side-label">Your path · ${stats.completed}/${stats.total} complete</p>
    </div>`;
  for (const track of this.tracks) {
    navListHtml += `<div class="side-track">
        <div class="side-track-name ${track.color}">${track.name}</div>
        <ul class="side-list">`;
    for (const p of track.pages) {
      const active = p.id === pageId ? " active" : "";
      const completed = api && api.isCompleted(p.id) ? " completed" : "";
      const opened = api && api.isOpened(p.id) && !(api && api.isCompleted(p.id)) ? " opened" : "";
      navListHtml += `<li><a class="side-link${active}${completed}${opened}" href="${this.pageHref(p.href)}">
          <span class="side-title">${p.title}</span>
          <span class="side-time">${p.time}</span>
        </a></li>`;
    }
    navListHtml += `</ul></div>`;
  }

  const sideHost = document.querySelector("[data-sidebar]");
  if (sideHost) {
    sideHost.innerHTML = navListHtml;
  }

  let drawer = document.querySelector(".nav-drawer");
  let overlay = document.querySelector(".nav-overlay");
  if (!drawer) {
    overlay = document.createElement("div");
    overlay.className = "nav-overlay";
    overlay.setAttribute("aria-hidden", "true");
    drawer = document.createElement("nav");
    drawer.className = "nav-drawer";
    drawer.setAttribute("aria-label", "Curriculum");
    document.body.append(overlay, drawer);
  }
  // Always fill drawer with full curriculum (homepage has no [data-sidebar])
  drawer.innerHTML = navListHtml;
  drawer.setAttribute("data-nav-drawer-filled", "curriculum");

  const pagerHost = document.querySelector("[data-pager]");
  if (pagerHost && page) {
    const isComplete = api && api.isCompleted(pageId);
    const isWt = !!(api && api.WALKTHROUGH_PHASES && api.WALKTHROUGH_PHASES[pageId]);
    let completeBtn = "";
    if (!isWt) {
      completeBtn = isComplete
        ? `<button type="button" class="btn btn-ghost complete-btn is-complete" data-complete-toggle data-page-id="${pageId}">Completed ✓</button>`
        : `<button type="button" class="btn btn-primary complete-btn" data-complete-toggle data-page-id="${pageId}">Mark lesson complete</button>`;
    } else {
      completeBtn = isComplete
        ? `<span class="complete-status is-complete">Walkthrough complete ✓ (all phases)</span>`
        : `<span class="complete-status">Complete all phases below to finish this walkthrough</span>`;
    }
    pagerHost.innerHTML = `
      <div class="lesson-complete-bar" data-lesson-complete>
        ${completeBtn}
        <p class="complete-hint">Opening a page only counts as <strong>opened</strong>. Mark complete after you finish the lab / Done when.</p>
      </div>
      <div class="pager">
        ${prev ? `<a class="pager-link prev" href="${this.pageHref(prev.href)}"><span class="pager-dir">Previous</span><span class="pager-title">${prev.title}</span></a>` : `<span class="pager-link prev disabled"></span>`}
        <a class="pager-home" href="${this.homeHref()}">All lessons</a>
        ${next ? `<a class="pager-link next" href="${this.pageHref(next.href)}"><span class="pager-dir">Next</span><span class="pager-title">${next.title}</span></a>` : `<span class="pager-link next disabled"></span>`}
      </div>
    `;
  }

  const heroMeta = document.querySelector("[data-lesson-meta]");
  if (heroMeta && page) {
    heroMeta.innerHTML = `
      <span class="lesson-track ${page.track.color}">${page.track.name}</span>
      <span class="lesson-time">${page.time === "ref" ? "Reference" : page.time + " read"}</span>
      <span class="lesson-pos">Lesson ${index + 1} of ${total}</span>
    `;
  }

  // Phase 3: last-verified ribbon (flag-heavy / stamped lessons only)
  this._injectVersionRibbon(page);

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  // Phase checkboxes on walkthroughs
  this._bindPhaseControls(pageId);
  this._bindCompleteButtons(pageId);
  // Phase 2: search / jump palette
  this._installSearchPalette();
  // A11y + perf: skip link, main landmark, lazy images, print chrome marks
  this._installA11yPerf();
  // Legal disclaimer + brand consistency in footers
  this._ensureFooterChrome();
};

/** Site-wide legal disclaimer (independent site; not affiliated with Grok/xAI/SpaceXAI). */
window.GROK_ACADEMY.LEGAL_DISCLAIMER_HTML =
  '<p class="site-disclaimer" data-legal-disclaimer>' +
  "<strong>Disclaimer:</strong> Build With Grok is an independent learning site at buildwithgrok.com. " +
  "It is <strong>not affiliated with, endorsed by, or an official product of</strong> Grok, xAI, or SpaceXAI. " +
  "“Grok Build” and related marks belong to their respective owners. Content is community-written teaching material and may lag product changes—verify with in-product <code>/docs</code>." +
  "</p>";

window.GROK_ACADEMY._ensureFooterChrome = function _ensureFooterChrome() {
  try {
    document.querySelectorAll(".site-footer").forEach((footer) => {
      // Brand heading if present
      footer.querySelectorAll("h3").forEach((h) => {
        if (/Grok Build Academy|Build With Grok|Academy/i.test(h.textContent || "")) {
          h.textContent = "Build With Grok";
        }
      });
      if (footer.querySelector("[data-legal-disclaimer]")) return;
      const wrap = document.createElement("div");
      wrap.className = "wrap footer-legal";
      wrap.innerHTML = this.LEGAL_DISCLAIMER_HTML;
      footer.appendChild(wrap);
    });
  } catch (err) {
    console.warn("footer chrome failed", err);
  }
};

/**
 * Local practice-due cue (browser-only; no accounts).
 * Returns a short message when the learner has completed something and has been away,
 * or when they have a completed ship lesson worth revisiting.
 * @returns {{ message: string, href: string, title: string }|null}
 */
/**
 * Hub primary CTA from progress (first-win funnel).
 * Empty progress (no completed lessons) → install / Getting Started.
 * Otherwise → true next incomplete lesson (or cheatsheet when path complete).
 *
 * @param {{ completed?: number, next?: { id?: string, href?: string, title?: string, track?: { name?: string } }|null, base?: string }} opts
 * @returns {{ href: string, label: string, heroLabel: string, title: string, descHtml: string, mode: "install"|"continue"|"complete" }}
 */
window.GROK_ACADEMY.resolveHubPrimaryCta = function resolveHubPrimaryCta(opts) {
  const o = opts || {};
  const completed = Number(o.completed) || 0;
  const next = o.next || null;
  // Hub is always at site root for pageHref of lessons
  const pagePrefix = o.base === ".." ? "" : "pages/";

  if (completed < 1) {
    return {
      mode: "install",
      href: `${pagePrefix}01-getting-started.html`,
      label: "Install Grok Build",
      heroLabel: "Install Grok Build",
      title: "Start here — install Grok Build",
      descHtml:
        "You have not marked any lesson complete yet. <strong>First win:</strong> install Grok, sign in, and prove it works in Getting Started. (Glossary is optional.) Then First Session, then a ship walkthrough.",
    };
  }

  if (!next) {
    return {
      mode: "complete",
      href: `${pagePrefix}cheatsheet.html`,
      label: "Path complete — open cheatsheet",
      heroLabel: "Open cheatsheet",
      title: "Curriculum complete",
      descHtml:
        "You marked every lesson complete. Open the cheatsheet, or reset progress to start over.",
    };
  }

  const trackName = (next.track && next.track.name) || "";
  return {
    mode: "continue",
    href: `${pagePrefix}${next.href}`,
    label: `Continue: ${next.title}`,
    heroLabel: "Continue learning",
    title: "Continue learning",
    descHtml: `Next incomplete lesson: <strong>${next.title}</strong>${
      trackName ? ` (${trackName})` : ""
    }. Pages you only opened still count as incomplete until you mark them complete.`,
  };
};

/**
 * Smart Start view-model from local progress (zero vs has-progress).
 * Pure helper — unit-testable without DOM.
 *
 * @param {{ completed?: number, total?: number, next?: { id?: string, href?: string, title?: string }|null, base?: string }} opts
 * @returns {{ mode: "zero"|"continue"|"complete", headline: string, primaryLabel: string, primaryHref: string, progressLabel: string|null, reassurance: string|null, showSteps: boolean, viewPathHref: string }}
 */
window.GROK_ACADEMY.resolveSmartStartView = function resolveSmartStartView(opts) {
  const o = opts || {};
  const completed = Number(o.completed) || 0;
  const total = Number(o.total) || 26;
  const next = o.next || null;
  const pagePrefix = o.base === ".." ? "" : "pages/";
  const viewPathHref = "#path-journey";

  if (completed < 1) {
    return {
      mode: "zero",
      headline: "Start learning in three steps",
      // Label is a learning CTA — does not install software (lesson teaches install)
      primaryLabel: "Start Learning Now",
      primaryHref: `${pagePrefix}01-getting-started.html`,
      progressLabel: null,
      reassurance:
        "Takes about 2 hours total to ship your first project. We’ll guide you the whole way.",
      showSteps: true,
      viewPathHref,
    };
  }

  if (!next) {
    return {
      mode: "complete",
      headline: "Path complete",
      primaryLabel: "Open cheatsheet",
      primaryHref: `${pagePrefix}cheatsheet.html`,
      progressLabel: `${completed}/${total} complete`,
      reassurance: null,
      showSteps: false,
      viewPathHref,
    };
  }

  return {
    mode: "continue",
    headline: "Continue where you left off",
    primaryLabel: next.title || "Continue learning",
    primaryHref: `${pagePrefix}${next.href}`,
    progressLabel: `${completed}/${total} complete`,
    reassurance: null,
    showSteps: false,
    viewPathHref,
  };
};

/**
 * Status badge for a curriculum track on the hub journey map.
 * @param {{ trackId: string, completedIds?: string[], shipDone?: boolean, pageIds?: string[] }} opts
 * @returns {{ badge: string, badgeKind: string, locked: boolean, expandedDefault: boolean }}
 */
window.GROK_ACADEMY.resolveTrackJourneyStatus = function resolveTrackJourneyStatus(opts) {
  const o = opts || {};
  const trackId = o.trackId || "";
  const completedIds = o.completedIds || [];
  const pageIds = o.pageIds || [];
  const shipDone = !!o.shipDone;
  const doneSet = {};
  completedIds.forEach((id) => {
    doneSet[id] = true;
  });
  const allDone = pageIds.length > 0 && pageIds.every((id) => doneSet[id]);
  const anyDone = pageIds.some((id) => doneSet[id]);
  const openedSet = {};
  (o.openedIds || []).forEach((id) => {
    openedSet[id] = true;
  });
  const anyOpened = pageIds.some((id) => openedSet[id]);

  if (allDone) {
    return { badge: "Complete", badgeKind: "complete", locked: false, expandedDefault: false };
  }

  if (trackId === "beginner") {
    if (anyDone || anyOpened) {
      return { badge: "In progress", badgeKind: "progress", locked: false, expandedDefault: true };
    }
    return { badge: "Start here", badgeKind: "start", locked: false, expandedDefault: true };
  }

  if (trackId === "ship") {
    if (anyDone || anyOpened) {
      return { badge: "In progress", badgeKind: "progress", locked: false, expandedDefault: false };
    }
    return { badge: "Available", badgeKind: "available", locked: false, expandedDefault: false };
  }

  // intermediate / advanced / mastery soft-gate after first ship
  if (!shipDone) {
    return {
      badge: "Unlocks after first ship",
      badgeKind: "locked",
      locked: true,
      expandedDefault: false,
    };
  }
  if (anyDone || anyOpened) {
    return { badge: "In progress", badgeKind: "progress", locked: false, expandedDefault: false };
  }
  return { badge: "Available", badgeKind: "available", locked: false, expandedDefault: false };
};

window.GROK_ACADEMY.getPracticeDueCue = function getPracticeDueCue(opts) {
  const api = this.progress();
  if (!api) return null;
  const stats = api.progressStats();
  if (!stats || stats.completed < 1) return null;

  const storage =
    (opts && opts.storage) ||
    (typeof localStorage !== "undefined" ? localStorage : null);
  const now = (opts && opts.now) || Date.now();
  const KEY = "grok-academy-last-visit-ms";
  let last = 0;
  if (storage) {
    try {
      last = Number(storage.getItem(KEY) || 0) || 0;
      storage.setItem(KEY, String(now));
    } catch {
      /* ignore */
    }
  }
  const daysAway = last ? (now - last) / (24 * 60 * 60 * 1000) : 999;
  // Cue when returning after ~1 day, or always offer a gentle revisit if they completed a ship
  const pages = this.flatPages();
  const completedShip = pages.find(
    (p) =>
      (p.id === "wt-game" || p.id === "wt-app" || p.id === "games" || p.id === "apps") &&
      api.isCompleted(p.id)
  );
  const completedAny = pages.find((p) => api.isCompleted(p.id));
  const target = completedShip || completedAny;
  if (!target) return null;
  if (daysAway < 0.75 && !completedShip) return null;

  const href = this.pageHref(target.href);
  return {
    title: target.title,
    href,
    message: completedShip
      ? `Practice tip: open “${target.title}” again and re-check one Done when item.`
      : `Welcome back — quickly re-read “${target.title}” before your next lesson.`,
  };
};

window.GROK_ACADEMY._installA11yPerf = function _installA11yPerf() {
  const core = globalThis.GROK_A11Y_PERF;
  if (!core || typeof core.installA11yPerf !== "function") {
    console.warn("GROK_A11Y_PERF missing — load a11y-perf.js before curriculum.js");
    return null;
  }
  return core.installA11yPerf({ document });
};

/** Resolve last-verified stamp for a curriculum page (version-core.js). */
window.GROK_ACADEMY.resolveLessonStamp = function resolveLessonStamp(pageOrId, asOf) {
  const core = globalThis.GROK_VERSION_CORE;
  if (!core) return null;
  let page = pageOrId;
  if (typeof pageOrId === "string") page = this.findPage(pageOrId);
  return core.resolveStamp(page, asOf);
};

/**
 * Inject visible version ribbon under lesson header meta (not footer-only).
 * Missing stamp → remove any prior ribbon; never throws.
 */
window.GROK_ACADEMY._injectVersionRibbon = function _injectVersionRibbon(page) {
  try {
    // Remove previous injection (remount / page change)
    document.querySelectorAll("[data-version-ribbon]").forEach((el) => el.remove());
    if (!page) return;
    const core = globalThis.GROK_VERSION_CORE;
    if (!core) return;
    const stamp = core.resolveStamp(page);
    if (!stamp) return;
    const html = core.ribbonHTML(stamp);
    if (!html) return;

    const host = document.createElement("div");
    host.innerHTML = html.trim();
    const ribbon = host.firstElementChild;
    if (!ribbon) return;

    const lessonHeader = document.querySelector(".lesson-header");
    const heroMeta = document.querySelector("[data-lesson-meta]");
    const prose = document.querySelector("article.prose, .prose");
    if (heroMeta && heroMeta.parentElement) {
      heroMeta.insertAdjacentElement("afterend", ribbon);
    } else if (lessonHeader) {
      lessonHeader.appendChild(ribbon);
    } else if (prose) {
      prose.insertBefore(ribbon, prose.firstChild);
    } else {
      document.body.insertBefore(ribbon, document.body.firstChild);
    }
  } catch (err) {
    console.warn("version ribbon inject failed", err);
  }
};

/** Client-side lesson search + ⌘/Ctrl+K palette (search-core.js). */
window.GROK_ACADEMY._searchIndex = null;
window.GROK_ACADEMY._searchPalette = null;

window.GROK_ACADEMY.getSearchIndex = function getSearchIndex() {
  const core = globalThis.GROK_SEARCH_CORE;
  if (!core) return [];
  if (!this._searchIndex) {
    this._searchIndex = core.buildIndexFromAcademy(this);
  }
  return this._searchIndex;
};

window.GROK_ACADEMY.searchLessons = function searchLessons(query, opts) {
  const core = globalThis.GROK_SEARCH_CORE;
  if (!core) return [];
  return core.search(this.getSearchIndex(), query, opts);
};

window.GROK_ACADEMY._installSearchPalette = function _installSearchPalette() {
  const core = globalThis.GROK_SEARCH_CORE;
  if (!core || typeof core.installSearchPalette !== "function") {
    console.warn("GROK_SEARCH_CORE missing — load search-core.js before curriculum.js");
    return;
  }
  const academy = this;
  if (!this._searchPalette) {
    this._searchPalette = core.installSearchPalette({
      getIndex: () => academy.getSearchIndex(),
      getBase: () => academy.base(),
      search: (index, q, opts) => core.search(index, q, opts),
    });
  } else if (this._searchPalette.bindOpenControl) {
    this._searchPalette.bindOpenControl();
  }
};

window.GROK_ACADEMY._bindCompleteButtons = function _bindCompleteButtons(pageId) {
  const api = this.progress();
  if (!api) return;
  document.querySelectorAll("[data-complete-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-page-id") || pageId;
      if (api.isCompleted(id)) {
        api.unmarkCompleted(id);
      } else {
        api.markCompleted(id);
        if (!api.isCompleted(id) && api.WALKTHROUGH_PHASES[id]) {
          alert("Finish all walkthrough phases first. Checking every phase marks this walkthrough complete automatically.");
          return;
        }
      }
      // re-mount chrome
      this._progressApi = null;
      this.mount({ pageId });
      if (typeof window.GROK_ACADEMY_ON_PROGRESS === "function") {
        window.GROK_ACADEMY_ON_PROGRESS();
      }
    });
  });
};

window.GROK_ACADEMY._bindPhaseControls = function _bindPhaseControls(pageId) {
  const api = this.progress();
  if (!api || !pageId || !api.WALKTHROUGH_PHASES[pageId]) return;
  const phases = api.getPhases(pageId);
  document.querySelectorAll("[data-phase-complete]").forEach((el) => {
    const phaseId = String(el.getAttribute("data-phase-complete"));
    if (el.type === "checkbox") {
      el.checked = !!phases[phaseId];
      el.addEventListener("change", () => {
        api.setPhaseComplete(pageId, phaseId, el.checked);
        this._progressApi = null;
        this.mount({ pageId });
        if (typeof window.GROK_ACADEMY_ON_PROGRESS === "function") {
          window.GROK_ACADEMY_ON_PROGRESS();
        }
      });
    }
  });
  // update summary
  const summary = document.querySelector("[data-phase-summary]");
  if (summary) {
    const req = api.WALKTHROUGH_PHASES[pageId];
    const done = req.filter((id) => !!api.getPhases(pageId)[id]).length;
    summary.textContent = `Phases complete: ${done} / ${req.length}` +
      (api.isWalkthroughComplete(pageId) ? " — walkthrough complete ✓" : "");
  }
  // Walkthrough chrome: sticky spy, badges, prompt bundles (same phase map)
  this._installWalkthroughChrome(pageId);
};

/**
 * Phase spy + badges + prompt-bundle actions for ship walkthroughs.
 * State comes only from progress-core phase map (no second store).
 */
window.GROK_ACADEMY._installWalkthroughChrome = function _installWalkthroughChrome(pageId) {
  try {
    const api = this.progress();
    const chromeCore = globalThis.GROK_WALKTHROUGH_CHROME;
    if (!api || !chromeCore || !pageId || !api.WALKTHROUGH_PHASES[pageId]) return;

    const req = api.WALKTHROUGH_PHASES[pageId];
    const phaseMap = api.getPhases(pageId);
    const state = chromeCore.computePhaseChrome(req, phaseMap);

    // --- sticky / in-view phase spy ---
    let spyHost = document.querySelector("[data-walkthrough-spy-host]");
    if (!spyHost) {
      const panel = document.getElementById("phase-progress-panel");
      if (panel) {
        panel.setAttribute("data-walkthrough-spy-host", "");
        spyHost = panel;
      }
    }
    if (spyHost) {
      let slot = spyHost.querySelector("[data-walkthrough-spy-slot]");
      if (!slot) {
        slot = document.createElement("div");
        slot.setAttribute("data-walkthrough-spy-slot", "");
        spyHost.insertBefore(slot, spyHost.firstChild);
      }
      slot.innerHTML = chromeCore.spyHTML(state);
      // Keep legacy summary in sync wording
      const summary = spyHost.querySelector("[data-phase-summary]");
      if (summary) {
        summary.textContent = state.allComplete
          ? `Phases complete: ${state.done} / ${state.total} — walkthrough complete ✓`
          : `Phases complete: ${state.done} / ${state.total} · ${state.spyLabel}`;
      }
    }

    // Also ensure a compact sticky spy under fixed nav if host exists in main col
    let sticky = document.getElementById("wt-sticky-spy");
    if (!sticky && document.querySelector(".main-col, article.prose")) {
      sticky = document.createElement("div");
      sticky.id = "wt-sticky-spy";
      sticky.className = "wt-sticky-spy";
      sticky.setAttribute("data-walkthrough-spy-sticky", "");
      const mainCol = document.querySelector(".main-col");
      const article = document.querySelector("article.prose, .prose");
      if (mainCol) mainCol.insertBefore(sticky, mainCol.firstChild);
      else if (article && article.parentElement) article.parentElement.insertBefore(sticky, article);
      else document.body.appendChild(sticky);
    }
    if (sticky) sticky.innerHTML = chromeCore.spyHTML(state);

    // --- per-phase badges ---
    for (const phaseId of state.requiredPhases) {
      const st = state.badges[phaseId] || "todo";
      const section =
        document.querySelector(`[data-phase-section="${phaseId}"]`) ||
        document.getElementById(`phase${phaseId}`);
      if (section) {
        section.classList.remove("wt-phase-done", "wt-phase-current", "wt-phase-todo");
        section.classList.add(
          st === "done" ? "wt-phase-done" : st === "current" ? "wt-phase-current" : "wt-phase-todo"
        );
        if (section.hasAttribute("data-phase-section") === false && section.id) {
          // h2: mark section state on heading
        }
      }
      // Badge next to phase-check or heading
      let badgeHost =
        document.querySelector(`[data-phase-badge-host="${phaseId}"]`) ||
        null;
      const check = document.querySelector(
        `.phase-check input[data-phase-complete="${phaseId}"]`
      );
      if (!badgeHost && check) {
        const wrap = check.closest(".phase-check");
        if (wrap) {
          badgeHost = wrap.querySelector("[data-phase-badge-host]");
          if (!badgeHost) {
            badgeHost = document.createElement("span");
            badgeHost.setAttribute("data-phase-badge-host", phaseId);
            wrap.appendChild(badgeHost);
          } else {
            badgeHost.setAttribute("data-phase-badge-host", phaseId);
          }
        }
      }
      if (badgeHost) {
        badgeHost.innerHTML = chromeCore.badgeHTML(phaseId, st, state.badgeLabel);
      }
    }

    // --- prompt-bundle copy buttons ---
    this._bindPromptBundles(pageId, state);
  } catch (err) {
    console.warn("walkthrough chrome failed", err);
  }
};

/**
 * One-click copy for each phase's primary prompt (data-phase-prompt).
 * Missing prompts are skipped; never throws.
 */
window.GROK_ACADEMY._bindPromptBundles = function _bindPromptBundles(pageId, chromeState) {
  document.querySelectorAll("[data-phase-prompt]").forEach((wrap) => {
    const phaseId = String(wrap.getAttribute("data-phase-prompt"));
    if (wrap.querySelector("[data-prompt-bundle]")) return;
    const pre = wrap.matches("pre") ? wrap : wrap.querySelector("pre");
    const code = pre && (pre.querySelector("code") || pre);
    if (!code) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "prompt-bundle-btn";
    btn.setAttribute("data-prompt-bundle", phaseId);
    btn.setAttribute(
      "aria-label",
      `Copy Phase ${phaseId} prompt`
    );
    const st = (chromeState && chromeState.badges && chromeState.badges[phaseId]) || "todo";
    btn.innerHTML = `<span class="prompt-bundle-label">Copy phase ${phaseId} prompt</span>`;
    if (st === "current") btn.classList.add("is-current-phase");

    btn.addEventListener("click", async () => {
      const text = (code.innerText || code.textContent || "").trim();
      if (!text) return;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const ta = document.createElement("textarea");
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
        }
        btn.classList.add("is-copied");
        const label = btn.querySelector(".prompt-bundle-label");
        if (label) label.textContent = "Copied!";
        setTimeout(() => {
          btn.classList.remove("is-copied");
          if (label) label.textContent = `Copy phase ${phaseId} prompt`;
        }, 1600);
      } catch {
        const label = btn.querySelector(".prompt-bundle-label");
        if (label) label.textContent = "Copy failed";
      }
    });

    // Prefer placing on .pre-wrap
    if (wrap.classList && wrap.classList.contains("pre-wrap")) {
      wrap.classList.add("has-prompt-bundle");
      wrap.appendChild(btn);
    } else {
      wrap.insertAdjacentElement("beforebegin", btn);
    }
  });
};
