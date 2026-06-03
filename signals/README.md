# Signals Hub — AI News Pipeline (3-tier)

Self-contained, founder-tuned AI/markets intelligence for the ArcLeap **Signals Hub**
(`/signals` on the landing page, deployed to Vercel). Runs twice daily via Hermes cron.
Three tiers, split by cost:

- **Tier 1 — collect + enrich (cheap):** scrape → verify-tag → dual-score (importance + edge) → JSON sidecar. **Outliers are preserved & flagged, never culled** — the true value lives there.
- **Tier 2 — compile (Opus `claude -p`, subscription):** filter the sidecar into Jin's Founder Reading Notes (public Highlights + passcode-gated Co-founder Confidential) and queue convergence candidates.
- **Tier 3 — deep eval (on-demand, NOT daily):** escalate a candidate to `/brainstorm` (Builder↔Critic↔Monica) / `/decide`. See `~/my-vault/Research/founder-reading-notes/`.

The **publisher** then translates, writes spoken narration, synthesizes voice-over, encrypts the
confidential section, builds one static page per day, and pushes to GitHub → Vercel.

## Layout
```
signals/
├── scripts/                    # canonical, version-controlled pipeline code
│   ├── ai_news_collector.py      # T1a: scrape HN + Reddit + X (xurl) → raw JSONL
│   ├── enrich_signals.py         # T1b: verify-tag + dedup/delta + dual-score (Gemini Flash, parallel) → enriched JSON; NEVER culls, flags [OUTLIER]
│   ├── run_tier2_briefing.py     # T2: enriched JSON → claude -p (Opus) Reading Notes + Monica red-team + candidate ledger
│   ├── ai_news_publish.py        # translate + narrate + TTS + encrypt + build per-day HTML → ../public/signals, git push → Vercel
│   ├── tts_synth.py              # local TTS backend (run by the TTS venv): Kokoro (misaki g2p) + Piper fallback
│   ├── ai_news_synthesize.py     # raw JSONL → plain digest (fallback/util)
│   └── run_briefing_free.py      # superseded by run_tier2_briefing.py (kept for reference)
└── data/                       # GITIGNORED (regenerable)
    ├── raw/                      # YYYY-MM-DD.jsonl raw scrapes
    ├── enriched/                 # YYYY-MM-DD.json  ← Tier-1↔Tier-2 contract + Raw Materials source
    ├── translated/               # <date>-<session>.<public|cofounder>.zh.md (+.hash) — Opus ZH cache, per-part
    ├── narration/                # <date>-<session>[.co].{en,zh}.txt (+.hash) — Opus spoken-script cache
    ├── audio/                    # *.hash — TTS content-hash cache markers
    └── briefings/                # morning/ + afternoon/ — archived briefings (latest per session wins)

public/signals/                 # COMMITTED build output (served by Vercel)
├── index.html                   # hub: one card per day
├── archive/<date>.html          # one page per day (Morning + Afternoon stacked)
├── audio/<date>-<session>-<en|zh>.mp3        # PUBLIC voice-over (Daily Highlights)
└── vault/<date>-<session>-co-<en|zh>.enc     # ENCRYPTED confidential voice-over (AES-GCM)
```

## Pipeline flow (per session)
1. **collect** → `data/raw/<date>.jsonl`
2. **enrich** → `data/enriched/<date>.json` (dual-scored, outliers flagged, deltas vs prior 7d)
3. **Tier-2 compile** (`run_tier2_briefing.py`, Opus): Reading Notes markdown with a public part and a
   `## 🕵️‍♂️ Co-founder Confidential` part, plus an appended Monica red-team. Archived under
   `data/briefings/<session>/` and `~/my-vault/Research/founder-reading-notes/`.
4. **publish** (`ai_news_publish.py`), for each (date, session):
   - **split** the EN briefing into `public` / `cofounder` on the exact `## 🕵️‍♂️ Co-founder Confidential` header.
   - **translate** each part to fluent ZH via Opus (`claude -p`), cached per-part. *(Splitting EN first, then
     translating each part separately, prevents the gated section from leaking into the public ZH text if a
     translated header is rephrased.)*
   - **narrate**: Opus writes a smooth, **full-coverage** spoken script (EN + native ZH) for the public part,
     and a separate confidential script for the cofounder part.
   - **synthesize** voice-over locally (see TTS). Public → `public/signals/audio/*.mp3`. Confidential →
     encrypted `public/signals/vault/*.enc`.
   - **encrypt** the confidential HTML (AES-GCM) and embed; build the per-day page; `git push` → Vercel.

## Voices & TTS (local, `tts_synth.py`)
Runs under a dedicated `uv` venv at `~/.signals-tts` (python3-venv/ensurepip are missing system-wide).
- **English → Kokoro `am_michael`** (`lang=en-us`). Expressive, ~natural prosody.
- **Chinese → Kokoro `zm_yunyang`** with **misaki** pinyin→IPA g2p fed via `kokoro.create(phonemes, is_phonemes=True)`.
  - ⚠️ **Do NOT use espeak `lang="cmn"` for Chinese** — it produces *Mandarin-sounding-but-wrong* phonemes (Kokoro's
    zh voices were trained on misaki). Embedded English in ZH (e.g. "OpenAI", "GPT-5") is phonemized by misaki's
    English g2p and concatenated, so names are spoken correctly.
  - Piper (`zh_CN-huayan-medium` / `en_US-lessac-medium`) remains an automatic fallback if Kokoro/g2p fails.
- Narration text is cleaned for speech (`clean_for_tts`): markdown/URLs/citations/emoji stripped, dashes → pauses,
  one sentence per line for natural phrasing.

## Translation & narration (Opus, subscription)
Both are `claude -p --model opus` (no per-token cost). Translation = fluent ZH markdown (keeps names in English,
preserves links). Narration = a spoken digest that covers **every** item (top stories, sparks, tracked hits,
contrarian watch, verification flags) as flowing prose, not a markdown read-out. Gemini Flash is a translation
fallback only.

## Webpage
- **Hub** (`index.html`): one card per day (badges for the sessions present).
- **Sidebar**: one entry per day; the **Morning / Afternoon** labels are underlined links that jump to
  `#morning` / `#afternoon` on that day's page.
- **Day page** (`archive/<date>.html`): both sessions stacked. Each session has, top→bottom:
  1. **Daily Highlights** — public notes, bilingual, with the public voice-over player.
  2. **Co-founder Confidential** — encrypted, passcode-gated (see below), with its own encrypted voice-over.
  3. **Raw Materials** — Tier-1 enriched set (collapsible): confidence badge + delta + i/e scores + ★ outliers.

## Confidential gate — REAL encryption
The cofounder section (text **and** audio) is **AES-256-GCM** encrypted with a key derived from the passcode via
**PBKDF2-HMAC-SHA256** (150k iters, 16-byte salt, 12-byte IV). Payload = JSON `{s,i,c,n}` (base64). Decryption is
**client-side only** via the browser Web Crypto API; the entered passcode is kept in `localStorage.arcleap_gate_pc`.
- **Not** the old base64 obfuscation — the ciphertext is useless from view-source without the passcode, and a
  wrong passcode genuinely fails to decrypt.
- Confidential audio is stored as a separate encrypted `.enc` file; on unlock the browser fetches it, decrypts to
  an in-memory Blob, and shows a player inside the gated block (follows the EN/中文 toggle).
- Passcode: `0915` (override at build time with `SIGNALS_GATE_PASSCODE`). Python helper: `_encrypt_gate()`.

## How it runs (Hermes cron + shims)
Hermes only runs cron scripts **physically under `~/.hermes/scripts/`** and **rejects symlinks resolving outside
it**. Each entry there is a tiny **real shim** that `runpy`-delegates to the canonical repo script (edit the repo;
the shim picks it up, no redeploy). Scripts resolve repo paths via `os.path.realpath(__file__)`.

| Job | Name | Schedule | Script |
|---|---|---|---|
| collect AM/PM | news-collect | `0 7,15 * * *` | ai_news_collector.py |
| briefing AM/PM (`f708e9d64322` / `e9b4bb7aede2`) | news-briefing | `45 7,15 * * *` | **run_tier2_briefing.py** |
| `ba3bda1de8ff` | news-website-publisher | `0 8,16 * * *` | ai_news_publish.py |

**Cron timeout:** Opus + Kokoro exceed the default 120s no-agent cap → `cron.script_timeout_seconds: 1200` in
`~/.hermes/config.yaml` (live-reloaded; no gateway restart).

## Billing (important)
Tier-2/3 + translation + narration use `claude -p` billed to the **Claude subscription**, not per-token. The
scripts strip `ANTHROPIC_API_KEY` / `ANTHROPIC_AUTH_TOKEN` / `ANTHROPIC_BASE_URL` / `CLAUDE_API_KEY` from the child
env (fail-safe) and honor `CLAUDE_CODE_OAUTH_TOKEN`. **Do not `source ~/.hermes/.env` before a `claude -p` call** —
it would re-inject the Anthropic key and silently switch to per-token. Tier-1 enrichment uses Gemini Flash
(`GOOGLE_API_KEY`, separate Google cost).

## Dependencies
- **Hermes venv** (`~/.hermes/hermes-agent/venv`, runs collector/enrich/tier2/publish): `cryptography` (AES-GCM);
  stdlib otherwise. `claude` CLI on PATH (subscription login). `xurl` on PATH (collector). `git` remote `origin` → Vercel.
- **TTS venv** (`~/.signals-tts`, runs `tts_synth.py`): `kokoro-onnx`, `misaki[zh]` + `spacy` + `en_core_web_sm`
  (3.8.x) + `num2words` (English-in-Chinese g2p), `soundfile`, `piper-tts` (fallback). Kokoro model + voices in
  `~/.signals-tts-voices`. `espeak-ng` (system) for English g2p. `ffmpeg` (system) for wav→mp3.
- `GOOGLE_API_KEY` in `~/.hermes/.env` (Flash enrich).

## Operating it
- **Manual rebuild (no deploy):** `SIGNALS_NO_PUSH=1 ~/.hermes/hermes-agent/venv/bin/python signals/scripts/ai_news_publish.py`
- **Env vars:** `SIGNALS_NO_PUSH=1` (dry-run), `SIGNALS_TTS_MAX_PER_RUN=N` (cap audio synths/run; Kokoro is slow —
  default 2; raise for backfills), `SIGNALS_GATE_PASSCODE`, `SIGNALS_TTS_PY`, `SIGNALS_TTS_VOICES`.
- **Deploy = git push** of `public/signals` (the publisher does this autonomously unless `SIGNALS_NO_PUSH=1`).
- **Retention:** `prune_audio(14)` removes `audio/` mp3s and `vault/` .enc older than 14 days.
- Legacy: `~/.hermes/scripts/ai_news_scraper.py` (predecessor, unused).

## Shareability & distribution
Share cards (OG/Twitter), RSS, sitemap, robots, and a cookieless-analytics scaffold are produced by
`scripts/build_share_assets.py` + the per-issue `<head>` in `ai_news_publish.py`. Outputs: `public/og/`,
`public/signals/rss.xml`, `public/sitemap.xml`, `public/robots.txt`. Analytics injects nothing unless
`ARCLEAP_ANALYTICS_DOMAIN` is set. Full breakdown + "turn it on" steps: `OVERNIGHT-SUMMARY.md` (repo root).
*(Note: this layer was authored against the older per-session permalink scheme; reconcile with the current
one-page-per-day `archive/<date>.html` at merge — see the day-page section above.)*

## Design rationale (folded from the former vault spec — this README is now the single source)
Began as a strong aggregator but mediocre analyst; the 3-tier split fixes that.
- **Tier-1 disciplines:** (1) verification/confidence tags — any number/funding/benchmark needs a primary link
  or auto-downgrades to `[Rumor]`; (2) dedup + delta vs the trailing 7 days; (3) dual score (importance + edge)
  and **never cull** — the value is in the outliers; (4) structured JSON sidecar = the Tier-1↔Tier-2 contract;
  (5) stay raw — Tier-2 supplies the opinion.
- **Tier-2** applies Jin's bar (meaning gate × whole-self edge × on-ramp + ceiling). See vault memory
  `jin-venture-bar`, `ideation-objective-function`.
- **Tier-3** is on-demand `/brainstorm` (Builder↔Critic↔Monica) / `/decide` — never daily.
- **Phase 2 (2026-06-03):** real-Mandarin TTS (misaki, not espeak cmn), Opus translation + full-coverage
  narration, one-page-per-day, AES-GCM gate, encrypted confidential audio — all detailed in the sections above.
