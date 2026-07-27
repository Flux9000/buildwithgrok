# Build With Grok — comprehensive critique

**Date:** 2026-07-27  
**Subject:** Static multi-page site in `grok-build-tutorial/`  
**Mission:** Exceptional learning resource for complete beginners → masters of **Grok Build**  
**Brand / home:** Build With Grok · intended live at **buildwithgrok.com** (not affiliated with Grok / xAI / SpaceXAI)  
**Code health at review:** `npm test` all suites green (progress, search, version, walkthrough, a11y, slash accuracy, practice cue, integrity)

---

## 1. Current-state baseline (what the site is today)

### Product identity
- **Name:** Build With Grok (rebranded from Grok Build Academy).
- **What it teaches:** Grok Build (terminal AI coding agent)—install, first session, ship a real mini project, then daily habits and advanced power.
- **Legal:** Footer disclaimer on hub + lessons: independent site; not affiliated with Grok, xAI, or SpaceXAI.
- **Hosting intent:** Static files for **buildwithgrok.com** (GoDaddy). Offline zip packaging is an explicit non-goal.

### Curriculum shape (26 lessons, five tracks, ship-first)
Order is encoded in `js/curriculum.js` and mirrored on the hub path stepper:

| Track | Lessons (high level) |
|--------|----------------------|
| **Beginner** | Glossary → Install → First session → Screen → Keyboard |
| **First ship** | Game concepts → **First Game walkthrough** → App concepts → **First App walkthrough** |
| **Intermediate** | Day-2 Git → Slash commands → Tools → Sessions → Safety → Config → Prompt craft |
| **Advanced** | Rules → Skills/plugins/hooks → Plan → Subagents → MCP → Headless → Workflows → Dashboard |
| **Mastery** | Path to Mastery → Cheatsheet |

Explicit rule: **do not jump to Advanced until you have shipped once.**

### Pedagogy mechanics (repo-grounded)
- **Labs / Done when:** Present on both ship walkthroughs (6 phases each with `data-phase-complete`), install, first session, safety, plan, many advanced pages; walkthroughs use copy-paste “Send this” prompts and anti-prompts.
- **Self-checks:** Radio quizzes on **10** lessons (was thinner earlier); not required to mark complete.
- **Progress:** Dual state in `progress-core.js`—opened ≠ completed; Continue = next incomplete in curriculum order; walkthrough overall complete only after all 6 phases.
- **Walkthrough chrome:** Phase spy, badges, prompt-bundle copy (`walkthrough-chrome.js`).
- **Discovery:** Client search + ⌘/Ctrl+K palette (`search-core.js`); index from curriculum metadata + keywords.
- **Trust:** Last-verified ribbons + cadence on flag-heavy lessons (`version-core.js`); slash inventory JSON + accuracy tests vs install ~0.2.112.
- **A11y / print:** Skip link, main landmark, lazy images, focus-visible, reduced-motion, print CSS.
- **Visual system:** Dark glass showcase CSS (~2.8k lines), hub hero orbs, showcase band, polished cards/path.
- **Language:** Recent clarity pass (leads, hub copy, jargon fixes on slash/safety/sessions).

### What it deliberately is not
No accounts, cross-device progress, graded LMS, live in-browser Grok, multiplayer classrooms, SCORM, SPA, auth/payments, mini-CMS / What’s New backend, offline zip.

---

## 2. Critique vs the exceptional bar

The product’s own exceptional bar (from `docs/NEXT-PHASES.md`) plus the beginner→master mission:

| Bar | Verdict | Notes |
|-----|---------|--------|
| 1. Newbie finishes a ship walkthrough without path confusion | **Strong** | Ordered tracks, default-next on walkthroughs, phase spy/checkboxes, Done when. Residual risk: long walkthroughs still feel heavy; intermediate path step still competes for attention after ship. |
| 2. Resume true next incomplete | **Strong** | Dual progress + Continue CTA + hub path list. Weakness: progress is browser-only; clear on hub but easy to lose on new device. |
| 3. Intermediate can search advanced topics in seconds | **Strong** | Palette + keywords (sandbox, MCP, git, …). Index is metadata-first, not full HTML body—fine for topics, weaker for deep phrase search inside long walkthroughs. |
| 4. Advanced never blocks beginners | **Strong** | Ship-first order in curriculum + hub copy. Showcase/advanced teasers could still tempt skips; messaging is good enough. |
| 5. Beta-sensitive advice shows last verified | **Good** | Ribbons on safety/commands/mcp/auto/workflows/dashboard (+ some advanced). Not every flag-heavy sentence is dated; inventory is version-pinned to 0.2.112 and will stale. |
| 6. Static-hostable | **Strong** | Pure multi-page static; critical dark CSS; tests guard integrity. **Not yet live** on buildwithgrok.com (parked). |

### Dimension-by-dimension critique

#### A. Pedagogy / path (beginner → master)
**Strengths**
- Best-in-class structure for a static coding curriculum: glossary → install → one real ship before power tools.
- Ship walkthroughs are the heart: exact prompts, anti-prompts, phase gates—matches how people actually learn Grok (do, don’t only read).
- Mastery page gives levels + weekly practice + a concrete final exam choice.

**Gaps**
- **Time-to-first-ship is long** for a true zero: glossary + install + first session + TUI + keys + concepts + 45–90 min walkthrough. Hub says “first win = ship,” but the path still asks for several lessons first—correct pedagogically, easy to abandon emotionally.
- **Self-checks are uneven:** 10 lessons have them; many intermediate/advanced “concept” pages have Lab/Done when without a quick check (tools has checks; config/rules/skills/prompts/subagents/mcp/automation often don’t).
- **Mark complete ≠ self-check:** learners can mark complete without answering quizzes—honest progress model, but weak mastery signal.
- **Two ships in series** (game then app) may be more than some learners need; optional “one ship is enough to unlock Intermediate” is stated, but the flat path still lists both before git.

#### B. First-session value / activation
**Strengths**
- Hub CTAs: Continue, First win ship game, Install.
- Getting Started lab ends with a real disk proof.
- First Session teaches goal + approve + verify.

**Gaps**
- **“Aha” may still land after several pages**, not in the first 15 minutes of the *site*. Competitive products put a tiny interactive win earlier (even a one-command “hello” is already in install—could be celebrated harder as the first win before the multi-phase game).
- Hero still offers three equal-ish CTAs; primary continues to glossary rather than “Start install now” for brand-new visitors with zero progress.

#### C. Practice / assessment density
**Strengths**
- Walkthrough phases are serious practice (not fluff quizzes).
- Sparse self-checks on high-leverage topics (permissions, git, first session, keyboard, plan).

**Gaps**
- No spaced re-practice system beyond a light local practice-due cue.
- No progressive “skill ladder UI” that lights up Operator → Director → Systems as you complete lessons (Mastery page is static checklist).
- Cheatsheet is reference, not practice.

#### D. Content accuracy / trust
**Strengths**
- Slash inventory + unit tests against real install patterns; easter eggs (`/gboom`) framed honestly.
- Version ribbons; “check `/docs`” hedges on Beta.
- Safety layers taught as stack (mode / rules / sandbox).

**Gaps**
- **Version drift is inevitable:** inventory pinned to 0.2.112; no automated “re-verify on new grok version” workflow in-repo.
- Some advanced pages are thinner conceptually (skills, config) relative to slash encyclopedia depth—risk of feeling like summaries of official docs without enough “when to use.”
- Walkthrough prompts are excellent but **not automatically re-tested** against current Grok behavior (only human accuracy passes).

#### E. Navigation / discovery
**Strengths**
- Sidebar + drawer, pager, path list, search palette, hub track cards.

**Gaps**
- Search does not full-text lesson bodies—deep phrases inside walkthroughs may miss.
- Hub is long (hero → continue → path → showcase → welcome → ship → advanced map → tracks → method → full path → docs)—excellent for depth, **fatiguing as a first scroll** on mobile.
- Intermediate “Daily habits after first ship” is correct; path stepper still starts Intermediate at day-2 git while many users expect slash commands first (order is intentional but should stay explicitly justified).

#### F. Visual craft
**Strengths**
- Showcase-grade dark design system; cohesive brand presence; looks like a product, not a doc dump.
- Assets and ship cards sell “you will build something real.”

**Gaps**
- Visual excellence can **outpace content thinness** on shorter advanced pages—risk of “pretty but shallow.”
- Decorative images are strong; some lessons still text-only where a tiny diagram would help (e.g. permission stack is partly covered).

#### G. Accessibility
**Strengths**
- Skip link, focus-visible, reduced-motion, lazy images, print styles, keyboard palette.

**Gaps**
- Focus management on palette/nav drawer is progressive, not a full focus trap audit.
- Color contrast on gradient headings is stylish; worth occasional WCAG spot-checks on muted text.

#### H. Production readiness (buildwithgrok.com)
**Strengths**
- Static deploy is the right model for GoDaddy file hosting.
- Tests give confidence before upload.

**Gaps**
- **Not deployed yet**—the product is incomplete as a public resource until DNS + upload.
- No deploy checklist in-repo (file list, cache-bust, HTTPS, 404 page, favicon, canonical URL).
- No analytics (owner may not want them)—fine, but then **no signal on drop-off before first ship**.
- Relative paths work for static hosting; need care if hosted in a subfolder.

---

## 3. Overall scorecard (subjective, mission-anchored)

| Area | Score (1–5) | One-line |
|------|-------------|----------|
| Curriculum architecture | **5** | Ship-first five-track path is the right product. |
| Ship walkthroughs | **5** | Core differentiator vs generic AI tool blogs. |
| Progress honesty | **5** | Opened ≠ complete is rare and correct. |
| Beginner language | **4** | Strong after language pass; a few advanced pages still denser. |
| Assessment / mastery loops | **3** | Phase gates strong; self-checks sparse; no spaced ladder UI. |
| Trust / accuracy system | **4** | Inventory + ribbons excellent; will need version refresh discipline. |
| Visual craft | **4.5** | Showcase-ready; polish is ahead of some content depth. |
| Live public product | **2** | Built, tested, parked domain—not yet live. |

**Net:** As a **static curriculum for Grok Build**, Build With Grok is already an **above-average to excellent** learner product—especially the ship path and progress model. It is not yet an **exceptional public learning destination** until it is live and the first-ship funnel is shortened or emotionally celebrated earlier. Content depth and practice loops are the main product gaps; deploy is the main distribution gap.

---

## 4. Prioritized improvement ideas

Consistent with constraints: static, no auth, no offline zip, no live in-browser Grok, buildwithgrok.com.

### P0 — Do next (highest leverage for learner excellence)

1. **Deploy to buildwithgrok.com**  
   Without this, excellence is private. Add a short `docs/DEPLOY-GODADDY.md` (upload root files, CSS/JS/assets/pages, HTTPS, smoke open hub + one lesson + ⌘K).  
   *Why:* Zero code risk; unlocks real learners.

2. **Shorten emotional time-to-first-win (without breaking ship-first)**  
   - Hub default primary CTA when progress empty: **Install Grok Build** (not glossary).  
   - After Getting Started lab: explicit “You just got your first win—next is First Session, then ship.”  
   - Optional **“Express path”** callout: Install → First Session → Game walkthrough (skip glossary/TUI/keys if impatient, with honest risk note).  
   *Why:* Reduces abandonment before the real differentiator (the walkthrough).

3. **Self-check floor on remaining “gate” lessons**  
   Add 2-question checks to: tools (done), **config, rules, skills, prompts, subagents, mcp, automation** (pick highest risk first).  
   *Why:* Wrong mental models on safety-adjacent topics cost more than on cheatsheet.

### P1 — High leverage, still static

4. **Mastery ladder UI (local only)**  
   Light up Operator / Director / Systems from completed lesson sets (client-side map, no accounts).  
   *Why:* Turns Mastery from a static page into a living status.

5. **Version refresh playbook**  
   Script or checklist: on new `grok --version`, re-run slash inventory spot-check, bump verified dates, update inventory JSON.  
   *Why:* Trust system dies without cadence.

6. **Hub length diet**  
   Collapse “Full path” and “Browse tracks” behind details/summary or move one below fold with a sticky “Continue.”  
   *Why:* First-session focus.

7. **Debug studio module** (roadmap)  
   “When Grok is stuck / wrong”: read errors, @ the right files, compact vs new session, deny dangerous fixes.  
   *Why:* Real mastery for AI coding is recovery, not only happy-path ships.

### P2 — Nice upgrades

8. **Team pack module:** conventions, PR review with Grok, AGENTS.md for teams.  
9. **Full-text search optional** (still client): tiny built index of H2 + Done when lines only.  
10. **Print “lab sheet”** affordance on walkthroughs (already print CSS—add a “Print this phase” note).  
11. **Canonical meta + Open Graph** for share previews once live.  
12. **404.html** and simple `robots.txt` / sitemap for the domain.

### Deliberately skip (for now)

| Skip | Why |
|------|-----|
| Auth / cross-device progress | Complexity vs static mission; local progress is fine |
| Offline zip | Owner non-goal |
| Live in-browser Grok | Not the product; Grok is installed |
| Full LMS quizzes / grades | Walkthroughs already assess by shipping |
| Mini-CMS / What’s New | Owner deferred |
| SPA rewrite | Breaks simple hosting & deep links |

---

## 5. Recommended “do next” (single recommendation)

**Ship the site to buildwithgrok.com this week**, then run one content sprint on **express first-win path + 4–6 self-checks on advanced gate lessons**.  

Rationale: The curriculum architecture and ship walkthroughs already support the mission. The largest gap between “exceptional resource” and “excellent private project” is **public availability** plus **reducing drop-off before first ship**. Modules (debug studio) come after real learners exist.

---

## 6. Closing judgment

Build With Grok is **not a thin marketing site**—it is a real curriculum product with honest progress, serious ship labs, search, trust stamps, and legal clarity. Relative to the mission (beginners → excellent with Grok Build), the site’s **spine is exceptional**; its **practice surface is good but incomplete**; its **public presence is not yet real**.

Treat the next wins as: **deploy → first-win funnel → assessment density → debug/recovery content → version cadence.** That sequence maximizes learner excellence without violating static / no-auth / no-offline-zip constraints.
