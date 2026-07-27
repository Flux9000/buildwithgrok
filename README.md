# Build With Grok

**Build With Grok** is a step-by-step curriculum for **Grok Build**. Written for people who may never have used a terminal or an AI coding tool.

## Where it lives

| URL | Role |
|-----|------|
| **[buildwithgrok.com](https://buildwithgrok.com)** | Canonical public site (custom domain; point DNS when ready) |
| **[flux9000.github.io/buildwithgrok](https://flux9000.github.io/buildwithgrok/)** | Free GitHub Pages preview |
| [github.com/Flux9000/buildwithgrok](https://github.com/Flux9000/buildwithgrok) | Source repo |

This is a **static multi-page site** (no server build). Prefer free hosting via **Cloudflare Pages** (connect this GitHub repo) or **GitHub Pages**. Domain registration can stay at GoDaddy; you do not need GoDaddy web hosting. **Offline zip packaging is not a product goal.**

Deploy notes: [`docs/DEPLOY-CLOUDFLARE.md`](docs/DEPLOY-CLOUDFLARE.md) · [`docs/DEPLOY-GODADDY.md`](docs/DEPLOY-GODADDY.md)

Local serve is for development only:

## Open locally (development)

Serve from this folder so CSS and images always load:

```bash
cd grok-build-tutorial
python3 -m http.server 8765
# open http://localhost:8765
```

You can open `index.html` directly. Each page includes a dark-theme fallback so a missing stylesheet does not leave a blank white page.

## The only path you need

Do these **in order**:

1. **Words You’ll See** (`pages/00-glossary.html`) — optional skim  
2. **Getting Started** — install and sign in  
3. **Your First Session** — send a goal, approve a tool  
4. **The Grok Screen** + **Keyboard Basics**  
5. **First ship (pick one or both):**  
   - How Game Projects Work → **Walkthrough: First Game** (Star Clicker Arena)  
   - How App Projects Work → **Walkthrough: First App** (Focus List)  
6. **Intermediate** — slash commands, tools, sessions, safety, prompts  
7. **Advanced** — only after you ship (rules, plan mode, MCP, automation, dashboard)  
8. **Path to Mastery** + **Cheatsheet**

If two options appear, the page states **which to do first**. When a Beta feature is missing on your build, the lesson tells you what to do instead.

## Verify the site

```bash
npm test
# or: node tests/academy-integrity.mjs
```

## Structure

| Path | Role |
|------|------|
| `index.html` | Home |
| `pages/` | All lessons |
| `js/curriculum.js` | Lesson order and navigation |
| `css/style.css` | Design |
| `tests/academy-integrity.mjs` | Integrity checks |

Official product docs (version-exact flags): in Grok type `/docs`, or see `~/.grok/docs/user-guide/`.
