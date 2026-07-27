# Host Build With Grok on Cloudflare Pages (from GitHub)

Repo: https://github.com/Flux9000/buildwithgrok  
Site files live at the **repository root** (`index.html`, `pages/`, `css/`, `js/`, …).

## One-time: connect Cloudflare to this GitHub repo

1. Sign in at [https://dash.cloudflare.com](https://dash.cloudflare.com) (free plan is enough).
2. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Authorize Cloudflare to access GitHub; select **`Flux9000/buildwithgrok`**.
4. Build settings:
   - **Framework preset:** None  
   - **Build command:** *(leave empty)*  
   - **Build output directory:** `/` (root)  
5. **Save and Deploy**.

You get a free URL like `https://buildwithgrok.pages.dev`.

## Custom domain buildwithgrok.com

### Recommended: DNS on Cloudflare

1. Cloudflare → **Websites** → **Add a site** → `buildwithgrok.com` → Free plan.  
2. At **GoDaddy** → domain → **Nameservers** → use the two Cloudflare nameservers.  
3. Pages project → **Custom domains** → add `buildwithgrok.com` (and optional `www`).  
4. Wait until the domain is **Active** and SSL is issued.

### Keep DNS at GoDaddy

Pages → **Custom domains** → follow the CNAME/A records Cloudflare shows; add them in GoDaddy DNS.

## Redeploy

Push to `main` (or your production branch). Cloudflare rebuilds automatically when Git is connected.

```bash
cd grok-build-tutorial
# edit files…
git add -A && git commit -m "Update site" && git push
```

## GitHub Pages alternative

This repo also enables **GitHub Pages** from `main` / root so a free preview exists without Cloudflare:

`https://flux9000.github.io/buildwithgrok/`

For the real product domain, **Cloudflare Pages + custom domain** is preferred (CDN, free SSL, fits the free hosting goal).
