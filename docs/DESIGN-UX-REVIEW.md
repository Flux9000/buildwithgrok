# Design & UX review: Build With Grok vs premium references (xAI, Cursor)

**Date:** 2026-07-30  
**Ground truth:** shipped `grok-build-tutorial/` (post **hub diet v1**): `data-hub-diet="v1"`, single `data-hub-primary-cta`, `#path-stepper` + `data-express-path`, `data-hub-catalog` / `#full-path`, `data-ship-entry`, drawer filled via `navListHtml` + `data-nav-drawer-filled="curriculum"`.  
**Live:** https://www.buildwithgrok.com (HTTP 200, content aligned with current hub diet).  
**References:** [x.ai](https://x.ai) (SpaceXAI product/marketing), [cursor.com](https://cursor.com) (AI coding product marketing).  
**Not a redesign plan for implementation in this goal** — craft review + ranked recommendations only.

**Fairness frame:** x.ai and Cursor are **brand / product marketing** sites. Build With Grok is a **multi-page curriculum** (26 lessons, labs, walkthroughs, local progress). We compare **design craft principles** (hierarchy, restraint, trust, first impression), not feature parity or “become a splash page.”

**Supersedes older critique on hub busyness:** Prior `docs/SITE-CRITIQUE.md` “hub length diet” and dual-Install issues are **partially fixed** by hub diet v1. This review does **not** restate dual primary CTAs or eight parallel path lists as current facts.

---

## 1. Executive summary

Build With Grok already feels like a **serious product**, not a blog template: dark system tokens, display + mono type, glass cards, ship-first narrative, honest progress (opened ≠ complete), search palette, and walkthrough chrome that matches the *work* of shipping.

Against **x.ai-class** craft, the academy still reads as **curriculum-first UI** that was beautified in layers: slightly more chrome density than premium marketing, hero meta that over-explains, Google Fonts payload, inconsistent CSS cache-bust across pages, and less “one breath” hero composition than x.ai’s sparse type-led landing.

**Net:** Pedagogically stronger than almost any marketing site; **perceived luxury** lags x.ai/Cursor because they sell *aspiration with emptiness*, while you sell *competence with structure*. The win is not cloning their emptiness—it is borrowing **restraint, hierarchy, and product theater** without deleting labs or first-win.

| Dimension | Grade (relative) | One line |
|-----------|------------------|----------|
| First impression | B+ | Dark cinematic hub; still more “sections” than x.ai hero |
| Visual system | A− | Coherent tokens, Syne/DM Sans/JetBrains Mono |
| Learning UX | A | Ship-first, Done when, self-checks, walkthrough phases |
| Navigation | B+ | Drawer fixed; ⌘K search; sidebar on lessons |
| Trust / brand | A− | Disclaimer, independent identity, no fake affiliation |
| Premium polish vs x.ai | B | Good glass/glow; less ruthless whitespace & motion craft |
| Mobile | B | Toggle + drawer work; long lessons still heavy |

---

## 2. What we do well (with evidence)

### 2.1 Product clarity and first-win (better than most marketing sites)

- **Single primary CTA** after hub diet: `#continue-btn` + `data-hub-primary-cta` → empty Install, returners via `resolveHubPrimaryCta` (`js/curriculum.js`).  
- **Ship-first story** is explicit: hero subcopy, `[data-first-value-framing]`, express path (`data-express-path`), First Ship section (`data-ship-entry`).  
- **Honest progress:** progress pill, opened ≠ complete, walkthrough phases required for complete—marketing sites rarely teach *how* progress works.

**Learner impact:** New users know the job: install, then ship—not “explore our vision.”

### 2.2 Coherent dark design system

From `css/style.css` `:root`:

- Surfaces: `--bg` `#06080f`, glass cards, sidebar, strong borders.  
- Accents: cyan / violet / amber / green with soft fills and glow.  
- Type: **Syne** (display), **DM Sans** (body), **JetBrains Mono** (meta/code).  
- Radius, shadow, ease, section spacing as tokens—not one-off hex soup.

Critical CSS + dark `color-scheme` prevents white-flash; theme fallback in `main.js` if CSS fails.

### 2.3 Learning-task UI (our unfair advantage)

| Surface | Strength |
|---------|----------|
| Lesson shell | Lead, prereqs, on-this-page, callouts, Done when, self-check, pager |
| Walkthrough | Phase TOC, spy host, checkboxes, copy prompts, anti-prompt guidance |
| Hub path | One map (`#path-stepper`) + collapsed catalog (`data-hub-catalog`) |
| Search | Client palette (⌘K)—product-like power |

This is **deeper UX** than x.ai’s hero demos: you instrument *doing*, not only *watching*.

### 2.4 Trust and legal honesty

- Footer `data-legal-disclaimer`: not affiliated with Grok/xAI/SpaceXAI.  
- Showcase copy: independent community guide.  
- Version ribbons / slash inventory for flag-heavy accuracy.  

Premium brand sites often hide disclaimers; you put independence up front—correct for this product.

### 2.5 Progressive enhancement and a11y signals

- Skip link, main landmark, focus-visible, `prefers-reduced-motion` rules.  
- Lazy images (with hero eager).  
- No-JS still shows Install default and dark critical CSS.  
- Drawer always filled with curriculum (`data-nav-drawer-filled="curriculum"`)—fixed empty-hamburger on hub.

### 2.6 Hub diet v1 worked

Current hub is **not** the old busy syllabus wall. Still present: hero → progress ribbon → path + catalog → compact showcase → ship → docs tip → footer. Dual Install, track-cards wall, method list, full-potential mid-page tease are gone. That is a real design win.

---

## 3. Gaps vs x.ai-class craft (they do X / we do Y)

### 3.1 Hero composition

| x.ai / Cursor | Build With Grok |
|---------------|-----------------|
| Huge type-led headline; short sub; **two** strong CTAs (Get API / Docs; Download / Get started) | Solid h1 + longer hub-sub (3 jobs in one paragraph) |
| Product **demo as hero content** (chat, CLI, agent UI) | Hero photo + decorative orbs + meta chips |
| Vast negative space; scroll reveals chapters | Hero full + ribbon + path immediately under |

**Takeaway:** They sell *capability theater*. We sell *instructions*. Borrow: shorter sub, more air under h1, optional one product-like visual of “Grok in terminal” instead of only abstract hero art.

### 3.2 Message density

| They | We |
|------|-----|
| One idea per screen-height (“Frontier models…”, “One API…”) | Hero still packs: install, ship, advanced unlock, progress honesty, first wins |
| Stats as sparse milestones (1M+ calls, latency) | Progress meta is useful but competes with CTA |

**Takeaway:** Keep progress honesty, but demote “opened ≠ complete” to secondary/tooltip so the first screen feels like x.ai: **one verb**.

### 3.3 Visual restraint

| They | We |
|------|-----|
| Few accent colors; black/white dominant | Cyan + violet gradients on buttons, orbs, multi-track color system |
| Photography/video as intentional product art | Good assets, but “showcase v3” still signals many decorative layers |
| Motion is cinematic or none | Reveal-on-scroll, hover lifts, glow—pleasant, slightly “template SaaS 2024” |

**Takeaway:** Track colors help learning navigation; hero can be quieter (fewer orbs/meta chips).

### 3.4 Navigation chrome

| They | We |
|------|-----|
| Minimal global nav: product areas + primary CTA | Fixed nav: brand, progress pill, search, hamburger |
| Secondary content in deep pages | Full curriculum always one drawer away |

**Takeaway:** Our nav is right for a curriculum. Gap is **desktop discoverability of search** (icon vs “Search lessons ⌘K” affordance like product sites label “Docs”).

### 3.5 Performance / polish impression

| They | We |
|------|-----|
| Optimized Next bundles, controlled image CDN | Static HTML—excellent hostability—but **3 Google font families** on every page |
| Consistent asset pipeline | Lesson pages still `style.css?v=20260727h` while hub is `20260730a` → stale CSS risk |
| OG/social previews at brand grade | Meta description OK; Open Graph / share cards still light |

**Takeaway:** Static is a feature; font subsetting + unified cache-bust + OG images would raise “expensive” feel without SPA.

### 3.6 Social proof and product theater

| They | We |
|------|-----|
| Logos, quotes, live demos, news grid | Pedagogical proof: Done when, self-checks, ship projects |
| Enterprise trust | Independent disclaimer (correct) but little “proof of learning outcome” gallery |

**Takeaway:** Don’t fake Fortune-500 logos. Consider **outcome artifacts** (screenshot of Star Clicker / Focus List) as *our* social proof—closer to Cursor’s “show the product.”

### 3.7 What we must *not* copy from x.ai

- Empty marketing pages with no path for beginners.  
- Dual funnel (API vs Chat) without a single first action for novices.  
- Hiding difficulty or time cost.  
- Brand dominance that would blur **independent** Build With Grok positioning.

---

## 4. Surface-by-surface notes (current product)

### 4.1 Hub (`index.html`, hub diet v1)

**Works:** Single Install primary; “See the path” + glossary as ghosts; progress ribbon without second primary; path-stepper + express; catalog collapsed; ship zone with two cards; legal footer Install-first.

**Friction / craft gaps:**

1. Hero sub is still a **paragraph of curriculum policy**, not a punch line.  
2. Three hero-meta spans (count, first wins, opened≠complete) fight the CTA.  
3. Showcase strip after path is slightly redundant with ship/path messaging.  
4. Ship cards use `btn-primary` again—after install CTA, two more gradient primaries compete visually (OK for section focus; could be one primary per card hierarchy with outline secondary for app vs game).  
5. Decorative orbs + full-bleed hero: cinematic, not sparse like x.ai.

### 4.2 Nav / search / drawer

**Works:** Brand home; progress pill; search install; hamburger opens full tracks (`navListHtml`); lesson sidebar mirrors path.

**Gaps:**

- Search control is easy to miss vs labeled “Search” on premium sites.  
- No persistent “Install / Continue” in nav (x.ai keeps Get API in chrome)—optional sticky secondary for returners.  
- Drawer is long (26 lessons)—correct for power users; could add sticky track jump headers.

### 4.3 Lesson shell (e.g. Getting Started)

**Works:** Meta, lead, prereq strip, on-this-page, ordered labs, security callout, first-win celebration, self-check, pager + mark complete.

**Gaps:**

- On-this-page can be long; sticky TOC is good but visual weight high.  
- Many callout types (tip/warn/lab)—powerful, occasionally “yellow sticky forest.”  
- CSS version lag vs hub.  
- Narrow prose column is readable (good); not “magazine” sparse.

### 4.4 Walkthrough shell (First Game)

**Works:** Phase TOC, progress spy, time/difficulty, send/avoid prompts, phase checkboxes—this is **best-in-class learning UX**, not marketing UX.

**Gaps:**

- Opening stack of callouts (progress + how to use + time) before Phase 0—could collapse “how/time” into one.  
- Still competes with hub beauty language; walkthroughs can stay dense—hub should stay sparser by contrast (already improved).

### 4.5 Brand & trust

**Works:** Distinct “Build With Grok” identity; disclaimer; no pretension of official xAI.

**Gaps:**

- Name proximity to Grok/xAI is a UX risk: users may think it’s official—disclaimer helps, hero could one-line “Independent curriculum.”  
- No favicon/wordmark system as polished as x.ai’s product marks (we have gradient brand-mark—fine, not iconic).

### 4.6 Mobile

**Works:** Viewport meta, drawer curriculum, stacked ship cards, touch targets on buttons.

**Gaps:**

- Long lessons on phone = endurance test (inherent).  
- Hero meta wraps into three lines under CTA—crowded.  
- Fixed nav + scroll progress is good; ensure search + toggle don’t collide on 320px.

---

## 5. What is still valid from prior critiques vs superseded

| Older claim | Status now |
|-------------|------------|
| Dual Install CTAs | **Superseded** (hub diet item 1) |
| Path restated 6–8 ways | **Mostly superseded** (express + stepper + catalog only) |
| Three pre-ship CTAs | **Superseded** (ship section only) |
| Empty hamburger on hub | **Fixed** (full drawer curriculum) |
| Hub still longer than x.ai hero | **Still valid** (by product type) |
| Deploy gap | **Superseded** (live on domain) |
| Self-check floor | **Addressed** earlier; not a design gap |
| Need more air / restraint | **Still valid** as craft goal |
| OG / share previews | **Still valid** P1 polish |

---

## 6. Prioritized recommendations (≤10)

Ordered by **first-session perceived quality** and craft leverage. None required in this goal.

### P0 — Highest leverage craft (keep ship-first)

1. **Hero copy diet**  
   - One line value prop + one line first win. Move “opened ≠ complete” off hero face.  
   - **Impact:** Instant x.ai-like calm; Install still primary.  
   - **Risk:** Low if ribbon retains progress honesty.

2. **Unify CSS cache-bust** across hub + all `pages/*`  
   - **Impact:** Users always get hub-diet styles; fewer “broken look” reports.  
   - **Risk:** None.

3. **Show the product, not only the abstract**  
   - One terminal/Grok or ship-outcome visual near First Ship (Cursor/x.ai pattern).  
   - **Impact:** Emotional “I get what I’m building.”  
   - **Risk:** Low if static image.

### P1 — Polish & trust

4. **Label search in nav** (“Search” / “⌘K”) not icon-only.  
5. **Open Graph + twitter cards + consistent title pattern** for share previews.  
6. **Font load strategy:** subset or system-stack fallback already exists—reduce to 2 families or self-host critical weights.  
7. **Ship card button hierarchy:** one solid primary (game) + ghost (app), or equal but less gradient competition with hero.  
8. **Independent one-liner in kicker** (“Independent curriculum · not an xAI product”)—reduces brand confusion.

### P2 — Nice, not urgent

9. **Sticky lesson TOC** refinement / collapse “how to use” on walkthroughs.  
10. **Micro-motion restraint:** fewer simultaneous reveals; prefer one signature motion (closer to x.ai sparseness).

**Explicitly not recommended:** SPA rewrite; cloning x.ai IA; removing labs/progress; fake enterprise logos.

---

## 7. Closing judgment

**What we do well:** We are a **learning product** with a real design system, clear first-win, ship walkthroughs, and honest progress—areas where x.ai.com does not even try.

**Where we improve:** **Restraint and hero theater.** Premium sites make emptiness feel expensive; our risk is residual instructional density in the first viewport and layered decorative chrome from successive polish passes.

**Strategic stance:** Be the **best curriculum for Grok Build**, with **x.ai-level craft on the surfaces that market the path** (hub hero, nav, ship cards)—not a clone of a model company homepage.

---

## 8. Verification notes (this analysis)

| Plan check | Result |
|------------|--------|
| Report covers hub, nav, lesson, walkthrough, tokens | Yes §§2–4 |
| Cites hub diet v1 markers | Yes (data-hub-diet, single CTA, catalog, ship-entry, drawer) |
| x.ai comparison specific | Yes §3 tables |
| Peer (Cursor) | Yes §§3–4 |
| ≤10 ordered recs | Yes §6 (10) |
| No implementation in this goal | Affirmed |
| Live site | www.buildwithgrok.com 200; matches diet structure |
