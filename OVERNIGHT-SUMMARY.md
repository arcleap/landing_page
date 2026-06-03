# Overnight run — Signals shareability & distribution

**Branch:** `enhance/signals-shareability-20260603-105301` (off clean `main`)
**Author:** Claude Code (autonomous), 2026-06-03 overnight
**Status:** T1–T7 implemented. Nothing pushed. `main` untouched. No deploy.

Review the diff:

```bash
git diff main...enhance/signals-shareability-20260603-105301
git log --oneline main..enhance/signals-shareability-20260603-105301
```

---

## TL;DR

Shared `/signals` links now render as rich OG/Twitter cards with a description
and a branded 1200×630 image, instead of bare URLs. The site now has an RSS
feed, a sitemap, robots.txt, stable permalinks (with legacy redirects), and a
cookieless-analytics scaffold that stays dark until you flip one env var.

The 3 live issues (06-01, 06-02, 06-03) + the `/signals` hub were backfilled, so
the cards work the moment this branch deploys — no pipeline re-run required.

---

## ⚠️ Two things to confirm before/at merge

1. **Canonical host: `www` vs apex.** The spec mandated `https://www.arcleap.ai`
   for all OG/canonical/sitemap/RSS URLs, so that's what the signals pipeline
   uses (`SITE_ORIGIN`). **But `app/layout.tsx` (the homepage) uses the apex
   `https://arcleap.ai`.** These should match, and whichever host you don't pick
   should 301 to the one you do. To switch the signals side to apex, set env
   `ARCLEAP_SITE_ORIGIN=https://arcleap.ai` (or edit the constant in
   `ai_news_publish.py`) and re-run the backfill (below). This is the single knob.

2. **"Join 1,000+ Founders" (audit item 5).** I left this copy unchanged (safe
   default). If the Buttondown list isn't actually 1,000+, soften it — it's in
   `ai_news_publish.py` (sidebar) and the live `public/signals/*.html`.

---

## The spec assumed the *old* archive scheme — I adapted (important)

The spec was written when there were **two pages per day**
(`YYYY-MM-DD-morning.html` / `-afternoon.html`) and assumed `YYYY-MM-DD.html`
was the broken legacy form. Since then the pipeline switched to **one page per
day** (`commit 2beced4`), so reality is **inverted**:

- **Canonical now:** `public/signals/archive/YYYY-MM-DD.html` (one per day). ✅ stable.
- **Legacy now:** the `-morning` / `-afternoon` permalinks. These were being
  *deleted* by the build. I changed that: they now emit tiny `meta-refresh` +
  `canonical` **redirect stubs** to `YYYY-MM-DD.html#morning|#afternoon`, so any
  link shared under the old scheme keeps resolving.

So T3 is satisfied, just pointed the correct direction. The literal "redirect
`YYYY-MM-DD.html` → afternoon" from the spec does **not** apply (that path is the
live canonical page now).

---

## What changed, by task

### T1 — Share cards + meta  ✅
`signals/scripts/ai_news_publish.py`:
- New `render_share_head(...)` injects per page: `meta description` (≤160 chars,
  derived from the issue's lede headlines), `link canonical`, OG (`type=article`
  for issues / `website` for the hub, `title`, `description`, `url`, `image`,
  `site_name=ArcLeap`, `article:published_time` ISO-8601 PT), Twitter
  (`summary_large_image` + title/description/image), and the RSS `alternate` link.
- Wired into `wrap_template(...)` so **every** issue page and the `/signals` hub
  get it. All OG/canonical/image URLs are absolute (`SITE_ORIGIN`).
- Description derivation (`_meta_description`) handles the mixed bullet markers
  (`-`, `*`, `•`) the briefings actually use and skips the "Source Statistics"
  preamble, so the text reads like the real lede.

### T2 — OG image  ✅ (with a pragmatic renderer)
- **No Pillow / pip / sharp / canvas** in this environment. I used the **cached
  Playwright Chromium headless-shell** as the rasterizer: a branded HTML card
  (BRAND.md palette — near-black ground `#0B0B0C`, warm ink `#F4F1EA`, amber
  accent `#F3B85B`, Fraunces/serif display) is screenshotted to a 1200×630 PNG.
- `public/og/signals-default.png` — the reliable baseline; every page falls back
  to it.
- `public/og/signals/<date>.png` — per-issue card (date kicker + top headline).
- `render_og_card()` **never blocks**: if no browser is found on the host (e.g.
  the Vercel build or a future cron box), it returns False and the page uses the
  committed default. The committed PNGs mean cards work regardless.

### T3 — Stable permalinks + legacy redirects  ✅  (see inversion note above)
- `write_legacy_session_stub()` emits the `-morning` / `-afternoon` redirect
  stubs; backfilled for 06-01 and 06-02 (and 06-03 morning). The build no longer
  deletes them.

### T4 — RSS  ✅
- `generate_rss()` writes `public/signals/rss.xml` (RSS 2.0), newest-first, with
  title / absolute link / description / RFC-822 pubDate / canonical guid.
- Reusable: called at the end of `build_site()` **and** by the standalone backfill.

### T5 — sitemap + robots  ✅
- `public/sitemap.xml` — homepage, `/signals`, every issue, with `<lastmod>`.
- `public/robots.txt` — allow all + `Sitemap: <SITE_ORIGIN>/sitemap.xml`.
- `git_push_changes()` now stages all of `public/` (was `public/signals`) so
  sitemap/robots/og ship on future pipeline runs.

### T6 — Analytics scaffold (cookieless, no account invented)  ✅
- Issue/hub `<head>` (via `render_analytics()`) **and** the Next homepage
  (`app/layout.tsx`) inject a Plausible-style script **only** when a domain is
  configured. Unset → nothing is injected (no broken tag).
- **Recommendation: Plausible or Umami** — privacy-friendly, lightweight,
  cookieless, no GDPR banner. See turn-on steps below.

### T7 — Regenerate / backfill existing issues  ✅
- `signals/scripts/build_share_assets.py` — a standalone, **network-free,
  no-push, no-content-regen** runner. It rebuilt the share assets and
  **idempotently injected** the `<head>` block into the existing static pages
  (markers `<!-- arcleap:share-head -->`), so the 3 live issues + hub already
  have cards. Safe to re-run anytime (e.g. after changing `SITE_ORIGIN`).

---

## How to deploy (your call in the morning)

This branch only adds files + regenerates static output; it doesn't change the
app's runtime behaviour. Normal flow:

```bash
git checkout enhance/signals-shareability-20260603-105301
git diff main...HEAD            # review
# optional local build sanity check (needs deps):
pnpm install && pnpm build
git checkout main && git merge --no-ff enhance/signals-shareability-20260603-105301
git push origin main            # Vercel rebuilds & deploys
```

After deploy, validate cards with:
- https://cards-dev.twitter.com/validator (or post in a draft)
- https://www.opengraph.xyz/  → paste an issue URL
- Facebook sharing debugger (forces a re-scrape)
- `curl -sI https://<host>/signals/rss.xml` and `/sitemap.xml`, `/robots.txt`

If you change the canonical host, re-run the backfill **before** merging:
```bash
cd signals/scripts
ARCLEAP_SITE_ORIGIN=https://arcleap.ai python3 build_share_assets.py
git add -A public && git commit -m "chore(signals): switch share URLs to apex host"
```

## How to turn analytics ON (3 steps)

1. Create the site in **Plausible** (or self-host **Umami**) for your domain
   (e.g. `arcleap.ai`). No code change needed to start.
2. Set the env var in Vercel (Production): `ARCLEAP_ANALYTICS_DOMAIN=arcleap.ai`.
   - This drives **both** the Next homepage and (on the next pipeline run /
     backfill, run with the same env) the signals static pages.
   - Optional: `ARCLEAP_ANALYTICS_SRC` to point at a self-hosted/Umami script.
3. Redeploy. The `<script defer data-domain=...>` tag appears; nothing is added
   while the var is unset.

Then re-run `build_share_assets.py` with `ARCLEAP_ANALYTICS_DOMAIN` set so the
already-published static issue pages pick up the tag too.

---

## Skipped / deferred / notes

- **`pnpm build` not run** — `node_modules` isn't installed here; install+build
  is heavy/network-bound. The only app change (`app/layout.tsx`) is a trivial,
  well-formed conditional + a metadata `alternates.types` entry. Please run
  `pnpm build` once locally before merging.
- **`signals/README.md` was modified by an external/concurrent process** during
  this run (mtime 10:54, before my edits; not referenced by any of my code —
  likely your in-flight pipe-cleaning or a cron). **I left it untouched and did
  not stage it.** It still shows as modified in `git status`; handle as you see fit.
- **OG renderer dependency** — per-issue cards depend on a headless Chromium on
  the box that runs the pipeline. The committed default guarantees a baseline
  even where none exists; if you want per-issue cards generated during cron runs,
  ensure a chromium/headless-shell binary is reachable (auto-detected, or set
  `OG_CHROMIUM_BIN`).
- **`metadataBase` in `app/layout.tsx`** stays apex `arcleap.ai` (unchanged) —
  tied to the host decision above.

## Files

New:
- `signals/scripts/build_share_assets.py`
- `public/og/signals-default.png`, `public/og/signals/2026-06-0{1,2,3}.png`
- `public/signals/rss.xml`, `public/sitemap.xml`, `public/robots.txt`
- `public/signals/archive/2026-06-0{1,2}-{morning,afternoon}.html`,
  `2026-06-03-morning.html` (redirect stubs)

Modified:
- `signals/scripts/ai_news_publish.py` (share head, OG, RSS, sitemap, robots,
  stubs, analytics; `git add public`)
- `app/layout.tsx` (gated analytics + RSS alternate)
- `public/signals/index.html` + `archive/2026-06-0{1,2,3}.html` (head backfilled)
