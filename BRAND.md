# ArcLeap — Brand Spec

**Status:** Draft v0.1 · Needs sign-off before code starts
**Owner:** Jin
**Last updated:** 2026-04-24

> This document defines how ArcLeap *sounds*, *feels*, and *looks* on its public surfaces. It is the arbiter when copy or design decisions are ambiguous. Dreamist has its own brand system; ArcLeap is the quieter parent above it.

---

## 1. What ArcLeap Is

ArcLeap is a **deep-tech and advanced AI company building consumer products**. We invest in foundational systems — world models, neural rendering, on-device inference, cryptographic provenance — and ship them inside products that normal people love. **Dreamist is the first.**

The landing page's job is to make three things unambiguous to a first-time visitor in under 10 seconds:

1. ArcLeap is a *company*, not a product. (A parent. More is coming.)
2. We do *real* research, not wrappers.
3. The research is pointed at *consumer* experiences, not enterprise infra.

---

## 2. Positioning

**Category:** Deep tech for consumer.

**Against (what we are not):**
- Not a research lab (labs publish; we ship).
- Not an AI app studio (studios ship; we also invent the substrate).
- Not a foundation-model company (we use and build *on top of* frontier models; we don't compete with Anthropic/OpenAI at the base layer).

**For (what we are):**
- A small company that thinks labs-deep and ships consumer-fast.
- The house that makes Dreamist, and whatever comes after it.

**One-liner (proposed, lock this):**
> *ArcLeap builds frontier AI into products worth keeping.*

**Alternates — pick one before build:**
- (A) *Frontier AI, shipped as consumer products.*
- (B) *We build deep-tech for the moments people keep.*
- (C) *ArcLeap is a deep tech for consumer company. Dreamist is the first thing we've built.*

**Recommendation:** primary one-liner + (C) as the sub-hero paragraph.

---

## 3. Voice & Tone

### Principles

1. **Plain-spoken, research-grade.** Sentences are short. Claims are specific. If we can't back it, we don't say it.
2. **Show the craft, not the category.** "We reconstruct a day as 3D scenes" beats "we leverage AI."
3. **Wonder, never cringe.** A small amount of awe is allowed — earned awe. Never exclamation-mark awe.
4. **Confident understatement.** The work is the flex. The copy is quiet.
5. **First person plural.** "We built," "we think." Never "our team of passionate innovators."

### House words (use freely)
build, ship, reconstruct, render, capture, remember, keep, frontier, foundation, provenance, world model, on-device, open.

### Banned words (hard no)
leverage, unlock, empower, seamless(ly), revolutionary, game-changing, disrupt, democratize, delight, magical, AI-powered, next-generation, cutting-edge, state-of-the-art, transform your life, passionate, mission-driven, journey. No emoji. No exclamation marks in body copy. No "🚀".

### Do / Don't

| Don't | Do |
|---|---|
| "We leverage cutting-edge AI to unlock magical experiences." | "We turn a day of real life into a 3D scene you can walk through." |
| "Our revolutionary platform democratizes creativity." | "We built a director. It watches your day and picks the moments worth keeping." |
| "Join us on this exciting journey!" | "We're hiring. See [Company](#company)." |
| "AI-powered memory assistant." | "A personal world model. Built from the days you actually lived." |

### Length discipline

- **Headlines:** ≤ 9 words. Prefer 5–7.
- **Sub-heads:** one sentence, ≤ 22 words.
- **Body paragraphs:** ≤ 3 sentences.
- **Product card copy:** ≤ 40 words.

---

## 4. Visual Direction

### Mood

**Quiet, literary, technical.** Think: the inside of an art-house film's opening credits. Closer to *Anthropic × A24* than *OpenAI × Apple*. Dark surface, warm light, serif type, one living motif.

### Palette (proposed — lock)

| Role | Hex | Notes |
|---|---|---|
| Ground | `#0B0B0C` | Near-black. Site background. Never pure black. |
| Page ink | `#F4F1EA` | Warm off-white for body copy. Never pure white. |
| Ink dim | `#9A968D` | 60% warm gray for captions and metadata. |
| Rule | `#1E1D1B` | Hairline dividers, 1px. |
| Accent (warm) | `#F3B85B` | Amber. Used sparingly: CTA underlines, single "keep" glyph, focus rings. |
| Accent (cool, secondary) | `#7E8CFF` | Violet-blue. For research-pillar tags only. |
| Signal green | `#A4F66B` | Reserved for "Lived & Animated ✓" badge contexts only (Dreamist). Do not use on ArcLeap chrome. |

**Decision needed:** amber (recommended — warmth of memory, avoids default AI-blue) vs violet-blue primary. Recommend amber; keep violet as a secondary tag color.

### Type (proposed — lock)

- **Display / H1–H2:** `Fraunces` — serif with optical sizing, slightly bookish. Free (Google Fonts). Pairs with Dreamist's "classical serif" wordmark direction.
  - Fallback: `Tiempos Headline` or `PP Editorial New` (licensed — consider for v1.1).
- **Body / UI:** `Inter` at tight tracking, weights 400 / 500. Free.
- **Mono / metadata:** `JetBrains Mono` 400. Free. Used for captions, version tags, research-tile labels.

**Scale (rem, 16px base):**

```
display   4.5  (72px) - hero H1
h1        3.0  (48px)
h2        2.0  (32px)
h3        1.375 (22px)
body      1.0625 (17px)   ← slightly larger than default; landing page copy is the product
caption   0.8125 (13px)
mono      0.8125 (13px) uppercase tracked
```

### Layout

- 12-col desktop grid, 72px gutters, max-width 1200px.
- Single narrative column on mobile. No side-by-side tricks under 768px.
- **Generous vertical rhythm.** 160px between sections desktop, 96px mobile.
- One idea per fold. Visitors should never feel "crammed."

### Motion

- One signature motion on the hero, and *nothing else moves on scroll*.
- Signature motif (proposed): a slowly drifting field of soft points — a whisper of 3DGS / point-cloud — behind the H1. Sub-1% opacity, framerate-capped. Alternative: a static framed film-still. **Decision needed.**
- Hover: 120ms ease-out, subtle underline reveal for links. No float-up cards. No scale transforms on buttons.
- Respect `prefers-reduced-motion: reduce` — swap motif for a still PNG.

### Photography / media

- If we show Dreamist output on the ArcLeap page: present it as a **framed film still with a title card**, not a product screenshot. Black matte border, title slug + timestamp in mono type.
- No stock photography. No lifestyle people-laughing-at-laptops. Ever.

### Iconography

- None, ideally. If we need marks, use single-weight line strokes (1.25px), no filled icons, no rounded corners. Source: hand-drawn or Lucide line set, stripped to neutral.

---

## 5. Logo & Wordmark

- **ArcLeap wordmark:** set in Fraunces, medium weight, slight optical adjustment on the `rcl` junction. Lowercase. Tracking: -0.01em.
- **No logomark for v1.** (Adding a mark invites the wrong comparisons. Type is enough until we've earned the glyph.)
- Favicon: stacked `a` letterform in amber on near-black, 32×32.
- Clear space: 1× cap-height on all sides.
- Lockup with Dreamist (for the product section only):
  `arcleap` (small, warm gray) / `Dreamist` (display serif, page ink)

---

## 6. Accessibility (Brand-level)

- All text on ground meets WCAG AA (4.5:1). Hero display at 3:1 minimum (large-text exemption allowed but we exceed it).
- Amber accent against ground: verified 8.1:1 — safe for CTA underlines and focus rings.
- Focus ring: 2px amber at 2px offset, visible on all interactive elements.
- Never encode information in color alone (e.g., "Lived & Animated ✓" always includes the glyph + word).

---

## 7. Open Decisions (lock before build)

| # | Decision | Options | Recommended |
|---|---|---|---|
| B1 | Primary one-liner | See §2 | *"ArcLeap builds frontier AI into products worth keeping."* |
| B2 | Accent color | amber `#F3B85B` / violet `#7E8CFF` / green `#A4F66B` | **amber** |
| B3 | Display serif | Fraunces (free) / Tiempos (licensed) / PP Editorial (licensed) | **Fraunces** for v1, revisit in v1.1 |
| B4 | Hero motif | 3DGS drift / framed film still / pure type | **pure type + small framed still** |
| B5 | Mark vs wordmark only | type-only / add minimal mark | **type-only for v1** |
| B6 | Contact email | contact@ / jinmiao@ / careers@ | **contact@arcleap.ai + careers@arcleap.ai** |

---

## 8. Guardrails

- If a design or copy choice makes the page feel more like a **product** than a **parent company**, it's wrong — route that energy into Dreamist's own surface.
- If a choice makes us look like a **foundation-model lab**, it's also wrong — we are not competing with Anthropic/OpenAI at the base layer.
- When in doubt: quieter, slower, fewer words.
