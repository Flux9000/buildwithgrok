# Next phases (professional learning product)

This document is the product roadmap for turning **Build With Grok** (buildwithgrok.com) into an exceptional learning site for the Grok Build tool.  
**Full analysis (with baseline, prioritization, risks, metrics):** see the session deliverable `academy-next-phases.md` from the roadmap goal, or the copy maintained below as the implementable summary.

## Exceptional bar (this site)

1. Newbie finishes a ship walkthrough without path confusion.  
2. Returning learner resumes the *true* next incomplete lesson.  
3. Intermediate can search to advanced topics in seconds.  
4. Advanced depth never blocks beginners (ship-first order preserved).  
5. Version-sensitive advice shows when it was last verified.  
6. Stays static-hostable (simple deploy to a normal website).

## Production home

**Canonical public site: [buildwithgrok.com](https://buildwithgrok.com)** (domain parked at GoDaddy).

- Ship goal is **live web hosting** of this static academy—not offline zip distribution.
- Local `python3 -m http.server` remains for development only.
- Prefer deploy paths that work with GoDaddy web hosting / static file upload (or any static host pointed at this domain).

## Highest leverage first

| Pri | Phase | Done when (short) |
|-----|--------|-------------------|
| P0 | **Mastery progress** (opened vs completed, Continue CTA, lab self-checks) | Continue never claims 100% from skimming |
| P1 | **Search + command palette** (client-side index) | “sandbox” / “MCP” finds the right lesson |
| P1 | **Version ribbon + review cadence** | Flag-heavy lessons show last-verified date |
| P2 | **Walkthrough chrome** (phase spy, badges, prompt bundles) | Higher finish rate on game/app ships |
| P2 | **A11y + perf + print** | Keyboard path + stable images |
| P3 | **New modules** (day-2 git, debug studio, team pack) | After P0–P1 only |
| P3 | **Production deploy to buildwithgrok.com** | Site live on the parked GoDaddy domain |

## Do not build yet

Auth, payments, multiplayer classrooms, SCORM, mandatory SPA rewrite, live in-browser Grok execution, auto-sync of every CLI changelog.

## Explicitly not a goal

**Offline packaging / zip releases** — owner preference. Learners use the academy on the web at **buildwithgrok.com**. Do not prioritize downloadable offline bundles unless the owner asks again.

## Recommended next code goal

Product phases through a11y/print, Day-2 Git, content accuracy, and **journey polish + Build With Grok rebrand + legal disclaimer** are implemented.

**Content pin (2026-08):** slash inventory + encyclopedia reconciled to installed **Grok Build 1.0.0** (including `/delete`, aliases, shell `/hooks-*`, skill `user-invocable` truth). Re-run accuracy when major CLI versions land.

Next: further modules (debug studio / team pack), optional P2 doc-depth (Mermaid, `grok inspect`, admin permission locks), or **deploy this static site to buildwithgrok.com** (GoDaddy).
