/**
 * Build With Grok — last-verified stamps + review cadence (Phase 3).
 * Pure resolve/stale helpers; dual-export for Node unit tests + browser.
 *
 * Editorial metadata only — not live CLI accuracy. Copy points learners to /docs.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.GROK_VERSION_CORE = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  /** Default review interval when a stamp omits reviewEveryDays */
  const DEFAULT_REVIEW_EVERY_DAYS = 90;

  /** Flag-heavy lesson ids that must carry last-verified metadata in curriculum */
  const FLAG_HEAVY_IDS = [
    "safety",
    "commands",
    "mcp",
    "auto",
    "workflows",
    "dashboard",
  ];

  /**
   * Parse ISO date YYYY-MM-DD (or Date) to UTC midnight Date, or null.
   */
  function parseISODate(value) {
    if (value instanceof Date && !isNaN(value.getTime())) {
      return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
    }
    if (typeof value !== "string") return null;
    const m = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    const dt = new Date(Date.UTC(y, mo - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) {
      return null;
    }
    return dt;
  }

  function formatISODate(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) return "";
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function addDaysUTC(date, days) {
    const out = new Date(date.getTime());
    out.setUTCDate(out.getUTCDate() + Number(days) || 0);
    return out;
  }

  function daysBetweenUTC(from, to) {
    const ms = to.getTime() - from.getTime();
    return Math.floor(ms / (24 * 60 * 60 * 1000));
  }

  /**
   * Extract stamp fields from a curriculum page or plain meta object.
   * @param {{ verified?: string, lastVerified?: string, reviewEveryDays?: number }|null} pageOrMeta
   */
  function extractMeta(pageOrMeta) {
    if (!pageOrMeta || typeof pageOrMeta !== "object") return null;
    const verifiedRaw = pageOrMeta.verified || pageOrMeta.lastVerified || null;
    if (!verifiedRaw) return null;
    const verified = parseISODate(verifiedRaw);
    if (!verified) return null;
    let reviewEveryDays = pageOrMeta.reviewEveryDays;
    if (reviewEveryDays == null || reviewEveryDays === "") {
      reviewEveryDays = DEFAULT_REVIEW_EVERY_DAYS;
    }
    reviewEveryDays = Number(reviewEveryDays);
    if (!Number.isFinite(reviewEveryDays) || reviewEveryDays < 1) {
      reviewEveryDays = DEFAULT_REVIEW_EVERY_DAYS;
    }
    return {
      verified,
      verifiedISO: formatISODate(verified),
      reviewEveryDays,
    };
  }

  /**
   * Resolve display stamp for a lesson. Missing stamp → null (no crash).
   * @param {object|null} pageOrMeta — curriculum page with verified / reviewEveryDays
   * @param {string|Date} [asOf] — comparison date (default: now UTC day)
   * @returns {null|{
   *   verifiedISO: string,
   *   reviewEveryDays: number,
   *   nextReviewISO: string,
   *   stale: boolean,
   *   daysSinceVerified: number,
   *   daysUntilReview: number,
   *   label: string,
   *   ribbonText: string,
   *   status: "current"|"stale"
   * }}
   */
  function resolveStamp(pageOrMeta, asOf) {
    const meta = extractMeta(pageOrMeta);
    if (!meta) return null;

    const asOfDate = parseISODate(asOf) || parseISODate(formatISODate(new Date())) || meta.verified;
    const nextReview = addDaysUTC(meta.verified, meta.reviewEveryDays);
    const daysSince = daysBetweenUTC(meta.verified, asOfDate);
    const daysUntil = daysBetweenUTC(asOfDate, nextReview);
    const stale = asOfDate.getTime() >= nextReview.getTime();

    const label = stale ? "Review overdue" : "Last verified";
    const cadence = `Review every ${meta.reviewEveryDays} days`;
    const ribbonText = stale
      ? `${label}: content last checked ${meta.verifiedISO} (${cadence.toLowerCase()}). Confirm with in-product /docs if your Grok version differs.`
      : `${label} ${meta.verifiedISO} · ${cadence} · Confirm with in-product /docs if your Grok version differs.`;

    return {
      verifiedISO: meta.verifiedISO,
      reviewEveryDays: meta.reviewEveryDays,
      nextReviewISO: formatISODate(nextReview),
      stale,
      daysSinceVerified: daysSince,
      daysUntilReview: daysUntil,
      label,
      ribbonText,
      status: stale ? "stale" : "current",
    };
  }

  /**
   * @param {object|null} pageOrMeta
   * @param {string|Date} [asOf]
   * @returns {boolean} false if no stamp or not stale
   */
  function isStale(pageOrMeta, asOf) {
    const stamp = resolveStamp(pageOrMeta, asOf);
    return !!(stamp && stamp.stale);
  }

  /**
   * HTML fragment for the version ribbon (no DOM dependency).
   * @param {ReturnType<typeof resolveStamp>} stamp
   * @returns {string}
   */
  function ribbonHTML(stamp) {
    if (!stamp) return "";
    const staleClass = stamp.stale ? " is-stale" : "";
    const status = stamp.stale ? "overdue for editorial review" : "within review cadence";
    return `<aside class="version-ribbon${staleClass}" data-version-ribbon data-verified="${escapeAttr(stamp.verifiedISO)}" data-status="${stamp.status}" role="note" aria-label="Lesson verification status">
  <span class="version-ribbon-badge">${escapeHtml(stamp.label)}</span>
  <time class="version-ribbon-date" datetime="${escapeAttr(stamp.verifiedISO)}">${escapeHtml(stamp.verifiedISO)}</time>
  <span class="version-ribbon-cadence">Review every ${stamp.reviewEveryDays} days</span>
  <span class="version-ribbon-note">Beta-sensitive advice · ${escapeHtml(status)}. When your Grok build disagrees, trust in-product <code>/docs</code>.</span>
</aside>`;
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

  /**
   * Collect stamps from academy flat pages (for tests / tooling).
   * @param {{ flatPages?: Function, tracks?: Array }} academy
   */
  function collectStampsFromAcademy(academy) {
    const pages =
      academy && typeof academy.flatPages === "function"
        ? academy.flatPages()
        : [];
    const out = {};
    for (const p of pages) {
      const stamp = resolveStamp(p, p.verified);
      if (stamp) out[p.id] = { ...stamp, id: p.id };
    }
    return out;
  }

  return {
    DEFAULT_REVIEW_EVERY_DAYS,
    FLAG_HEAVY_IDS,
    parseISODate,
    formatISODate,
    addDaysUTC,
    daysBetweenUTC,
    extractMeta,
    resolveStamp,
    isStale,
    ribbonHTML,
    collectStampsFromAcademy,
  };
});
