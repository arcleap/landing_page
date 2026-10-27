# ArcLeap AI — Public Content Spec

**Status:** Stealth staging page, Swiss × hairline · production publication requires Jin’s approval of the exact SHA
**Updated:** 2026-10-27
**Authority:** `_ARCLEAP — Source of Truth.md` public positioning and homepage ruling revised 2026-10-09

The page stays deliberately vague. It states the headline, says who it is for, and how far it reaches. It does not explain method, the forecast loop, distributions, data strategy, partners, architecture, datasets, experiments, customers, pricing, or fundraising.

## Page structure

1. 00 ArcLeap AI — hero with Fig. 01
2. 01 Direction
3. 02 Any world
4. 03 Contact and footer

## Navigation

- ArcLeap AI wordmark → `#top`
- Signals → `https://jinmiao.ai/signals`
- Direction → `#approach`
- Contact → `mailto:contact@arcleap.ai`
- Light/dark theme button

## 00 Hero

- Frame: `00` `ARCLEAP AI` · `CURRENTLY IN STEALTH`
- H1: **The human layer of any world.** (“of any world.” in the accent)
- Body: **We’re building one model that predicts how people respond, physically and psychologically, when their world changes.**
- CTAs: **Get in touch** → `mailto:contact@arcleap.ai` · **Our direction** → `#approach`
- Fig. 01 caption: `FIG. 01` · `MOVE THE POINTER TO INTRODUCE A CHANGE` · live `X 000 · Y 000` read-out

## 01 Direction

- H2: **Built for people.**
- **Almost everything that gets built is built for people. Today’s AI is learning to make things. We work on the other side: how people will respond, before anything is built.**

## 02 Any world

- H2: **1 cm to 1 km.**
- **From something held in a hand to a whole city, every change lands on someone. We predict how they’ll respond, in body and mind, at any scale.**
- Fig. 02 caption: `FIG. 02` · `POINT AT A RING TO READ ITS SCALE` · live read-out from `1 CM` to `1 KM`
- No list of sectors (products, spaces, robots): Jin ruled them too concrete on 2026-10-27.

## 03 Contact and footer

- **Building something for people?** We’d like to hear from you.
- Display `contact@arcleap.ai`.
- Include the low-profile attribution `Co-Founder & CEO: Jin Miao`, `Co-Founder: Qi Guo`, and `Co-Founder: Yifan Wang`.
- No founder biographies, portraits, hiring copy, request form, or public uploads.

## Copy in this revision

Staging proposal of 2026-10-27, pending Jin’s approval. The headline and hero body come from Jin’s positioning line; “Built for people.” and its paragraph from the trailer’s opening; “1 cm to 1 km.” from the trailer’s scale scene; the contact question follows the new direction. “Currently in stealth” and “Get in touch” are unchanged. Nothing else from the trailer goes on the page.

## Private room (`/room`)

A locked page for the demos and the investor deck. Jin plays the demos live in pitches and on video calls, and may give the passcode to investors to read the deck; it then opens the demos too. The room isn't linked from the site, indexed, or cached. One passcode unlocks it for 30 days on that browser; videos are unlisted YouTube embeds. The passcode, video IDs, and signing key live only in Vercel environment variables (`ROOM_SECRET`, `ROOM_PASSCODE`, `ROOM_VIDEOS`; format in `lib/room.ts`), because this repo is public.

- Locked: **Private.** “This page is locked.”
- Unlocked: **Demos.** with **Deck** and **PDF** links and the videos, marked Confidential.
- Deck: Jin's investor deck at `/room/deck` (HTML) and `/room/deck.pdf`. Its source of truth is the vault (`VC & Fundraising/BPs/ArcLeap AI — Investor Deck (YYYY-MM-DD).html` and `.pdf`); content changes happen there, not here. Only AES-256-GCM ciphertext is committed (`content/private/*.enc`); the server checks the passcode session, then decrypts with `ROOM_DECK_KEY` (format in `lib/deck.ts`). Signed-out requests get a redirect to `/room` and no deck bytes. The deck opens light whatever the system setting, with the site's light/dark switch added to its top bar as it's served; the choice is shared with the rest of arcleap.ai. To refresh it: `node scripts/room-deck.mjs <deck.html> <deck.pdf>`, commit the two `.enc` files, deploy.
- Each video resizes by dragging its corner handle, from 320px up to the window's size; double-click resets. Sizes are remembered in that browser.
- Investor links: `arcleap.ai/watch/<id>` redirects (307) to the DocSend document link `docsend.com/view/<id>`, which opens the trailer directly; `arcleap.ai/room/<id>` redirects to the Space link `docsend.com/view/s/<id>` (`next.config.ts`; ids are 16 lowercase letters and digits). DocSend can't be shown in a frame, so the visitor ends up on docsend.com. Jin keeps one DocSend link for every VC, with an email required (not verified), downloads off and an expiry, and sends the arcleap.ai form of it; there's no room passcode on these. DocSend asks for the email, plays the trailer, and records who watched; Jin reads that on DocSend. Which link went to which firm is never stored here.

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
