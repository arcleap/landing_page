# ArcLeap AI — Public Content Spec

**Status:** Stealth staging page, Swiss × hairline · production publication requires Jin’s approval of the exact SHA
**Updated:** 2026-10-09
**Authority:** `_ARCLEAP — Source of Truth.md` public positioning and homepage ruling revised 2026-10-09

The page stays deliberately vague. It states the headline, asks the question, and names where we begin. It does not explain method, the forecast loop, distributions, data strategy, partners, architecture, datasets, experiments, customers, pricing, or fundraising.

## Page structure

1. 00 ArcLeap AI — hero with Fig. 01
2. 01 Direction
3. 02 Where we begin
4. 03 Contact and footer

## Navigation

- ArcLeap AI wordmark → `#top`
- Signals → `https://jinmiao.ai/signals`
- Direction → `#approach`
- Contact → `mailto:contact@arcleap.ai`
- Light/dark theme button

## 00 Hero

- Frame: `00` `ARCLEAP AI` · `CURRENTLY IN STEALTH`
- H1: **Physicality and psychology, predicted together.**
- Body: **We’re building predictive intelligence for how people respond when the physical world changes.**
- CTAs: **Get in touch** → `mailto:contact@arcleap.ai` · **Our direction** → `#approach`
- Fig. 01 caption: `FIG. 01` · `MOVE THE POINTER TO INTRODUCE A CHANGE` · live `X 000 · Y 000` read-out

## 01 Direction

- H2: **What happens next?**
- **Every change to the physical world lands on people, and no two respond alike. We’re building models that anticipate how.**

## 02 Where we begin

1. Products — Things people hold, wear, and use.
2. Spaces — Places people move through.
3. Robots — Machines that share space with people.

## 03 Contact and footer

- **Building something that works around people?** We’d like to hear from you.
- Display `contact@arcleap.ai`.
- Include the low-profile attribution `Co-Founder & CEO: Jin Miao`, `Co-Founder: Qi Guo`, and `Co-Founder: Yifan Wang`.
- No founder biographies, portraits, hiring copy, request form, or public uploads.

## Copy in this revision

The headline is unchanged. “Currently in stealth”, “Get in touch”, “What happens next?”, and “Where we begin” come from earlier approved stealth versions. New and pending Jin’s approval: the hero body (adapted from the brand identity line), the direction paragraph, the three one-line area descriptions, the contact question, and the figure caption.

## Private room (`/room`)

A locked page Jin uses to play demos live in pitches and on video calls. It isn't shared with anyone, linked from the site, indexed, or cached. One passcode unlocks it for 30 days on that browser; videos are unlisted YouTube embeds. The passcode, video IDs, and signing key live only in Vercel environment variables (`ROOM_SECRET`, `ROOM_PASSCODE`, `ROOM_VIDEOS`; format in `lib/room.ts`), because this repo is public.

- Locked: **Private.** “This page is locked.”
- Unlocked: **Demos.** with the videos, marked Confidential.
- Each video resizes by dragging its corner handle, from 320px up to the window's size; double-click resets. Sizes are remembered in that browser.
- Videos play through our own surface and controls (YouTube IFrame API), so YouTube's hover chrome never shows: click the video to play or pause, scrub the timeline below it, and use Play, Mute and Full screen in the caption. If YouTube refuses to start from our button, the surface steps aside for a direct click; if the API can't load, it falls back to a plain embed.

## Metadata

- Title: `ArcLeap AI — Physicality and Psychology, Predicted Together`
- Description: “ArcLeap AI is building predictive intelligence for how people respond when the physical world changes.”
- Canonical: `https://arcleap.ai/`
- Preview adds `noindex, nofollow` metadata and `X-Robots-Tag: noindex, nofollow, noarchive`.

## Never publish

- “Crystal ball”
- “World model” in the headline or subheadline
- Absolute claims such as “predicts the future,” “prove,” or “guarantee”
- Competitors, method details, named data partners, active studies, customers, pricing, or fundraising
- Retired engineering-agent, fixture, marketplace, consumer, or delivery-guarantee directions

## Release gate

Production remains unchanged until Jin approves the exact protected Preview candidate.
