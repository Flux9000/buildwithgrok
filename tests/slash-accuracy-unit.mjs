/**
 * Slash-command accuracy: inventory vs shipped academy encyclopedia.
 * Drive real inventory JSON + real 05-slash-commands.html / cheatsheet HTML.
 * Run: node tests/slash-accuracy-unit.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed++;
  } else {
    console.log("OK:", msg);
  }
}

const invPath = path.join(ROOT, "data/slash-commands-inventory.json");
assert(fs.existsSync(invPath), "inventory file exists");
const inv = JSON.parse(fs.readFileSync(invPath, "utf8"));
assert(inv.source && inv.source.grokVersion, "inventory has grokVersion");
assert(Array.isArray(inv.false_or_non_commands), "false list present");
assert(inv.false_or_non_commands.includes("/yolo"), "documents /yolo is not a slash command");

const slashPage = fs.readFileSync(path.join(ROOT, "pages/05-slash-commands.html"), "utf8");
const cheat = fs.readFileSync(path.join(ROOT, "pages/cheatsheet.html"), "utf8");

// Collect primary cmd entries from inventory
const allPrimary = [];
for (const [group, list] of Object.entries(inv.builtins)) {
  for (const item of list) {
    allPrimary.push({ group, ...item });
  }
}
assert(allPrimary.length >= 40, `inventory has substantial builtins (got ${allPrimary.length})`);

// Every primary builtin (except optional advanced that may be prose-only in cheatsheet)
// must appear in slash encyclopedia as a taught token
const requiredInEncyclopedia = allPrimary.map((x) => x.cmd);
for (const cmd of requiredInEncyclopedia) {
  // Allow either in h4 or code/text
  if (!slashPage.includes(cmd)) {
    assert(false, `encyclopedia missing ${cmd}`);
  }
}
console.log("OK: all inventory primary cmds present in 05-slash-commands.html");

// Easter egg framing
assert(/\/gboom/.test(slashPage), "encyclopedia has /gboom");
assert(/easter egg|Hidden easter egg/i.test(slashPage), "gboom framed as easter egg");
assert(/data-easter-egg="gboom"/.test(slashPage) || /id="hidden"/.test(slashPage), "hidden section anchor");
assert(/graphics-capable|iTerm2|Ghostty|kitty/i.test(slashPage), "gboom terminal requirements");
assert(/\/gboom/.test(cheat), "cheatsheet mentions /gboom");

// Must not teach /yolo as a slash command name in h4
assert(!/<h4>\s*\/yolo\s*<\/h4>/i.test(slashPage), "no /yolo as command heading");
assert(/no\s+<\/?code>?\/yolo|There is no <code>\/yolo<\/code>|no<\/strong> <code>\/yolo<\/code>|no.*\/yolo.*slash/i.test(slashPage + cheat), "explicitly says /yolo is not a slash");

// Feature gates
assert(/only appears when the auto permission-mode|feature is enabled/i.test(slashPage), "auto gated");
assert(/goal mode is enabled|when goal mode/i.test(slashPage), "goal gated");
assert(/memory enabled|Require memory/i.test(slashPage), "memory gated");

// High-value binary commands that were missing pre-pass
for (const cmd of [
  "/help",
  "/dashboard",
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
  "/sessions",
]) {
  assert(slashPage.includes(cmd), `has ${cmd}`);
}

// Aliases documented
assert(/\/show-plan|\/plan-view/.test(slashPage), "view-plan aliases");
assert(/\/howto|\/guides/.test(slashPage), "docs aliases");
assert(/\/changelog/.test(slashPage), "release-notes alias");

// /sessions must be recorded as dashboard alias in inventory + taught in encyclopedia
const dash = (inv.builtins.automation || []).find((x) => x.cmd === "/dashboard");
assert(!!dash, "inventory has /dashboard");
assert(
  Array.isArray(dash.aliases) && dash.aliases.includes("/sessions"),
  "inventory /dashboard aliases includes /sessions"
);
assert(
  /\/dashboard[\s\S]{0,400}\/sessions|aliases[\s\S]{0,80}\/sessions/i.test(slashPage),
  "encyclopedia documents /sessions as dashboard alias"
);
assert(/\/sessions/.test(cheat) || /dashboard \(\/sessions\)/.test(cheat), "cheatsheet mentions /sessions");

// Newly required install builtins: framing
assert(/announcements hide|\/announcements hide/i.test(slashPage), "announcements hide|show");
assert(/\$PAGER|pager/i.test(slashPage) && slashPage.includes("/transcript"), "transcript pager framing");
assert(/minimal mode only|only available in minimal/i.test(slashPage) && slashPage.includes("/expand"), "expand minimal gate");

// Dashboard lesson also names /sessions alias
const dashLesson = fs.readFileSync(path.join(ROOT, "pages/23-dashboard-multisession.html"), "utf8");
assert(/\/sessions/.test(dashLesson), "dashboard lesson includes /sessions alias");

// Every inventory alias must appear in encyclopedia text (regression: empty aliases)
for (const list of Object.values(inv.builtins)) {
  for (const item of list) {
    for (const al of item.aliases || []) {
      assert(slashPage.includes(al), `alias ${al} for ${item.cmd} appears in encyclopedia`);
    }
  }
}

// Version pin
assert(/0\.2\.112/.test(slashPage) || /0\.2\.112/.test(cheat), "mentions verified version 0.2.112");

if (failed) {
  console.error(`\n${failed} failure(s)`);
  process.exit(1);
}
console.log("\nALL SLASH ACCURACY UNIT TESTS PASSED");
process.exit(0);
