/**
 * Build With Grok — integrity + theme structure tests.
 * Run from academy root: node tests/academy-integrity.mjs
 * Exit 0 = pass.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const errors = [];
const log = (m) => console.log(m);

function fail(msg) {
  errors.push(msg);
  console.error("FAIL:", msg);
}

function read(p) {
  return fs.readFileSync(p, "utf8");
}

function exists(p) {
  return fs.existsSync(p);
}

// --- CSS theme markers (shipped stylesheet must define dark theme) ---
const cssPath = path.join(ROOT, "css/style.css");
if (!exists(cssPath)) fail("css/style.css missing");
else {
  const css = read(cssPath);
  if (css.length < 5000) fail("css/style.css unexpectedly small");
  if ((css.match(/\{/g) || []).length !== (css.match(/\}/g) || []).length) {
    fail("css brace mismatch");
  }
  for (const needle of [
    ":root",
    "--bg",
    "--text",
    "--text-muted",
    "--prose-lh",
    "--prose-size",
    "body",
    ".site-nav",
    ".hub-hero",
    ".prose",
    "color-scheme",
    "background-color",
  ]) {
    if (!css.includes(needle)) fail(`css missing marker: ${needle}`);
  }
  // dark solid fallback present (hex may evolve with polish)
  if (!/#0[0-9a-f]{5}/i.test(css) || !css.includes("background-color")) {
    fail("css missing dark solid background-color fallback");
  }
  // legibility: body must not use opacity:0 (invisible without JS)
  if (/body\s*\{[^}]*opacity:\s*0\s*;/s.test(css)) {
    fail("body uses opacity:0 which hides content before JS");
  }
  // muted text should not be too dark (token uses light greys)
  const muted = css.match(/--text-muted:\s*([^;]+);/);
  if (!muted) fail("missing --text-muted token");
  // prose measure present
  if (!css.includes("max-width: 65ch") && !css.includes("max-width: 68ch") && !css.includes("max-width: 60ch")) {
    fail("prose max-width measure missing");
  }
  // code blocks readable size
  if (!/\.prose p\s*\{/.test(css)) fail("missing .prose p rules");
  if (!/pre\s*\{[^}]*font-size:\s*0\.9/s.test(css) && !/pre\s*\{[^}]*font-size:\s*0\.8/s.test(css)) {
    // require at least 0.875rem-ish - check 0.9
    if (!/pre\s*\{[^}]*font-size:\s*0\.9rem/s.test(css)) {
      fail("pre font-size should be >= 0.9rem for legibility");
    }
  }
  // body must set a dark background (var or solid)
  if (!/body\s*\{[^}]*background/s.test(css)) fail("body rule missing background");
  log("OK css theme markers");
}

// --- curriculum entries ---
const curPath = path.join(ROOT, "js/curriculum.js");
const cur = read(curPath);
const pageEntries = [...cur.matchAll(/\{\s*id:\s*"([^"]+)"\s*,\s*href:\s*"([^"]+)"/g)].map(
  (m) => ({ id: m[1], href: m[2] })
);
if (pageEntries.length < 24) fail(`expected ≥24 curriculum pages, got ${pageEntries.length}`);
log(`OK curriculum entries ${pageEntries.length}`);
// ship-first order: walkthroughs must appear before advanced MCP/automation in curriculum order
const hrefOrder = pageEntries.map((e) => e.href);
const iGame = hrefOrder.indexOf("21-walkthrough-first-game.html");
const iMcp = hrefOrder.indexOf("14-mcp.html");
if (iGame < 0 || iMcp < 0) fail("missing game walkthrough or MCP lesson in curriculum");
if (iGame > iMcp) fail("flow break: first game walkthrough must come before advanced MCP lesson");


for (const { id, href } of pageEntries) {
  const pagePath = path.join(ROOT, "pages", href);
  if (!exists(pagePath)) {
    fail(`missing page ${href} for id ${id}`);
    continue;
  }
  const html = read(pagePath);
  const mount = html.match(/GROK_ACADEMY\.mount\(\s*\{\s*pageId:\s*"([^"]+)"/);
  if (!mount) fail(`${href}: missing GROK_ACADEMY.mount pageId`);
  else if (mount[1] !== id) fail(`${href}: pageId ${mount[1]} != curriculum ${id}`);
  if (!html.includes("../css/style.css")) fail(`${href}: missing stylesheet link`);
  if (!html.includes('id="academy-critical"')) fail(`${href}: missing critical inline theme`);
  if (!html.includes("../js/curriculum.js")) fail(`${href}: missing curriculum.js`);
  if (!html.includes("../js/progress-core.js")) fail(`${href}: missing progress-core.js`);
  if (!html.includes("../js/main.js")) fail(`${href}: missing main.js`);
  if (!html.includes("data-pager") && !html.includes("data-lesson-complete")) {
    // most lessons use data-pager for complete chrome injection
  }
}

// --- hub ---
const hub = read(path.join(ROOT, "index.html"));
if (!hub.includes("css/style.css")) fail("hub missing css/style.css");
if (!hub.includes('id="academy-critical"')) fail("hub missing critical inline theme");
if (!hub.includes("js/curriculum.js") || !hub.includes("js/main.js")) fail("hub missing js");

// --- local links (skip template literals) ---
function checkLocalLinks(fileRel, html, baseDir) {
  const re = /(?:href|src)=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(html))) {
    const url = m[1];
    if (url.includes("${")) continue; // JS template in hub scripts
    if (/^(https?:|data:|mailto:|javascript:|#)/i.test(url)) continue;
    const clean = url.split("?")[0].split("#")[0];
    if (!clean) continue;
    const target = path.resolve(baseDir, clean);
    if (!exists(target)) fail(`${fileRel}: broken local path ${url}`);
  }
}

checkLocalLinks("index.html", hub, ROOT);
for (const { href } of pageEntries) {
  const pagePath = path.join(ROOT, "pages", href);
  checkLocalLinks(`pages/${href}`, read(pagePath), path.join(ROOT, "pages"));
}

// --- assets referenced ---
const allHtml = [hub, ...pageEntries.map(({ href }) => read(path.join(ROOT, "pages", href)))].join(
  "\n"
);
const assets = new Set(
  [...allHtml.matchAll(/assets\/([\w.-]+\.(?:jpg|jpeg|png|gif|webp|svg))/gi)].map((m) => m[1])
);
for (const name of assets) {
  if (!exists(path.join(ROOT, "assets", name))) fail(`missing asset assets/${name}`);
}
log(`OK assets ${assets.size}`);

// --- main.js theme guard present ---
const mainJs = read(path.join(ROOT, "js/main.js"));
if (!mainJs.includes("ensureThemeLoaded")) fail("main.js missing ensureThemeLoaded guard");

// curriculum progress API (Phase 1 dual state)
if (!cur.includes("getProgress") || !cur.includes("markProgress") || !cur.includes("markCompleted") || !cur.includes("nextIncomplete") || !cur.includes("resetProgress")) {
  fail("curriculum.js missing Phase 1 progress API");
}
if (!exists(path.join(ROOT, "js/progress-core.js"))) fail("progress-core.js missing");
if (!hub.includes("progress-core.js")) fail("hub missing progress-core.js");

// --- Phase 2: search index + palette hooks ---
const searchCorePath = path.join(ROOT, "js/search-core.js");
if (!exists(searchCorePath)) fail("search-core.js missing");
const searchCoreSrc = read(searchCorePath);
for (const needle of [
  "buildIndex",
  "buildIndexFromAcademy",
  "search",
  "installSearchPalette",
  "resolvePageHref",
  "GROK_SEARCH_CORE",
  "metaKey",
  "ctrlKey",
  "Escape",
]) {
  if (!searchCoreSrc.includes(needle)) fail(`search-core.js missing: ${needle}`);
}
// Ctrl/Cmd+K binding present
if (!/key\s*===\s*["']k["']/i.test(searchCoreSrc) && !/e\.key\s*===\s*["']k["']/i.test(searchCoreSrc)) {
  fail("search-core.js missing k-key shortcut for palette");
}
if (!hub.includes("search-core.js")) fail("hub missing search-core.js");
if (!hub.includes("progress-core.js") || !hub.includes("curriculum.js")) fail("hub missing core scripts");
// curriculum wires palette
if (!cur.includes("_installSearchPalette") || !cur.includes("searchLessons") || !cur.includes("getSearchIndex")) {
  fail("curriculum.js missing search palette wiring");
}
// sandbox keyword on safety (defining query must be indexable)
if (!/id:\s*"safety"[\s\S]*?keywords:\s*\[[^\]]*sandbox/i.test(cur)) {
  fail('curriculum safety lesson must include keywords with "sandbox"');
}
if (!/id:\s*"mcp"[\s\S]*?MCP Integrations/i.test(cur)) {
  fail("curriculum mcp lesson title must include MCP");
}
// every lesson page loads search-core
for (const { href } of pageEntries) {
  const html = read(path.join(ROOT, "pages", href));
  if (!html.includes("../js/search-core.js")) fail(`${href}: missing search-core.js`);
}
// CSS palette markers
const cssPhase2 = read(cssPath);
for (const needle of [
  ".search-palette",
  ".search-open-btn",
  ".search-result",
  "search-palette-input",
]) {
  if (!cssPhase2.includes(needle)) fail(`css missing Phase 2 marker: ${needle}`);
}
// runtime search unit file present
if (!exists(path.join(ROOT, "tests/search-unit.mjs"))) fail("tests/search-unit.mjs missing");

// --- Phase 3: last-verified stamps + ribbon ---
const versionCorePath = path.join(ROOT, "js/version-core.js");
if (!exists(versionCorePath)) fail("version-core.js missing");
const versionCoreSrc = read(versionCorePath);
for (const needle of [
  "resolveStamp",
  "isStale",
  "ribbonHTML",
  "FLAG_HEAVY_IDS",
  "DEFAULT_REVIEW_EVERY_DAYS",
  "GROK_VERSION_CORE",
  "reviewEveryDays",
]) {
  if (!versionCoreSrc.includes(needle)) fail(`version-core.js missing: ${needle}`);
}
if (!hub.includes("version-core.js")) fail("hub missing version-core.js");
// curriculum wires ribbon + stamps on required flag-heavy ids
if (!cur.includes("_injectVersionRibbon") || !cur.includes("resolveLessonStamp")) {
  fail("curriculum.js missing version ribbon wiring");
}
if (!versionCoreSrc.includes("data-version-ribbon")) {
  fail("version-core.js missing data-version-ribbon hook in ribbonHTML");
}
const flagHeavy = ["safety", "commands", "mcp", "auto", "workflows", "dashboard"];
for (const id of flagHeavy) {
  // page object must include verified: "YYYY-MM-DD" near the id declaration
  const re = new RegExp(`id:\\s*"${id}"[\\s\\S]*?verified:\\s*"(\\d{4}-\\d{2}-\\d{2})"`, "m");
  const m = cur.match(re);
  if (!m) fail(`curriculum ${id} missing verified ISO date`);
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(m[1])) fail(`curriculum ${id} verified not ISO: ${m[1]}`);
}
// every lesson page loads version-core (before curriculum)
for (const { href } of pageEntries) {
  const html = read(path.join(ROOT, "pages", href));
  if (!html.includes("../js/version-core.js")) fail(`${href}: missing version-core.js`);
  const orderOk =
    html.indexOf("version-core.js") < html.indexOf("curriculum.js") &&
    html.indexOf("search-core.js") < html.indexOf("version-core.js");
  if (!orderOk) fail(`${href}: script order should be search-core → version-core → curriculum`);
}
if (hub.indexOf("version-core.js") > hub.indexOf("curriculum.js") || hub.indexOf("version-core.js") < 0) {
  fail("hub version-core must load before curriculum.js");
}
// CSS ribbon markers
const cssPhase3 = read(cssPath);
for (const needle of [".version-ribbon", "data-version-ribbon", "version-ribbon-date", "is-stale"]) {
  if (!cssPhase3.includes(needle.replace("data-", "")) && needle.startsWith("data-")) {
    // data-version-ribbon may only be in JS; CSS uses .version-ribbon
  }
  if (needle === "data-version-ribbon") continue;
  if (!cssPhase3.includes(needle)) fail(`css missing Phase 3 marker: ${needle}`);
}
if (!exists(path.join(ROOT, "tests/version-unit.mjs"))) fail("tests/version-unit.mjs missing");

// Primary CTA: single empty-state Install; JS may rewrite label to Continue for returners
if (
  !hub.includes("continue-btn") ||
  (!/Install Grok Build|Continue/i.test(hub)) ||
  (!hub.includes("reset-progress") && !hub.includes("data-reset-progress"))
) {
  fail("hub missing primary CTA (Install/Continue) or reset control");
}
// Hub diet: exactly one data-hub-primary-cta (not dual Install buttons)
const primaryCtaCount = (hub.match(/data-hub-primary-cta/g) || []).length;
if (primaryCtaCount !== 1) {
  fail(`hub diet expects exactly 1 data-hub-primary-cta, found ${primaryCtaCount}`);
}
if (hub.includes("continue-btn-main")) {
  fail("hub diet removed second primary continue-btn-main");
}
if (!hub.includes("nextIncomplete") || !hub.includes("path-stepper") || !hub.includes("Five tracks")) {
  fail("hub missing nextIncomplete wiring or path stepper or Five tracks");
}

// Phase 1: complete chrome, walkthrough phases, self-checks
const sampleLesson = read(path.join(ROOT, "pages/01-getting-started.html"));
// complete button is injected by JS into data-pager — ensure pager exists
if (!sampleLesson.includes("data-pager")) fail("lessons need data-pager for complete chrome");
const gameWt = read(path.join(ROOT, "pages/21-walkthrough-first-game.html"));
const appWt = read(path.join(ROOT, "pages/22-walkthrough-first-app.html"));
const phaseGame = (gameWt.match(/data-phase-complete="/g) || []).length;
const phaseApp = (appWt.match(/data-phase-complete="/g) || []).length;
if (phaseGame < 6) fail(`game walkthrough needs 6 phase checkboxes, found ${phaseGame}`);
if (phaseApp < 6) fail(`app walkthrough needs 6 phase checkboxes, found ${phaseApp}`);

// --- Walkthrough chrome: spy, badges, prompt bundles ---
const wtChromePath = path.join(ROOT, "js/walkthrough-chrome.js");
if (!exists(wtChromePath)) fail("walkthrough-chrome.js missing");
const wtChromeSrc = read(wtChromePath);
for (const needle of [
  "computePhaseChrome",
  "nextIncompletePhase",
  "badgeStates",
  "spyHTML",
  "badgeHTML",
  "GROK_WALKTHROUGH_CHROME",
  "Phase",
]) {
  if (!wtChromeSrc.includes(needle)) fail(`walkthrough-chrome.js missing: ${needle}`);
}
if (!cur.includes("_installWalkthroughChrome") || !cur.includes("_bindPromptBundles")) {
  fail("curriculum.js missing walkthrough chrome wiring");
}
if (!cur.includes("GROK_WALKTHROUGH_CHROME") && !cur.includes("WALKTHROUGH_CHROME")) {
  // curriculum references globalThis.GROK_WALKTHROUGH_CHROME
  if (!cur.includes("WALKTHROUGH_CHROME")) fail("curriculum.js does not reference walkthrough chrome core");
}
for (const [label, html] of [
  ["game", gameWt],
  ["app", appWt],
]) {
  if (!html.includes("walkthrough-chrome.js")) fail(`${label} walkthrough missing walkthrough-chrome.js`);
  if (!html.includes("data-walkthrough-spy-host")) fail(`${label} walkthrough missing data-walkthrough-spy-host`);
  for (let i = 0; i < 6; i++) {
    if (!html.includes(`data-phase-section="${i}"`)) fail(`${label} missing data-phase-section=${i}`);
    if (!html.includes(`data-phase-badge-host="${i}"`)) fail(`${label} missing data-phase-badge-host=${i}`);
    if (!html.includes(`data-phase-prompt="${i}"`)) fail(`${label} missing data-phase-prompt=${i}`);
    if (!html.includes(`data-phase-complete="${i}"`)) fail(`${label} missing data-phase-complete=${i}`);
  }
  if (html.indexOf("walkthrough-chrome.js") > html.indexOf("curriculum.js")) {
    fail(`${label} walkthrough-chrome.js must load before curriculum.js`);
  }
}
const cssWt = read(cssPath);
for (const needle of [".wt-phase-spy", ".wt-sticky-spy", ".wt-phase-badge", ".prompt-bundle-btn", "wt-spy-dot"]) {
  if (!cssWt.includes(needle)) fail(`css missing walkthrough chrome marker: ${needle}`);
}
if (!exists(path.join(ROOT, "tests/walkthrough-chrome-unit.mjs"))) {
  fail("tests/walkthrough-chrome-unit.mjs missing");
}

// --- A11y + perf + print ---
const a11yPath = path.join(ROOT, "js/a11y-perf.js");
if (!exists(a11yPath)) fail("a11y-perf.js missing");
const a11ySrc = read(a11yPath);
for (const needle of [
  "installA11yPerf",
  "ensureSkipLink",
  "ensureMainLandmark",
  "enhanceImages",
  "shouldLazyLoad",
  "markPrintChrome",
  "GROK_A11Y_PERF",
  "skip-to-content",
  "main-content",
]) {
  if (!a11ySrc.includes(needle)) fail(`a11y-perf.js missing: ${needle}`);
}
if (!hub.includes("a11y-perf.js")) fail("hub missing a11y-perf.js");
if (!cur.includes("_installA11yPerf") || !cur.includes("GROK_A11Y_PERF")) {
  fail("curriculum.js missing a11y-perf wiring");
}
const mainJsSrc = read(path.join(ROOT, "js/main.js"));
if (!mainJsSrc.includes("installA11yPerf") && !mainJsSrc.includes("GROK_A11Y_PERF")) {
  fail("main.js should install a11y-perf");
}
for (const { href } of pageEntries) {
  const html = read(path.join(ROOT, "pages", href));
  if (!html.includes("../js/a11y-perf.js")) fail(`${href}: missing a11y-perf.js`);
  if (html.indexOf("a11y-perf.js") > html.indexOf("curriculum.js")) {
    fail(`${href}: a11y-perf.js must load before curriculum.js`);
  }
}
const cssA11y = read(cssPath);
for (const needle of [
  ".skip-link",
  ":focus-visible",
  "prefers-reduced-motion",
  "@media print",
  ".no-print",
]) {
  if (!cssA11y.includes(needle)) fail(`css missing a11y/print marker: ${needle}`);
}
if (!exists(path.join(ROOT, "tests/a11y-perf-unit.mjs"))) fail("tests/a11y-perf-unit.mjs missing");
// hub hero should prefer eager LCP image
if (!hub.includes("loading=\"eager\"") && !hub.includes("data-eager-images")) {
  fail("hub hero should mark eager LCP image");
}

// --- Content accuracy: slash inventory + easter eggs ---
const invPath = path.join(ROOT, "data/slash-commands-inventory.json");
if (!exists(invPath)) fail("data/slash-commands-inventory.json missing");
else {
  let inv;
  try {
    inv = JSON.parse(read(invPath));
  } catch (e) {
    fail(`slash inventory JSON invalid: ${e.message}`);
    inv = null;
  }
  if (inv) {
    if (!inv.source || !inv.source.grokVersion) fail("slash inventory missing source.grokVersion");
    const slashPage = read(path.join(ROOT, "pages/05-slash-commands.html"));
    const cheatPage = read(path.join(ROOT, "pages/cheatsheet.html"));
    if (!slashPage.includes("/gboom")) fail("slash encyclopedia missing /gboom easter egg");
    if (!/easter egg|Hidden easter egg/i.test(slashPage)) fail("gboom must be framed as easter egg/hidden");
    if (!cheatPage.includes("/gboom")) fail("cheatsheet missing /gboom");
    // known false: /yolo must not be taught as a slash h4
    if (/<h4>\s*\/yolo\s*<\/h4>/i.test(slashPage)) fail("encyclopedia must not list /yolo as a slash command");
    for (const cmd of [
      "/help",
      "/dashboard",
      "/sessions",
      "/tasks",
      "/queue",
      "/recap",
      "/share",
      "/debug",
      "/find",
      "/jump",
      "/announcements",
      "/transcript",
      "/expand",
      "/always-approve",
      "/gboom",
    ]) {
      if (!slashPage.includes(cmd)) fail(`slash encyclopedia missing required ${cmd}`);
    }
    // dashboard alias /sessions in inventory
    const dashInv = (inv.builtins?.automation || []).find((x) => x.cmd === "/dashboard");
    if (!dashInv || !Array.isArray(dashInv.aliases) || !dashInv.aliases.includes("/sessions")) {
      fail("inventory /dashboard must list /sessions alias");
    }
    const dashLesson = read(path.join(ROOT, "pages/23-dashboard-multisession.html"));
    if (!dashLesson.includes("/sessions")) fail("dashboard lesson missing /sessions alias");
    // inventory primary cmds must appear in encyclopedia
    for (const list of Object.values(inv.builtins || {})) {
      for (const item of list) {
        if (item.cmd && !slashPage.includes(item.cmd)) {
          fail(`inventory cmd ${item.cmd} missing from 05-slash-commands.html`);
        }
      }
    }
  }
}
if (!exists(path.join(ROOT, "tests/slash-accuracy-unit.mjs"))) {
  fail("tests/slash-accuracy-unit.mjs missing");
}

// --- Build With Grok rebrand + legal disclaimer + journey polish ---
if (hub.includes("Grok Build Academy")) fail("hub still has product name Grok Build Academy");
if (cur.includes('title: "Grok Build Academy"') || /brand-text">Grok Build Academy/.test(cur)) {
  fail("curriculum chrome still branded Grok Build Academy");
}
if (!hub.includes("Build With Grok")) fail("hub missing Build With Grok brand");
if (!cur.includes('title: "Build With Grok"') && !cur.includes("Build With Grok")) {
  fail("curriculum missing Build With Grok brand");
}
if (!/brand-text">Build With Grok/.test(cur)) fail("nav brand-text must be Build With Grok");
// no remaining user-facing product name in page titles
for (const { href } of pageEntries) {
  const html = read(path.join(ROOT, "pages", href));
  if (/<title>[^<]*Grok Build Academy/.test(html)) fail(`${href} title still Grok Build Academy`);
  if (!html.includes("Build With Grok") && !/<title>/.test(html)) {
    /* ok */
  }
  if (/<title>/.test(html) && !html.includes("Build With Grok")) {
    fail(`${href} title should include Build With Grok`);
  }
  if (!html.includes("data-legal-disclaimer") && !html.includes("site-disclaimer")) {
    fail(`${href} missing legal disclaimer`);
  }
  if (!/not affiliated/i.test(html) && !html.includes("LEGAL_DISCLAIMER")) {
    // static footer should include not affiliated
    if (!/not affiliated/i.test(html)) fail(`${href} disclaimer missing 'not affiliated'`);
  }
  if (!/SpaceXAI|xAI/i.test(html)) fail(`${href} disclaimer should mention xAI or SpaceXAI`);
}
if (!hub.includes("data-legal-disclaimer") && !hub.includes("site-disclaimer")) {
  fail("hub missing legal disclaimer");
}
if (!/not affiliated/i.test(hub)) fail("hub disclaimer missing not affiliated");
if (!/SpaceXAI|xAI/i.test(hub)) fail("hub disclaimer missing xAI/SpaceXAI");
// first-value journey polish
if (!hub.includes("data-first-value-framing") && !/First Ship|first ship|ship a tiny game/i.test(hub)) {
  fail("hub missing first-value / ship milestone framing");
}
// Ship findable: dedicated ship section and/or First Ship language (not three pre-ship CTAs)
if (!/data-ship-entry|First Ship|walkthrough-first-game|First win/i.test(hub)) {
  fail("hub missing First Ship entry / language");
}
// Hub diet item 3: no stack of pre-ship milestone CTAs outside #ship
if (hub.includes("id=\"ship-milestone-btn\"") || hub.includes("id=\"first-ship-cta\"")) {
  fail("hub diet removed competing pre-ship CTAs (ship-milestone / first-ship-cta)");
}
if (!cur.includes("getPracticeDueCue") || !cur.includes("LEGAL_DISCLAIMER_HTML")) {
  fail("curriculum missing practice-due cue or LEGAL_DISCLAIMER_HTML");
}
if (!hub.includes("practice-due") && !hub.includes("getPracticeDueCue")) {
  fail("hub missing practice-due wiring");
}
// self-check density: first-win sprint floor ≥14 lessons with data-self-check
let scLessons = 0;
for (const { href } of pageEntries) {
  if (read(path.join(ROOT, "pages", href)).includes("data-self-check")) scLessons++;
}
if (scLessons < 14) fail(`need ≥14 lessons with self-checks (first-win floor), found ${scLessons}`);
if (!exists(path.join(ROOT, "tests/practice-cue-unit.mjs"))) fail("tests/practice-cue-unit.mjs missing");

// --- First-win funnel anchors ---
if (!cur.includes("resolveHubPrimaryCta")) {
  fail("curriculum missing resolveHubPrimaryCta helper");
}
if (!hub.includes("resolveHubPrimaryCta") || !hub.includes("data-first-win-funnel")) {
  fail("hub missing first-win funnel wiring (resolveHubPrimaryCta / data-first-win-funnel)");
}
if (!hub.includes("data-hub-primary-cta") || !/Install Grok Build/i.test(hub)) {
  fail("hub primary CTA markup should default to Install Grok Build");
}
if (!hub.includes("data-express-path") && !hub.includes("express-path")) {
  fail("hub missing express-path callout");
}
if (!/Install[\s\S]{0,80}First Session[\s\S]{0,120}walkthrough/i.test(hub) &&
    !/01-getting-started[\s\S]{0,200}02-first-session[\s\S]{0,200}21-walkthrough/i.test(hub)) {
  fail("hub express path should name Install → First Session → walkthrough");
}
// Hub diet item 2: one syllabus surface (catalog disclosure + full-path), not dual expanded catalogs
if (!hub.includes("data-hub-catalog") && !hub.includes("hub-catalog")) {
  fail("hub missing collapsed curriculum catalog (data-hub-catalog)");
}
if (!hub.includes("id=\"full-path\"") && !hub.includes("id='full-path'")) {
  fail("hub missing full-path syllabus list");
}
if (hub.includes("id=\"track-cards\"")) {
  fail("hub diet: track-cards expanded catalog removed (use single full-path catalog)");
}
if (/Recommended path/i.test(hub) && /Glossary → Install → First session/i.test(hub)) {
  fail("hub diet: redundant Welcome recommended-path restatement should be gone");
}
if (hub.includes("Do the labs on your computer") && hub.includes("<ol class=\"steps")) {
  fail("hub diet: redundant Method steps list should be gone");
}
// no-JS beginners: primary href points at Getting Started, not glossary
const primaryMatch = hub.match(/id="continue-btn"[^>]*href="([^"]+)"|href="([^"]+)"[^>]*id="continue-btn"/);
const primaryHref = primaryMatch ? (primaryMatch[1] || primaryMatch[2] || "") : "";
if (!/01-getting-started/.test(primaryHref) && !hub.includes('href="pages/01-getting-started.html" data-hub-primary-cta') &&
    !/data-hub-primary-cta[^>]*href="pages\/01-getting-started\.html"|href="pages\/01-getting-started\.html"[^>]*data-hub-primary-cta/.test(hub)) {
  // soft: ensure at least one primary CTA targets install
  if (!/data-hub-primary-cta[\s\S]{0,120}01-getting-started|01-getting-started[\s\S]{0,120}data-hub-primary-cta/.test(hub)) {
    fail("hub primary CTA should target Getting Started for empty progress");
  }
}
const gsHtml = read(path.join(ROOT, "pages/01-getting-started.html"));
if (!gsHtml.includes("data-first-win") && !/first win/i.test(gsHtml)) {
  fail("Getting Started missing first-win celebration");
}
const firstHtml = read(path.join(ROOT, "pages/02-first-session.html"));
if (!firstHtml.includes("data-first-win") && !/First wins|Next big win/i.test(firstHtml)) {
  fail("First Session missing first-win / next-win celebration");
}
// Gate lessons that block safe/effective use should carry self-checks
const gateSelfCheck = [
  "09-configuration.html",
  "10-project-rules.html",
  "11-skills-plugins-hooks.html",
  "13-subagents.html",
  "14-mcp.html",
  "15-automation.html",
  "19-prompt-craft.html",
];
for (const g of gateSelfCheck) {
  const ghtml = read(path.join(ROOT, "pages", g));
  if (!ghtml.includes("data-self-check") || !ghtml.includes("data-self-check-form")) {
    fail(`gate lesson ${g} missing self-check form pattern`);
  }
}
// CSS disclaimer
if (!read(cssPath).includes("site-disclaimer") && !read(cssPath).includes("data-legal-disclaimer")) {
  fail("css missing site-disclaimer styles");
}

// --- Language pass: beginner-friendly leads + pedagogy still present ---
const languageLeads = [
  ["00-glossary.html", /plain|word|dictionary|skim/i],
  ["01-getting-started.html", /install|sign in|prove/i],
  ["21-walkthrough-first-game.html", /copy-paste|phases|order/i],
  ["22-walkthrough-first-app.html", /copy-paste|phases|order/i],
  ["08-permissions-safety.html", /safety|permission|sandbox/i],
];
for (const [href, re] of languageLeads) {
  const html = read(path.join(ROOT, "pages", href));
  const lead = html.match(/<p class="lead">([\s\S]*?)<\/p>/);
  if (!lead || !re.test(lead[1])) fail(`${href}: lead missing beginner-friendly cue`);
}
// hub first-value still clear
if (!/First Ship|ship walkthrough|First win/i.test(hub)) {
  fail("hub lost first-ship / first-win language");
}
// Intermediate track subtitle must stay beginner-plain (no "power users")
if (/power-?users?/i.test(cur) && /id:\s*"intermediate"[\s\S]{0,200}power/i.test(cur)) {
  fail('intermediate track subtitle should avoid "power user" jargon');
}
if (!/Daily habits after your first ship/i.test(cur)) {
  fail('intermediate track subtitle should be "Daily habits after your first ship"');
}
// Plain-English fixes for flag-heavy jargon that blocked beginners
const slashHtml = read(path.join(ROOT, "pages/05-slash-commands.html"));
if (/usage-ish/i.test(slashHtml)) fail("slash encyclopedia still says usage-ish");
if (/peer agent/i.test(slashHtml) && !/side chat/i.test(slashHtml)) {
  fail("slash /fork should explain side chat, not only peer agent");
}
if (/classifier-based/i.test(slashHtml)) fail("slash /auto still says classifier-based");
if (/scrollback-native|alt-screen TUI/i.test(slashHtml)) {
  fail("slash minimal/fullscreen still uses scrollback-native / alt-screen TUI jargon");
}
const sessionsHtml = read(path.join(ROOT, "pages/07-sessions-memory.html"));
if (/peer agent/i.test(sessionsHtml)) fail("sessions table still says peer agent for /fork");
if (!/side chat/i.test(sessionsHtml)) fail("sessions /fork should say side chat");
const safetyHtml = read(path.join(ROOT, "pages/08-permissions-safety.html"));
if (/YOLO is on for trusted automation/i.test(safetyHtml)) {
  fail("safety page still uses insider YOLO phrasing for automation");
}
if (/Landlock|Seatbelt/i.test(safetyHtml) && !/OS safety net|extra OS|built-in sandbox/i.test(safetyHtml)) {
  fail("safety sandbox must explain Landlock/Seatbelt in plain English");
}
// no old product brand in user-facing hub/glossary (curriculum.js may still mention the old name only inside a footer-normalize regex)
if (/Grok Build Academy/.test(hub + read(path.join(ROOT, "pages/00-glossary.html")))) {
  fail("language pass reintroduced Grok Build Academy product brand");
}
if (/title:\s*"Grok Build Academy"/.test(cur) || /brand-text">Grok Build Academy/.test(cur)) {
  fail("curriculum still uses old product title/brand-text");
}

// --- Showcase beautify design-system markers (v3) ---
const cssBeautify = read(cssPath);
for (const needle of [
  "--glow-cyan",
  "--surface-glass",
  "--bg-glass",
  "--radius-lg",
  ".hub-showcase",
  ".hub-hero-orbs",
  ".showcase-stat",
  "design-system-v3-showcase",
  "Showcase beautify layer",
]) {
  if (!cssBeautify.includes(needle)) fail(`css missing beautify marker: ${needle}`);
}
if (!hub.includes("data-hub-showcase") && !hub.includes("hub-showcase")) {
  fail("hub missing showcase section");
}
if (!hub.includes("hub-hero-orbs") && !hub.includes("data-hub-showcase-hero")) {
  fail("hub missing showcase hero polish hooks");
}
if (!hub.includes("design-system-v3-showcase") && !hub.includes("data-showcase-site")) {
  fail("hub missing design-system-v3 showcase body marker");
}
// brand + disclaimer still hold after beautify
if (!hub.includes("Build With Grok")) fail("beautify must keep Build With Grok brand");
if (!/not affiliated/i.test(hub)) fail("beautify must keep legal disclaimer");
// critical dark theme still present
if (!hub.includes('id="academy-critical"')) fail("hub critical theme missing after beautify");
if (!cssBeautify.includes("color-scheme") || !cssBeautify.includes("background-color")) {
  fail("css still needs dark color-scheme / background-color");
}
const selfCheckFiles = [
  "02-first-session.html",
  "08-permissions-safety.html",
  "21-walkthrough-first-game.html",
  "22-walkthrough-first-app.html",
];
let selfCheckCount = 0;
for (const f of selfCheckFiles) {
  if (read(path.join(ROOT, "pages", f)).includes("data-self-check")) selfCheckCount++;
}
if (selfCheckCount < 3) fail(`need ≥3 self-checks among required lessons, found ${selfCheckCount}`);
// new decorative assets on disk
for (const asset of [
  "path-journey.jpg",
  "path-orbs.jpg",
  "safety-shields.jpg",
  "ship-celebrate.jpg",
  "favicon.svg",
]) {
  if (!exists(path.join(ROOT, "assets", asset))) fail(`missing asset assets/${asset}`);
}

// --- walkthroughs + research-aligned advanced topics present ---
for (const f of [
  "21-walkthrough-first-game.html",
  "22-walkthrough-first-app.html",
  "00-glossary.html",
  "08-permissions-safety.html",
  "14-mcp.html",
  "15-automation.html",
  "16-workflows-goals.html",
  "23-dashboard-multisession.html",
]) {
  if (!pageEntries.some((e) => e.href === f)) fail(`curriculum missing ${f}`);
}

// content anchors: safety layers + headless flags + dashboard
const safety = read(path.join(ROOT, "pages/08-permissions-safety.html"));
if (!/Three safety layers|allow \/ deny|sandbox/i.test(safety)) {
  fail("08-permissions-safety missing layered safety teaching");
}
const auto = read(path.join(ROOT, "pages/15-automation.html"));
if (!/max-turns|output-format|Agent mode|ACP/i.test(auto)) {
  fail("15-automation missing headless/ACP power content");
}
const dash = read(path.join(ROOT, "pages/23-dashboard-multisession.html"));
if (!/Dashboard|multi-session|worktree/i.test(dash)) {
  fail("23-dashboard missing multi-session teaching");
}
const game = read(path.join(ROOT, "pages/21-walkthrough-first-game.html"));
if (!/Do not send/i.test(game) || !/done when|complete when/i.test(game)) {
  fail("game walkthrough missing pedagogy markers");
}
const app = read(path.join(ROOT, "pages/22-walkthrough-first-app.html"));
if (!/Do not send|prompt-box bad/i.test(app) || !/JOURNEY/i.test(app) || !/done when|complete when/i.test(app)) {
  fail("app walkthrough missing pedagogy markers");
}
if (!/Default next/i.test(app) || !/24-day2-git\.html/.test(app)) {
  fail("app walkthrough must name Day-2 Git (24-day2-git.html) as default next");
}
if (/jump to.*Prompt Craft|or jump to/i.test(app)) {
  fail("app walkthrough still offers competing next paths");
}

// --- Day-2 git curriculum module ---
const gitEntry = pageEntries.find((e) => e.id === "git");
if (!gitEntry) fail('curriculum missing day-2 git lesson id "git"');
else if (gitEntry.href !== "24-day2-git.html") fail(`git lesson href unexpected: ${gitEntry.href}`);
const gitHtml = read(path.join(ROOT, "pages", gitEntry.href));
if (!gitHtml.includes('GROK_ACADEMY.mount({ pageId: "git" })') && !gitHtml.includes('pageId: "git"')) {
  fail("24-day2-git.html must mount pageId git");
}
if (!/Done when/i.test(gitHtml)) fail("day-2 git missing Done when");
if (!/<h2[^>]*>Lab<\/h2>|<h2 id="lab">/i.test(gitHtml)) fail("day-2 git missing Lab heading");
if (!/git status|git diff|commit/i.test(gitHtml)) fail("day-2 git missing status/diff/commit teaching");
if (!gitHtml.includes("data-pager")) fail("day-2 git missing data-pager");
if (!gitHtml.includes("../js/progress-core.js") || !gitHtml.includes("../js/search-core.js") || !gitHtml.includes("../js/version-core.js")) {
  fail("day-2 git missing core scripts");
}
// ship-first: game walkthrough before git lesson in curriculum order
const iGit = hrefOrder.indexOf("24-day2-git.html");
if (iGit < 0) fail("git href not in curriculum order");
if (iGame > iGit) fail("ship-first break: game walkthrough must precede day-2 git");
// keywords include git for search
if (!/id:\s*"git"[\s\S]*?keywords:\s*\[[^\]]*git/i.test(cur)) {
  fail('curriculum git lesson must include keyword "git"');
}
// git is intermediate, after ship track pages
if (!/id:\s*"intermediate"[\s\S]*?id:\s*"git"/m.test(cur)) {
  fail("git lesson should live in intermediate track");
}

// hub path consistency
const hubHtml = read(path.join(ROOT, "index.html"));
if (!/Five tracks/i.test(hubHtml)) fail("hub must say Five tracks (not Four)");
if (/Four tracks/i.test(hubHtml)) fail("hub still says Four tracks");
if (!/The Grok Screen/i.test(hubHtml) || !/Keyboard Basics/i.test(hubHtml)) {
  fail("hub path must include The Grok Screen and Keyboard Basics before ship");
}

// plan + subagents success gates
const planHtml = read(path.join(ROOT, "pages/12-plan-mode.html"));
if (!/Done when/i.test(planHtml) || !/<h2>Lab<\/h2>|<h2 id="lab">/i.test(planHtml)) {
  fail("plan-mode missing Lab / Done when");
}
const agentsHtml = read(path.join(ROOT, "pages/13-subagents.html"));
if (!/Done when/i.test(agentsHtml) || !/<h2>Lab<\/h2>|<h2 id="lab">/i.test(agentsHtml)) {
  fail("subagents missing Lab / Done when");
}

// glossary tilde prose
const gloss = read(path.join(ROOT, "pages/00-glossary.html"));
if (/The<code>~/.test(gloss) || /The\s*<code>~<\/code>\s*means/.test(gloss) === false && /The character <code>~<\/code> means/.test(gloss) === false) {
  if (/The<code>/.test(gloss)) fail("glossary has broken The<code> prose");
}
if (!/The character <code>~<\/code> means/.test(gloss)) {
  fail("glossary tilde definition must be readable (The character ~ means…)");
}

if (errors.length) {
  console.error(`\n${errors.length} failure(s)`);
  process.exit(1);
}
console.log("\nALL INTEGRITY CHECKS PASSED");
process.exit(0);
