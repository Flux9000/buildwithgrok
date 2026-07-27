(() => {
  /**
   * If the main stylesheet never applies (404, blocked path, stale cache),
   * keep the dark academy chrome so users never see a bare white document.
   */
  function ensureThemeLoaded() {
    try {
      const bg = getComputedStyle(document.body).backgroundColor;
      const isWhite =
        bg === "rgb(255, 255, 255)" ||
        bg === "rgba(0, 0, 0, 0)" ||
        bg === "transparent";
      const localSheet = [...document.styleSheets].some((s) => {
        try {
          return s.href && /style\.css/.test(s.href) && s.cssRules && s.cssRules.length > 50;
        } catch {
          // file:// may block cssRules reads; treat present link as ok if critical exists
          return s.href && /style\.css/.test(s.href);
        }
      });
      if (!isWhite && localSheet) return;
      if (!isWhite && document.getElementById("academy-critical")) return;
      if (document.getElementById("academy-theme-fallback")) return;
      const style = document.createElement("style");
      style.id = "academy-theme-fallback";
      style.textContent = `
        html, body { background:#070a12 !important; color:#f4f7fc !important; }
        a { color:#22d3ee !important; }
        .site-nav, [data-topnav] { background:#0d111c !important; color:#e8eef9 !important; }
        .card, .track-card, .callout, .on-this-page { background:#121828 !important; border:1px solid rgba(148,163,184,.15) !important; }
        pre, code { background:#0a0e18 !important; color:#cbd5e1 !important; }
      `;
      document.head.appendChild(style);
    } catch {
      /* ignore */
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureThemeLoaded);
  } else {
    ensureThemeLoaded();
  }
  window.addEventListener("load", ensureThemeLoaded);

  const progress = document.getElementById("scroll-progress");
  const backTop = document.querySelector(".back-top") || (() => {
    const b = document.createElement("button");
    b.className = "back-top";
    b.type = "button";
    b.setAttribute("aria-label", "Back to top");
    b.textContent = "↑";
    document.body.appendChild(b);
    return b;
  })();

  function setProgress() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
    if (progress) progress.style.width = `${pct}%`;
    backTop.classList.toggle("show", window.scrollY > 500);
  }

  function bindNav() {
    const toggle = document.querySelector(".nav-toggle");
    const drawer = document.querySelector(".nav-drawer");
    const overlay = document.querySelector(".nav-overlay");
    if (!toggle || !drawer) return;

    const close = () => {
      drawer.classList.remove("open");
      overlay?.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    };
    const open = () => {
      drawer.classList.add("open");
      overlay?.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    };

    toggle.addEventListener("click", () => {
      if (drawer.classList.contains("open")) close();
      else open();
    });
    overlay?.addEventListener("click", close);
    drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  }

  backTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Reveal
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
  }

  // Copy buttons
  document.querySelectorAll(".pre-wrap").forEach((wrap) => {
    const pre = wrap.querySelector("pre");
    if (!pre || wrap.querySelector(".copy-btn")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(pre.innerText);
        btn.textContent = "Copied";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = "Copy";
          btn.classList.remove("copied");
        }, 1500);
      } catch {
        btn.textContent = "Failed";
        setTimeout(() => { btn.textContent = "Copy"; }, 1500);
      }
    });
    wrap.appendChild(btn);
  });

  // Cheatsheet filter
  const filter = document.getElementById("cmd-filter");
  if (filter) {
    filter.addEventListener("input", () => {
      const q = filter.value.trim().toLowerCase();
      document.querySelectorAll(".cmd-item").forEach((item) => {
        const hay = item.textContent.toLowerCase();
        item.classList.toggle("is-hidden", q && !hay.includes(q));
      });
      document.querySelectorAll(".cmd-group").forEach((group) => {
        const any = [...group.querySelectorAll(".cmd-item")].some(
          (i) => !i.classList.contains("is-hidden")
        );
        group.style.display = any ? "" : "none";
      });
    });
  }

  // Active sidebar scroll into view
  const active = document.querySelector(".side-link.active");
  if (active) {
    active.scrollIntoView({ block: "nearest" });
  }

  // Soft page entrance
  document.documentElement.classList.add("js-ready");
  requestAnimationFrame(() => {
    document.body.classList.add("page-ready");
  });

  // Self-check forms (Phase 1)
  document.querySelectorAll("[data-self-check-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const names = new Set();
      form.querySelectorAll("input[type=radio]").forEach((r) => names.add(r.name));
      let right = 0;
      let total = 0;
      names.forEach((name) => {
        total++;
        if (data.get(name) === "right") right++;
      });
      const result = form.querySelector("[data-self-check-result]");
      if (result) {
        result.hidden = false;
        if (right === total && total > 0) {
          result.textContent = `Nice — ${right}/${total} correct. If you finished the lab, mark the lesson complete below.`;
          result.className = "self-check-result ok";
        } else {
          result.textContent = `${right}/${total} correct. Review the lesson, then try again.`;
          result.className = "self-check-result bad";
        }
      }
    });
  });

  // Reset progress (lessons may include a footer control)
  document.querySelectorAll("[data-reset-progress]").forEach((btn) => {
    if (btn.id === "reset-progress-btn") return; // hub binds its own
    btn.addEventListener("click", () => {
      if (!window.GROK_ACADEMY || !GROK_ACADEMY.resetProgress) return;
      if (!confirm("Reset all academy progress on this browser?")) return;
      GROK_ACADEMY.resetProgress();
      location.reload();
    });
  });

  window.addEventListener("scroll", setProgress, { passive: true });
  window.addEventListener("resize", setProgress);
  setProgress();
  bindNav();

  // A11y + perf (also installed from curriculum.mount; safe to re-run)
  if (globalThis.GROK_A11Y_PERF && typeof GROK_A11Y_PERF.installA11yPerf === "function") {
    GROK_A11Y_PERF.installA11yPerf({ document });
  } else if (window.GROK_ACADEMY && typeof GROK_ACADEMY._installA11yPerf === "function") {
    GROK_ACADEMY._installA11yPerf();
  }
})();
