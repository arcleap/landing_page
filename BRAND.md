# ArcLeap — Brand Spec

**Status:** Track A implementation baseline
**Updated:** 2026-08-05
**Authority:** `docs/PUBLIC-COPY-SOURCE.md` for language; this file for visual execution

## Identity

ArcLeap is a vertical full-loop company building toward verified physical work. It is product-clear and market-broad: precise about the intent-to-build loop without limiting the company to one customer type, one part family, B2B, or B2C.

- Mission: **The compiler between wanting and making.**
- Product headline: **From intent to verified build.**
- ArcLeap is the company. JinMiao Signals and `jinmiao.ai` are Jin’s personal brand and never mix with ArcLeap navigation, metadata, feeds, or identity.

Never describe ArcLeap as a verification platform, verification-as-a-service, a CAD tool, or a model wrapper.

## Voice

1. Calm, plain-spoken, and engineering-grade.
2. Specific about the work; broad about who may use it.
3. Aspirational by default. Present tense is reserved for operations Jin confirms are live.
4. Verification and human review stay visible.
5. No hype, emojis, competitor callouts, or invented claims.

Avoid `text-to-CAD`, `text-to-3D`, `AI CAD tool`, `guaranteed manufacturable`, `revolutionize`, and claims of optimal design.

## Visual direction

The system combines an editorial layout with engineering-drawing structure:

- near-black blue ground rather than pure black;
- warm off-white reading color;
- machinist blue as the single technical accent;
- drawing grids, datums, dimension marks, constraint arcs, and thin rules;
- abstract intent resolving into measured geometry;
- no robot arms, humanoids, factory stock photography, glowing AI brains, CAD screenshots, or speculative hardware renders.

### Palette

| Role | Value | Use |
|---|---|---|
| Ground | `#071017` | Primary background |
| Panel | `#0C1821` | Subtle section surfaces |
| Ink | `#F3F5F3` | Headlines and primary copy |
| Ink dim | `#AEB9BF` | Body and supporting copy |
| Ink faint | `#71848F` | Metadata |
| Rule | `#20313B` | Hairlines and grids |
| Accent | `#3EB8FF` | CTA, focus, datums, labels |
| Accent light | `#80D5FF` | CTA hover |

### Type

- Display, body, and navigation: Inter.
- Technical labels and metadata: JetBrains Mono.
- Headlines use tight tracking and moderate weight; the page should feel precise, not futuristic or industrial-costume.

### Layout

- Twelve-column desktop grid, max width 1280px.
- One narrative column on small screens.
- Generous vertical rhythm and one idea per section.
- The hero pairs type with one code-native engineering diagram.

### Motion

- One restrained line-trace sequence in the hero.
- No scroll choreography or floating cards.
- `prefers-reduced-motion` removes the animation and smooth scrolling.

## Interaction and accessibility

- One prominent production CTA: Contact ArcLeap.
- Navigation uses in-page anchors.
- Focus uses a visible 2px machinist-blue outline with offset.
- A keyboard skip link targets the main content.
- Decorative drawing elements are hidden from assistive technology.
- Do not encode meaning with color alone.
- Maintain WCAG AA contrast for normal text.

## Release boundaries

- Protected Preview carries an explicit review banner and noindex controls.
- Production does not inherit Preview noindex headers.
- Promise, employer affiliation, forms, uploads, hiring, and missing legal routes stay out until their recorded gates are satisfied.
- The production canonical host is `https://arcleap.ai`; `www` permanently redirects to apex.
