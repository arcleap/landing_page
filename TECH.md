# ArcLeap Landing — Technical Spec

**Status:** Draft v0.1 · Needs sign-off before code starts
**Owner:** Jin
**Last updated:** 2026-04-24

> How we build arcleap.ai. Defaults are chosen for smallest possible surface area, fastest deploys, and the least code that has to exist for a static-ish marketing page.

---

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router, RSC default) | First-party Vercel, zero-config OG generation, sitemap/robots as code. |
| Language | **TypeScript** strict | Required by global rules. |
| Styling | **Tailwind CSS v4** (CSS-variable engine) | Palette + type scale live as CSS vars driven by BRAND.md. |
| Fonts | `next/font` self-hosted | Fraunces + Inter + JetBrains Mono. No Google Fonts runtime fetch. |
| Package manager | **pnpm** | Required by global TS rules. |
| Node | **22 LTS** (pinned via `.nvmrc` + `"engines"` in package.json) | Matches Vercel build image. |
| Hosting | **Vercel** (this project) | Apex `arcleap.ai`, `www` → apex redirect. |
| Analytics | `@vercel/analytics` (behind env flag) | No Plausible / GA in v1. |
| Error tracking | none in v1 | Add Sentry only if we see real traffic. |

**Explicitly not used:**
- No CMS (content lives as TS/MDX in `/content/`).
- No state library (zustand / redux — zero interactive state worth storing).
- No client-side animation library (Framer Motion) — CSS-only motion in v1.
- No icon library shipped as dependency — inline SVG for the 2–3 marks we need.
- No form backend — `mailto:` only until we have a real reason.

---

## 2. File structure

```
landing-page/
├── BRAND.md
├── CONTENT.md
├── TECH.md
├── INSPIRATION.md
├── CLAUDE.md                 # project instructions (created after scaffold)
├── package.json
├── pnpm-lock.yaml
├── .nvmrc                    # "22"
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── eslint.config.js          # flat config, typescript-eslint
├── .prettierrc
├── vercel.json               # headers, redirects (www → apex)
├── public/
│   ├── favicon.ico           # 32×32 amber "a" on ground
│   ├── apple-touch-icon.png  # 180×180
│   └── og-fallback.png       # static backup if dynamic OG fails
├── content/
│   ├── hero.ts
│   ├── positioning.ts
│   ├── pillars.ts            # array of 4 tiles
│   ├── products.ts           # Dreamist card
│   ├── company.ts            # thesis + founders
│   └── links.ts              # contact, social
├── app/
│   ├── layout.tsx            # <html>, fonts, theme CSS vars
│   ├── page.tsx              # the landing page (composes sections)
│   ├── not-found.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── opengraph-image.tsx   # dynamic OG, matches CONTENT.md §8
│   ├── twitter-image.tsx     # same template, twitter dims
│   ├── globals.css           # Tailwind + :root CSS variables
│   ├── privacy/page.tsx      # stub, noindex
│   └── terms/page.tsx        # stub, noindex
├── components/
│   ├── Nav.tsx
│   ├── Hero.tsx
│   ├── Positioning.tsx
│   ├── PillarGrid.tsx
│   ├── PillarTile.tsx
│   ├── ProductCard.tsx
│   ├── Company.tsx
│   ├── FounderCard.tsx
│   ├── Footer.tsx
│   ├── FilmStill.tsx         # framed-still primitive (per BRAND.md)
│   └── ui/
│       ├── Link.tsx          # underline-on-hover, external arrow
│       └── Eyebrow.tsx       # mono uppercase label
├── lib/
│   └── cn.ts                 # className merger
├── tests/
│   └── landing.spec.ts       # Playwright smoke
└── .github/
    └── workflows/
        └── ci.yml            # lint + typecheck + build + playwright
```

**Rule:** every section on the landing page is a self-contained component pulling from one file under `/content/`. Adding a section = one component + one content file. No cross-wiring.

---

## 3. Rendering model

- **100% Server Components** on the landing route. No `"use client"` anywhere in v1.
- Motion is CSS `@keyframes` + `prefers-reduced-motion` media query. No JS motion runtime.
- If we later add a hero 3DGS motif that genuinely needs canvas: isolate as a client component behind `<Suspense>` with a static fallback. Not before a clear visual decision is locked in INSPIRATION.md.

**JS budget for `/` (landing route):**
- Initial JS transferred: **< 30 KB gzip** (Next.js runtime + React). Ideal < 15 KB since there's no interactive code.
- Zero hydration work beyond the Next.js shell.

---

## 4. Styling conventions

### CSS variables (`app/globals.css`)

```css
:root {
  --color-ground: #0B0B0C;
  --color-ink: #F4F1EA;
  --color-ink-dim: #9A968D;
  --color-rule: #1E1D1B;
  --color-accent: #F3B85B;       /* amber */
  --color-accent-2: #7E8CFF;     /* violet-blue */

  --font-display: 'Fraunces', Georgia, serif;
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  --max-w: 1200px;
  --section-y: 10rem;   /* 160px */
}

@media (max-width: 768px) { :root { --section-y: 6rem; } }
```

### Tailwind

- Tailwind v4 `@theme` block reads the CSS variables so `bg-ground`, `text-ink`, `text-accent`, `font-display`, etc. all map cleanly.
- One custom plugin: `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-caption`, `text-mono` composite classes matching BRAND.md §4 type scale.
- Dark is the only mode. No `dark:` variants. No toggle.

### Component discipline

- No inline hex codes anywhere except the CSS-var block. Enforced via eslint rule `no-restricted-syntax` scanning for `#[0-9a-f]{3,6}` in JSX.
- No `px` values in component code — Tailwind spacing scale only (4px base).

---

## 5. Fonts

Self-host with `next/font/google`:

```ts
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';

export const display = Fraunces({ subsets: ['latin'], display: 'swap', variable: '--font-display' });
export const sans = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' });
export const mono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-mono' });
```

- Subset to Latin + minimal glyph coverage for v1 (no CJK on landing).
- Preload only Fraunces display weight (used above the fold).
- `font-display: swap` — accept the FOUT; it's preferable to invisible text.

---

## 6. Performance budget

Measured on mid-tier mobile (Moto G Power class), 4G throttle:

| Metric | Budget |
|---|---|
| LCP | < 1.5 s |
| TBT | < 100 ms |
| CLS | 0 |
| JS transferred (landing) | < 30 KB gzip |
| CSS transferred | < 15 KB gzip |
| Total page weight | < 250 KB without hero still; < 600 KB with |

Enforced via Lighthouse CI in GitHub Actions, budget file in repo.

---

## 7. Accessibility

Target: **Lighthouse a11y ≥ 98**, **axe clean**, WCAG 2.2 AA.

- Single `<h1>` per page (hero).
- Nav is a real `<nav>` with `aria-label="Primary"`. Mobile menu uses `<dialog>` + native semantics, no custom ARIA soup.
- All links have visible focus state: 2px amber outline at 2px offset.
- All interactive elements reachable by keyboard in logical order.
- Color-contrast matrix documented in BRAND.md §6; re-verified on build by a Playwright axe check.
- `prefers-reduced-motion: reduce` → disable hero motif, swap for still frame.
- `aria-hidden="true"` on purely decorative SVGs; meaningful icons have `<title>`.

---

## 8. SEO / metadata

- `app/layout.tsx` sets `metadataBase: new URL('https://arcleap.ai')`.
- Per-route `metadata` export for `title`, `description`, `openGraph`, `twitter`.
- `app/sitemap.ts` generates static sitemap with `/`, `/privacy`, `/terms` (privacy/terms excluded until populated).
- `app/robots.ts` allows all on `/`, disallows `/privacy` and `/terms` until they have content.
- `app/opengraph-image.tsx` and `app/twitter-image.tsx` use `next/og` `ImageResponse` — dynamic OG matching CONTENT.md §8.
- JSON-LD `Organization` block in `<head>` on `/` with `name`, `url`, `logo`, `sameAs`, `founder[]`.

---

## 9. Redirects & hosting

**Vercel project settings / `vercel.json`:**

- `www.arcleap.ai` → 308 → `arcleap.ai` (apex).
- HTTPS-only. HSTS via `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` after we confirm apex + www both serve.
- Security headers on all routes:
  - `Content-Security-Policy`: self + Vercel Analytics, no inline scripts except Next.js runtime.
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 10. Analytics / privacy

- `@vercel/analytics` injected only when `process.env.NEXT_PUBLIC_ANALYTICS === 'on'`. Default off in `.env.example`.
- No third-party scripts in v1. No Google Tag Manager. No Hotjar.
- `/privacy` page must exist (stub OK for launch) before analytics flips on.

---

## 11. Testing

- **Playwright** smoke on the landing route:
  - Page renders, H1 present and matches locked copy.
  - All nav anchors scroll to real sections.
  - All external links have `rel="noopener noreferrer"` and `target="_blank"`.
  - Axe scan: zero serious/critical violations.
- **Type + lint** must pass in CI.
- **No unit tests** for v1 — landing page logic is ~zero; tests would be theater.

Coverage target: N/A for pure-display routes. Revisit if we add forms or interactive state.

---

## 12. CI/CD

`.github/workflows/ci.yml` — on push + PR:

1. Checkout
2. Setup Node 22, pnpm
3. `pnpm install --frozen-lockfile`
4. `pnpm lint`
5. `pnpm typecheck` (`tsc --noEmit`)
6. `pnpm build`
7. `pnpm test:e2e` (Playwright against `pnpm start`)
8. Lighthouse CI against local build with budget JSON

Pins: actions pinned by SHA per global rules.

Deploy: Vercel auto-deploys `main` → production, PRs → preview URLs.

---

## 13. Domain / DNS

- Apex: `arcleap.ai` → Vercel A records.
- `www.arcleap.ai` → Vercel CNAME → apex redirect.
- Email: leave MX untouched (handled elsewhere). Do **not** change MX on DNS switch-over.
- Pre-launch check: `contact@`, `jinmiao@`, `careers@` all deliver.

---

## 14. Open Decisions (lock before code)

| # | Decision | Options | Recommended |
|---|---|---|---|
| T1 | Next.js version floor | 15.0 / latest stable | **latest stable at scaffold time** |
| T2 | Tailwind v4 vs v3.4 | v4 (new) / v3.4 (proven) | **v4** — simpler CSS var story |
| T3 | Client JS allowed in v1? | zero / limited | **zero** |
| T4 | Analytics on at launch? | on / off | **off**, flip on after privacy page exists |
| T5 | Repo host | GitHub (arcleap org) / personal | **GitHub `arcleap/arcleap.ai`** — confirm org exists |
| T6 | Dreamist asset for product card | stub black / real still / short loop | decide at build time based on available asset |
| T7 | Lighthouse CI budget strictness | warn / fail | **fail** — this is a marketing page, no excuse for regressions |

---

## 15. Out of scope for v1

- Research blog / `/research` index
- Press / newsroom page
- Anything authenticated
- Email capture / waitlist form
- i18n / multiple locales
- Dark/light mode toggle
- Product pages beyond the Dreamist card
