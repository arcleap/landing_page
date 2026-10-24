# ArcLeap AI — Public Content Spec

**Status:** Stealth staging page, Swiss × hairline · production publication requires Jin’s approval of the exact SHA
**Updated:** 2026-10-24
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

A locked page for the demos and the investor deck. Jin plays the demos live in pitches and on video calls with the room's own passcode. Investors get their own link and passcode instead (below), so Jin can see who opened the room and how much of each video they watched. The room isn't linked from the site, indexed, or cached. A passcode unlocks it for 30 days on that browser. Videos are files in a private Vercel Blob store, or unlisted YouTube embeds. The passcodes, video list, and signing key live only in Vercel environment variables (`ROOM_SECRET`, `ROOM_PASSCODE`, `ROOM_ADMIN_PASSCODE`, `ROOM_VIDEOS`; format in `lib/room.ts`), because this repo is public.

- Locked: **Private.** “This page is locked.”
- Unlocked: **Demos.** with **Deck** and **PDF** links and the videos, marked Confidential.
- Investor link with no such link, or one turned off: **Private.** “This link isn’t active anymore.”
- Deck: Jin's investor deck at `/room/deck` (HTML) and `/room/deck.pdf`. Its source of truth is the vault (`VC & Fundraising/BPs/ArcLeap AI — Investor Deck (YYYY-MM-DD).html` and `.pdf`); content changes happen there, not here. Only AES-256-GCM ciphertext is committed (`content/private/*.enc`); the server checks the passcode session, then decrypts with `ROOM_DECK_KEY` (format in `lib/deck.ts`). Signed-out requests get a redirect to `/room` and no deck bytes. The deck opens light whatever the system setting, with the site's light/dark switch added to its top bar as it's served; the choice is shared with the rest of arcleap.ai. To refresh it: `node scripts/room-deck.mjs <deck.html> <deck.pdf>`, commit the two `.enc` files, deploy.
- Each video resizes by dragging its corner handle, from 320px up to the window's size; double-click resets. Sizes are remembered in that browser.
- Investor links: Jin makes one per investor on **Activity.** at `/room/admin` (its own passcode, `ROOM_ADMIN_PASSCODE`). Each is `arcleap.ai/room/i/<12 letters>` with its own passcode like `K7Q2-M9XD-4TRP`, and opens only with that passcode; the investor passcode doesn't work at plain `/room`, and the room's own passcode doesn't work on a link. So passing the room on means passing on both, and whoever watches stays on that investor's record. Turning a link off signs out whoever it let in; deleting it also deletes its log.
- Activity: per link, the status (Not opened, Opened the link, In the room, Watched), last activity, visits (activity 30+ minutes apart counts again), for each video the time watched, how far in, and plays, deck and PDF opens, browsers (a second one usually means the link was passed on), cities, wrong passcodes, and a timeline. Opening the link alone can be an email security scanner; entering the passcode is a person. The room's own passcode is logged as "Anyone with it". Jin's browser, once signed in to Activity, isn't logged anywhere, so trying a link doesn't count. Stored in Upstash Redis (Vercel Marketplace; `lib/room-store.ts`), production and previews apart: browser (a random cookie), browser and system name, city, and times. No IP addresses.
- Video files: `{"title":…,"file":"demos/one.mp4"}` in `ROOM_VIDEOS`, uploaded to the project's private Blob store. The page's video address (`/room/video/<n>`) plays only in an unlocked room and forwards to a signed Blob link that expires within 3 hours, so neither can be passed on for long. The player has no download button or right-click save. YouTube embeds stay supported (`"id"`), and are tracked too, but anyone watching can open them on YouTube.

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
