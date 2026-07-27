# Deploy Build With Grok to buildwithgrok.com (GoDaddy)

Static multi-page site. No Node/npm on the server. Upload files → open HTTPS → smoke-test.

**Deploy package on your Mac:**  
`grok-build-tutorial/buildwithgrok-deploy.zip`  
(or the folder `grok-build-tutorial/dist-deploy/`)

**Must be at the web root** (so `https://buildwithgrok.com/` serves `index.html`):

```
index.html
assets/
css/
js/
pages/
data/
```

Do **not** upload `tests/`, `docs/`, `package.json`, or this guide into production unless you want them public.

---

## 0. What you need

| Item | Why |
|------|-----|
| Domain **buildwithgrok.com** at GoDaddy | DNS / park |
| **Web hosting** on GoDaddy (or another host) | Domains alone only show a parking page |
| About **5–10 minutes** after hosting is active | Upload + SSL |

If you only bought the domain and never added hosting, start at **Step 1**.  
If hosting is already active, skip to **Step 3**.

---

## 1. Confirm or add hosting

1. Sign in: [https://account.godaddy.com](https://account.godaddy.com)  
2. Open **My Products** (or **Websites**).  
3. Look for **Web Hosting**, **cPanel Hosting**, or **Managed WordPress** (WordPress is *not* ideal for this static site—prefer **Linux / cPanel** economy or Deluxe).

**If you have no hosting:**

1. GoDaddy → **Hosting** → buy the cheapest **Linux / Economy / Web Hosting** plan.  
2. When asked which domain, attach **buildwithgrok.com**.  
3. Wait until status is **Active** (email may take a few minutes–hours).

**If the domain is “parked” only:** parking ≠ live site. You still need hosting (or another static host with DNS pointed at GoDaddy’s nameservers or A records).

---

## 2. Point the domain at the hosting (if needed)

Often GoDaddy does this when you “connect domain” during hosting setup.

1. **My Products** → domain **buildwithgrok.com** → **DNS**.  
2. For GoDaddy hosting, typical setup is either:
   - **Nameservers** = GoDaddy’s default for that hosting account, or  
   - An **A record** `@` → hosting IP (shown in hosting dashboard / cPanel).  
3. Leave **www** as a CNAME to `@` or as provided by the hosting wizard.  
4. DNS can take **minutes to 48 hours** (often &lt; 1 hour).

---

## 3. Open File Manager (easiest upload path)

1. **My Products** → your **Web Hosting** → **Manage**.  
2. Open **cPanel** (or **File Manager**).  
3. Open **File Manager**.  
4. Go to the **document root** for the site. Common names:
   - `public_html` ← most common for the primary domain  
   - or `public_html/buildwithgrok.com` if the domain is an “addon”

You should see this folder as the place visitors hit for `https://buildwithgrok.com/`.

**Clear parking junk carefully:**  
If you see a default `index.html` or parking page, rename it to `index-old.html` (don’t delete until your site works). Keep other cPanel folders (`cgi-bin`, etc.).

---

## 4. Upload the site

### Option A — Zip (recommended)

1. On your Mac, use:  
   `/Users/banditclaw/grok-projects/grok-build-tutorial/buildwithgrok-deploy.zip`  
2. In File Manager → `public_html` → **Upload** → choose that zip.  
3. After upload completes, **select the zip** → **Extract**.  
4. Confirm the tree looks like:

   ```
   public_html/
     index.html
     assets/
     css/
     js/
     pages/
     data/
   ```

5. If extract created a nested folder (`public_html/dist-deploy/index.html`), **move** the contents up into `public_html` so `index.html` is directly in the root.  
6. Delete the zip from the server when done (optional cleanup).

### Option B — FTP (FileZilla, Cyberduck, etc.)

1. In hosting **Manage**, open **FTP** accounts or cPanel → **FTP Accounts**.  
2. Note host (often `ftp.yourdomain.com` or the server hostname), username, password, port **21**.  
3. Connect and upload the contents of `dist-deploy/` into `public_html/` (same tree as above).

### Option C — Drag folders in File Manager

Upload `index.html`, then folders `assets`, `css`, `js`, `pages`, `data` one by one (slower).

---

## 5. Turn on HTTPS (SSL)

1. In cPanel or GoDaddy hosting dashboard, open **SSL/TLS** or **Security** → **Install SSL**.  
2. Prefer free **AutoSSL** / **Let’s Encrypt** (often “Free SSL”).  
3. Wait until the certificate shows **Active** for `buildwithgrok.com` (and `www` if you use it).  
4. Optional: enable **Force HTTPS** / HTTPS redirect if the host offers a one-click toggle.

---

## 6. Smoke test (do this before you celebrate)

Open in a **private/incognito** window:

| Check | URL / action | Pass if |
|-------|----------------|---------|
| Hub | `https://buildwithgrok.com/` | Dark “Build With Grok” hub, **Install Grok Build** primary button |
| CSS | View page | Not unstyled plain HTML |
| Lesson | `https://buildwithgrok.com/pages/01-getting-started.html` | Lesson loads, styles OK |
| Walkthrough | `https://buildwithgrok.com/pages/21-walkthrough-first-game.html` | Phases/content load |
| Search | On hub: **⌘K** / **Ctrl+K** | Palette opens (needs JS) |
| Asset | Favicon / hero image | Not broken image icons |
| Disclaimer | Footer | “not affiliated” text present |
| Progress | Mark a lesson complete, refresh hub | Continue path updates (browser-local) |

If CSS/JS 404: files landed in a **subfolder**—move so `index.html` is in `public_html`.

---

## 7. Redeploy later (updates)

1. Rebuild zip from this repo:

   ```bash
   cd /Users/banditclaw/grok-projects/grok-build-tutorial
   rm -rf dist-deploy buildwithgrok-deploy.zip
   mkdir dist-deploy
   cp index.html dist-deploy/
   cp -R assets css js pages data dist-deploy/
   (cd dist-deploy && zip -r ../buildwithgrok-deploy.zip .)
   ```

2. Upload zip → extract into `public_html` (overwrite).  
3. Hard-refresh the browser (**⌘⇧R**) because CSS is cache-busted with `?v=…` but browsers can still be sticky.

---

## Troubleshooting

| Symptom | Likely fix |
|---------|------------|
| Still see “Coming soon” / park page | Hosting not active, or DNS not pointing at hosting |
| Hub OK but `/pages/...` 404 | `pages/` not uploaded, or wrong root |
| No styles | `css/style.css` missing or wrong path depth |
| Mixed content warnings | Load site via **https://** and enable SSL |
| www works, apex doesn’t (or reverse) | Add/fix A + CNAME or redirect in hosting |
| Upload size errors | Zip is ~3MB; should be fine—use FTP if File Manager chokes |

---

## What not to do

- Don’t put the site only under `/blog` or WordPress media unless you want that URL.  
- Don’t require Node on GoDaddy for this project.  
- Don’t upload `tests/` or private notes unless you intend them public.  
- Don’t force a SPA rewrite—this site is multi-page static HTML on purpose.
