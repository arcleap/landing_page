# Arcleap Landing — Inspiration & Visual Direction

**Status:** Draft v0.1 · Needs sign-off before code starts
**Owner:** Jin
**Last updated:** 2026-04-24

> References we're borrowing from, specifically what we're borrowing, and — maybe more importantly — what we refuse to borrow. The goal is a site that feels unmistakably *Arcleap* without being a pastiche.

---

## 1. The target feel

**One-sentence target:** *The credits sequence of an A24 film, if A24 ran a research lab in San Francisco.*

Three adjectives, in priority order:
1. **Literary** — serif, measured, written-not-marketed.
2. **Technical** — confident in the craft, precise in the language.
3. **Warm** — amber over cold blue; memory, not chrome.

If a visitor thinks "AI startup," we've lost. We want them to think "quiet studio with real people."

---

## 2. Primary references (steal from these)

Each reference gets one line on *what we're actually taking*, not a general vibe.

| Site | Take this, specifically |
|---|---|
| **anthropic.com** | Serif H1 + grotesque body pairing. Calm one-idea-per-fold cadence. Honest "we are a research company" voice. |
| **the-browser-company.com** (*Letter to the Browser Company*) | Founder-voice Company section. Intimate without being performative. |
| **arc.net** (early landing, 2023–2024) | Typographic hero — type does the heavy lifting. No stock video. |
| **luma.ai** / **polycam.com** | Point-cloud / 3DGS hero motif, used *once*, used *subtly*. Permission to hint at what's inside without showing a product demo. |
| **humane.com** (archived 2024) | Product-as-object reverence. Film-still framing of hardware. Matte black with single warm accent. (Ignore the company's arc; the page craft was real.) |
| **rewind.ai** (pre-Limitless rebrand) | Personal memory framing. Amber tones on dark. Quiet copy about something inherently emotional. |
| **openai.com/sora** (launch page) | Film-still cards with title + timestamp captions. Vocabulary of cinema ("reel," "scene"). |
| **vercel.com** | Spacing rigor. Hairline dividers. Section-to-section rhythm math. |
| **linear.app** | Copy discipline — every sentence earns its line. Motion discipline — if it moves, there's a reason. |
| **pi.ai** (Inflection) | Calm palette. Restraint. Permission to be quiet. |

**Non-obvious references worth a look:**
- **craftdocs.com** — eyebrow-label + section cadence.
- **readwise.io** (blog landing) — literary voice for a technical product.
- **are.na** — neutral chrome, content-forward, unsurprising in the good way.

---

## 3. What we're *specifically* taking

Pinned decisions, not vibes:

1. **Type pairing** (Anthropic-style): Fraunces display serif + Inter body grotesque + JetBrains Mono for metadata.
2. **Hero composition**: big serif H1 left, optional single framed film-still right. No hero image bleeding full-bleed. No video autoplay.
3. **Section rhythm**: eyebrow label (mono, uppercase, dim) → H2 (serif) → one-paragraph body → component (tiles / cards). Repeated identically across all sections. Rhythm does the design work.
4. **Motion**: at most one living element (slow point-cloud drift in hero background, < 1% opacity). Everything else is static. No scroll-triggered reveals. No parallax.
5. **Divider language**: 1px amber hairlines between major sections, inset to a sub-container width. Echoes film-credit rules.
6. **Film-still primitive**: any visual asset from Dreamist is framed in a 16:9 container with a matte black border, a mono caption row beneath (`dreamist / reel 001 / 00:00:14`). Keeps us in cinema vocabulary and excuses low-res stills while we're pre-launch.
7. **CTA treatment**: text-link-with-arrow for primary (`See Dreamist →`), amber underline on hover; text-only-with-arrow for secondary. No pill buttons. No drop-shadow cards.

---

## 4. Anti-references (explicitly refuse)

These patterns are off-limits for Arcleap's page. If a mock leans this way, reject.

- **The AI-landing-page starter pack:** glassmorphism, neon purple-blue gradients, floating 3D mesh balls, "sparkle" emojis, "✨" anywhere.
- **The SaaS homepage grid:** 3×3 feature cards with icons, each with a two-word bold title and a two-line gray subhead.
- **The startup-collage hero:** team laughing at laptops, diverse stock photo, "Trusted by" logo strip.
- **Scroll-hijacking storytelling:** full-screen scroll-locked chapters that take control of the viewport. (Cool in Awwwards, hostile in life.)
- **Parallax soup:** five elements moving at five speeds on scroll.
- **"Powered by GPT / built on Claude" vibe:** we are not a model skin. We don't advertise the substrate.
- **Waitlist theatrics:** full-screen signup overlays, modal popups, "join 12,340 others" counters.
- **Dark/light toggle in the header:** the site is dark. Commit.
- **"Demo" video above the fold** for a parent company. (Save that for Dreamist's own surface.)
- **Emoji-driven copy:** no. Not even one. Not ironically.
- **Overuse of serif:** serif is for display and the founders' names. Body copy is Inter. Mixing serif into paragraph text instantly looks like a Medium article.

---

## 5. Moodboard decisions to lock

| # | Decision | Options | Recommended |
|---|---|---|---|
| I1 | Hero motif | (a) pure type · (b) type + small framed still · (c) type + 3DGS point drift | **(b) pure type + a small framed film-still right-aligned.** Cheapest to ship, hardest to mess up. |
| I2 | Accent chroma | amber `#F3B85B` / violet `#7E8CFF` / green `#A4F66B` | **amber** — aligns with "memory" semantics; avoids AI-blue default. |
| I3 | Divider style | none / hairline inset / full-bleed rule | **hairline inset, amber 1px** |
| I4 | Product card visual | black stub / real still / short loop | **real still if available at ship; stub if not.** Loops only in v1.1. |
| I5 | Section label system | eyebrow mono-label everywhere / numbered sections `01` `02` / none | **eyebrow mono-label everywhere** |
| I6 | Founder photos | yes / no | **no in v1.** Names + one-sentence bios only. Revisit when we have real press photos. |
| I7 | Any illustration? | none / one custom arc glyph / generative pattern | **none.** Type only. |

---

## 6. Reference screenshots to gather

Before build, collect **five** screenshots into `/inspiration/` (gitignored or `.webp` under 200KB each):

1. Anthropic homepage hero (for type pairing).
2. Luma hero (for 3DGS motif restraint).
3. Humane product page section (for film-still framing).
4. Arc landing 2023 (for typographic hero).
5. Rewind or Browser Company Company section (for founder-voice tone).

These are for internal reference only. Do not ship them. Do not link to them publicly.

---

## 7. The sanity check

Before we ship, the page has to pass these three tests:

1. **Print test.** Print the page in grayscale. Does it still look deliberate? (Lots of "AI" sites collapse to goo.)
2. **Read-aloud test.** Read every line of copy out loud. Any sentence that embarrasses you in a quiet room gets cut.
3. **Sibling test.** Put a screenshot of arcleap.ai next to a screenshot of dreamist.ai (when it exists). Are they unmistakably of the same house, but clearly not the same product? Parent-and-child, not twin.

If any of these fail, it's not ready.
