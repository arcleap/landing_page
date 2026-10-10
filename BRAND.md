# ArcLeap AI — Brand Spec

**Status:** Six-narrative positioning landing page, visual redesign for protected review
**Updated:** 2026-10-09

## Identity

ArcLeap AI is building predictive intelligence for how real people respond when the physical world changes.

- Public headline on this concise staging candidate: **Physicality and psychology, predicted together.**
- Public pair: **Physicality and psychology.**
- Core distinction: predict the full range of human outcomes and check forecasts against reality.
- `Human World Models` is an internal and technical descriptor, not the public headline.
- Keep architecture, datasets, experiments, partners, customers, pricing, fundraising, and unproven results private.

## Voice

1. Calm, concrete, and clearly in progress.
2. Explain physicality and psychology together in plain language.
3. Lead with distributions, scoring against outcomes, and partner-built data.
4. Use “we’re building” and “our models”; never imply the problem is solved.

Avoid “crystal ball,” absolute claims, competitor callouts, technical method details, generic AI language, and retired company directions.

## Visual direction

Editorial and alive. Warm paper and charcoal keep the identity calm; one vivid signal accent, an italic serif, and figures that show the idea give the page energy.

- Warm paper ground, charcoal type, and one signal-orange accent used for emphasis, data highlights, and the single most important line on each screen.
- Inter for headlines and body; Instrument Serif italic for the emphasized phrase in a headline (“predicted together.”, “the full range”, “Learn.”); JetBrains Mono for labels, numbering, and figure annotations.
- Figures explain the thesis rather than decorate: trajectories fanning from one change into a distribution, a population as a dot plot with one person picked out, forecast-versus-observed curves. Every figure is seeded, deterministic, and captioned **Illustrative**; none shows model output, real data, or product UI.
- One dark band (the loop) sets the page rhythm; everything else sits on paper with horizontal rules.
- Square buttons and tags; no pills, cards, glows, glass, atmospheric gradients, stock photography, robots, brains, or generic neural-network art.

### Palette

| Role | Light | Dark |
|---|---|---|
| Ground | `#F2EFE7` | `#1C1B18` |
| Panel | `#F8F6F0` | `#23221E` |
| Ink | `#24231F` | `#EEEAE0` |
| Ink dim | `#5E5B53` | `#B8B2A7` |
| Ink faint | `#77736A` | `#8F8A80` |
| Rule | `#CEC9BD` | `#3D3B35` |
| Accent (graphics, large type) | `#E04A1F` | `#FF6A3D` |
| Accent text (small type) | `#B93814` | `#FF7A4F` |
| Band | `#1C1B18` | `#121110` |

Small accent text uses the darker accent-text value to keep AA contrast on paper.

## Motion

- Motion carries meaning: the hero figure draws its paths in on load, then a few points keep travelling from the change to the outcomes; sections rise in once as they scroll into view; the loop arrow flows back from Learn to Predict.
- Content is visible without JavaScript; scroll reveals only hide content once JavaScript is running.
- `prefers-reduced-motion` removes transitions, finishes every draw-in immediately, and pauses SVG motion.

## Interaction and accessibility

- Hero has a primary CTA to the prediction approach and a secondary “Work with us” mail link.
- Navigation is sticky and contains Signals, Approach, a filled Contact button, and a compact light/dark theme button.
- The selected theme persists locally and otherwise follows the visitor’s system preference.
- Focus uses a visible 2px outline with offset.
- Each figure has a text alternative describing what it shows.

## Release boundaries

- Protected Preview carries an explicit review banner and noindex controls.
- Production never inherits Preview noindex headers.
- Speed, scale, prediction quality, and improvement remain goals until supported by scored evidence.
- JinMiao Signals and `jinmiao.ai` remain separate from ArcLeap AI branding.
