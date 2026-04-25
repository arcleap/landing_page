# Arcleap — Content Spec

**Status:** Draft v0.1 · Needs sign-off before code starts
**Owner:** Jin (with Chandler review before lock)
**Last updated:** 2026-04-24

> Full copy for arcleap.ai, section by section. Load-bearing lines have variants — pick one per section before build. Voice discipline from BRAND.md §3 applies.

---

## 0. Page structure (top → bottom)

1. Nav
2. Hero
3. What we do (positioning)
4. Research pillars
5. Products (Dreamist card + "more coming")
6. Company (founders, thesis)
7. Footer (contact, legal)

Target length: **one screen of hero + five compact scrolls**. No more.

---

## 1. Nav

Left: `arcleap` wordmark.
Right (desktop): `Research` · `Products` · `Company` · `Contact`
Mobile: hamburger → same four, stacked.

- `Research` scroll-anchors to §4 for v1 (external `/research` blog in v1.1).
- `Products` → §5.
- `Company` → §6.
- `Contact` → `mailto:hello@arcleap.ai` (no form in v1).

---

## 2. Hero

**H1 (pick one — recommend A):**
- **(A)** *Frontier AI, shipped as consumer products.*
- (B) *Deep-tech for the moments people keep.*
- (C) *We build AI into things worth keeping.*

**Sub-hero paragraph (one short graf, ≤40 words):**
> Arcleap is a deep-tech and advanced AI company. We build world models, neural rendering systems, and on-device inference — and ship them inside consumer products. Dreamist is the first.

**CTAs:**
- Primary: `See Dreamist →` (smooth-scroll to §5; later → `https://dreamist.ai` when live)
- Secondary: `Read our research` → disabled link with `Soon` tag for v1

**Meta row beneath CTAs (mono, 13px, dim):**
`San Francisco · Founded 2026 · Hiring`

**Visual:** per BRAND.md, pure type on ground. Optional: one small framed film still from Dreamist (title slug `dreamist / reel 001`) aligned right on desktop, stacked below on mobile.

---

## 3. What we do

**Eyebrow (mono, dim):** `POSITIONING`

**H2:**
> Research that ships.

**Body (two grafs):**
> Most frontier AI lives in labs or behind APIs. Most consumer AI is a thin skin over someone else's model. Arcleap sits in the seam: we do real research on world models, neural rendering, and on-device systems — and we put it inside products you'd actually use.
>
> We build a small number of things, slowly, on purpose. Each one has to earn its place. Dreamist is the first.

**Alt second graf (shorter, if the page feels long):**
> We build a small number of things, slowly. Each one has to earn its place.

---

## 4. Research pillars

**Eyebrow:** `WHAT WE WORK ON`

**H2:**
> Four problems we're taking seriously.

**Four tiles — grid 2×2 desktop, stacked mobile. Each tile:**

| Field | Length |
|---|---|
| Tile number | `01`–`04`, mono, dim |
| Title | ≤ 5 words |
| Body | ≤ 30 words, one sentence OK |
| Tag | `In production: Dreamist` *or* `In research` (mono, amber for "in production", dim for "in research") |

**Tile 01 — Personal World Models**
A compact, private 3D model of a person's life — the places they live, the people around them, the objects that recur. Small enough to live on a phone.
Tag: `In production: Dreamist`

**Tile 02 — Neural Rendering at Consumer Cost**
Gaussian splatting plus artistic style transfer, tuned so a full day reconstructs for cents — not dollars. The difference between a research demo and a product.
Tag: `In production: Dreamist`

**Tile 03 — On-device Inference**
Audio transcription, keyframe selection, and scene segmentation that run on the phone or the pin. Your raw life never leaves the device in readable form.
Tag: `In production: Dreamist`

**Tile 04 — Authenticity & Provenance**
Cryptographic attestation from sensor to rendered scene. In a world of AI fiction, we build the layer that proves a moment was lived.
Tag: `In production: Dreamist`

---

## 5. Products

**Eyebrow:** `WHAT WE'VE SHIPPED`

**H2:**
> Dreamist

**Sub-head (display serif, smaller):**
> Your real days, as explorable animated worlds.

**Body (one graf, ≤ 55 words):**
> Dreamist captures your day passively — from your phone or a small wearable — and overnight turns it into a short animated film and an interactive 3D scene you can walk through. Friends don't watch your memory. They step into it.

**Product row:**
- Status chip: `Private beta · 2026`
- CTA: `dreamist.ai →` *(mark external link with arrow; open in new tab; if domain not live at ship time, keep copy but link to mailto)*

**Visual:** a single framed still or short looping clip (autoplay disabled on reduced-motion). If no asset is ready, use a black placeholder with `reel 001 / 00:00:14` mono caption — keeps the film-still language.

**"More coming" line (below card, dim, mono):**
> `more / in development`

Do **not** list unreleased products by name. Leave the line plain.

---

## 6. Company

**Eyebrow:** `WHO`

**H2 (pick one — recommend A):**
- **(A)** *Why we started this.*
- (B) *The thesis.*

**Body (two short grafs):**

> AI is being built mostly for productivity and mostly for scale. We think the more interesting frontier is on the other side — AI that makes personal, emotional, human things possible for the first time.
>
> Arcleap exists to do that work in a small, quiet, technically serious way, and to turn it into products people keep.

**Founders row (two cards, horizontal desktop, stacked mobile):**

Each card:
- Name (display serif, small)
- Role (mono, dim)
- 1-sentence bio (≤ 22 words)
- Link row: one LinkedIn or personal site + email (mono, dim)

**Jin Miao** — *Co-founder & CEO*
Previously [placeholder — fill from resume before ship]. Works on world models and the system design of consumer AI products.
`jin@arcleap.ai`

**Vijay Karunamurthy** — *Co-founder & [role TBD]*
Previously [placeholder — confirm with Vijay]. Works on [placeholder].
`vijay@arcleap.ai`

**Decision needed (C1):** short bios for both founders. Need one sentence each, locked.

**Hiring line (below cards, dim, 13px):**
> We're hiring research and product engineers in San Francisco. `careers@arcleap.ai`

---

## 7. Footer

Three columns desktop, stacked mobile.

**Left — wordmark + tagline:**
`arcleap`
`Consumer deep-tech. San Francisco.`

**Middle — contact:**
`hello@arcleap.ai`
`careers@arcleap.ai`

**Right — elsewhere:**
- `Dreamist →` (external)
- `GitHub` (only if we have a public repo to link; otherwise omit)
- `LinkedIn` (company page — confirm URL before ship)

**Bottom rule + mono line:**
`© 2026 Arcleap, Inc. · Privacy · Terms`

`Privacy` and `Terms` link to `/privacy` and `/terms` — stub pages in v1, populated before any form goes live.

---

## 8. Meta / OG / SEO

**`<title>`:** `Arcleap — Frontier AI, shipped as consumer products`
**`<meta name="description">`:** `Arcleap is a deep-tech and advanced AI company. We build world models, neural rendering, and on-device inference — and ship them inside consumer products. Dreamist is our first.`

**OG image (generated, 1200×630):**
Ground background. `arcleap` wordmark bottom-left in Fraunces. Sub-line in mono bottom-left: `frontier ai, shipped as consumer products`. Amber hairline 1px across lower third. No other ornament.

**Twitter card:** `summary_large_image`.

**Canonical:** `https://arcleap.ai/`.

**Robots:** allow all on v1; add `noindex` on `/privacy`, `/terms` until populated.

---

## 9. Open Decisions (lock before build)

| # | Decision | Options | Recommended |
|---|---|---|---|
| C1 | Founder bios (Jin, Vijay) | — | one sentence each, locked by Jin |
| C2 | Hero H1 variant | A / B / C | **A** |
| C3 | Show Dreamist asset in hero | yes (framed still) / no | **yes — single still** |
| C4 | "More coming" in §5 — named placeholders? | named / unnamed line | **unnamed line** |
| C5 | Hiring line on/off | on / off | **on** |
| C6 | Company H2 variant | A / B | **A** |
| C7 | LinkedIn/company page URL | — | confirm before ship |
| C8 | Dreamist link target at ship time | `dreamist.ai` / waitlist / mailto | confirm before ship |

---

## 10. Guardrails

- Never promise a product we haven't shipped.
- Never imply scale we don't have (team size, user counts, funding).
- Never call AI "magical." Never call research "groundbreaking." The work speaks.
- If a sentence doesn't survive being read aloud in a conference room, cut it.
