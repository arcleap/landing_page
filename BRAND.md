# ArcLeap AI — Brand Spec

**Status:** Stealth landing page in the Swiss × hairline style, for protected review
**Updated:** 2026-10-09

## Identity

ArcLeap AI is building predictive intelligence for how real people respond when the physical world changes.

- Public headline on this concise staging candidate: **Physicality and psychology, predicted together.**
- Public pair: **Physicality and psychology.**
- `Human World Models` is an internal and technical descriptor, not the public headline.
- The public page stays deliberately vague: it names the question and where we begin, never how.
- Keep method, the forecast-and-score loop, distributions, data strategy, partners, architecture, datasets, experiments, customers, pricing, fundraising, and unproven results private.

## Voice

1. Calm, brief, and clearly in progress (“currently in stealth”).
2. Ask the question rather than explain the answer.
3. Use “we’re building”; never imply the problem is solved.

Avoid “crystal ball,” absolute claims, competitor callouts, technical method details, generic AI language, and retired company directions.

## Visual direction: Swiss × hairline

Swiss supplies the page; hairline (github.com/lucasmarkes/hairline, MIT) supplies the figures. This matches the house style used for ArcLeap films.

- **Grid.** 12 columns, flush-left, asymmetric: text in columns 1–6, figures in 7–12.
- **Section frame.** Every section opens on a 1px ink rule with its number in the accent, its name as a mono label, and a running label on the right.
- **Type.** Inter Tight for display (300 for the large question, 500 elsewhere, tracking −0.035 to −0.055em); Inter for body; Geist Mono, uppercase with +0.08em tracking, for labels, buttons, navigation, and read-outs.
- **One accent.** Swiss red-orange, with one meaning: the response — the headline’s “predicted together.”, the people who respond in a figure, and section numbers.
- **Figures.** Isometric line drawings on a 2:1 camera: rounded prisms, opaque plates in the page colour painted back to front, 0.9px non-scaling strokes on a five-step grey ramp. The stroke is the only highlight (grey → ink → accent), no words inside figures (read-outs go in the mono caption), and every resting frame reads on its own.
- No glows, shadows, gradients, glass, pills, cards, stock photography, or generic AI imagery.

### Palette

| Role | Light | Dark |
|---|---|---|
| Background / plate | `#FFFFFF` | `#08090A` |
| Ink | `#0A0A0A` | `#F2F3F5` |
| Muted text | `#6B6B6B` | `#A3A7AF` |
| Rule | `#E4E4E7` | `#1F2023` |
| Accent (graphics, large type) | `#E0421A` | `#FF5A2C` |
| Accent text (small type) | `#CC3A14` | `#FF5A2C` |
| Figure hi / edge / mid / lo | `#232327` `#A4A4AC` `#C3C3C9` `#E0E0E4` | `#D0D6E0` `#5B5D64` `#3E3E44` `#29292D` |

## Motion

- Hairline’s curves: `cubic-bezier(.32,.72,0,1)` over 700ms for discrete moves, springs (k 100, c 18) for continuous ones, `cubic-bezier(.5,0,.1,1)` for stroke colour.
- Fig. 01 answers the pointer: a change follows it across a crowd and the people near it rise, each by their own amount. Without a pointer the change wanders slowly; the figure stops when it is off screen.
- Section rules draw in once; the focus figures lift their object off a dashed footprint on hover.
- Content is visible without JavaScript; `prefers-reduced-motion` removes transitions, stops the wander, and keeps the pointer response instant.

## Interaction and accessibility

- Hero CTAs: **Get in touch** (mail) and **Our direction** (`#approach`).
- Navigation is sticky: Signals, Direction, Contact, and a compact light/dark theme button. The theme persists locally and otherwise follows the system.
- Focus uses a visible 1.5px outline with offset.
- Each figure has a text alternative.

## Release boundaries

- Protected Preview carries an explicit review banner and noindex controls.
- Production never inherits Preview noindex headers.
- Speed, scale, prediction quality, and improvement remain goals until supported by scored evidence.
- JinMiao Signals and `jinmiao.ai` remain separate from ArcLeap AI branding.
