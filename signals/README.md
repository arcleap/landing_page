# Signals Hub — AI News Pipeline

Self-contained AI-news collector → synthesizer → bilingual static publisher for the
ArcLeap **Signals Hub** (`/signals` on the landing page). Runs twice daily via Hermes cron.

## Layout

```
signals/
├── scripts/                 # canonical, version-controlled pipeline code
│   ├── ai_news_collector.py   # Stage 1: scrape HN + Reddit + X(.com via xurl) → raw JSONL
│   ├── ai_news_synthesize.py  # Stage 2: read today's JSONL → digest on stdout (fed to the Hermes agent "Leo")
│   └── ai_news_publish.py     # Stage 3: translate (ZH), build static HTML → ../public/signals, git push → Vercel
└── data/                    # GITIGNORED (regenerable, daily-changing)
    ├── raw/                   # YYYY-MM-DD.jsonl raw scrapes
    ├── translated/            # <date>-<session>.zh.md + .hash translation cache
    └── briefings/             # morning/ + afternoon/ — archived copies of Hermes agent briefings
```

## How it runs (Hermes cron)

Hermes only executes cron scripts located **under `~/.hermes/scripts/`**, so the files
there are **symlinks** to the canonical copies in `signals/scripts/`. The scripts resolve
their own repo-relative paths via `os.path.realpath(__file__)`, so they work correctly when
invoked through the symlink. **Editing happens here in the repo; the symlinks pick it up
automatically — no cron edits needed** as long as filenames stay the same.

| Job ID | Name | Schedule | Script |
|---|---|---|---|
| `a0da24f5737f` | news-collect-morning | `0 7 * * *` | ai_news_collector.py |
| `c3f148dc7a7f` | news-collect-afternoon | `0 15 * * *` | ai_news_collector.py |
| `f708e9d64322` | briefing-morning | `45 7 * * *` | ai_news_synthesize.py (agent mode) |
| `e9b4bb7aede2` | briefing-afternoon | `45 15 * * *` | ai_news_synthesize.py --since 22:00 --label Afternoon |
| `ba3bda1de8ff` | news-website-publisher | `0 8,16 * * *` | ai_news_publish.py |

## Briefings are produced by Hermes, not the scripts

The synthesize jobs run in **agent mode**: their stdout is fed to the Hermes agent, whose
response Hermes writes to `~/.hermes/cron/output/<job_id>/<timestamp>.md`. The publisher
**ingests** those (`sync_briefings()`), copies them into `data/briefings/<session>/` for a
version-able history, and builds the site from the repo copy.

## Publishing & the dry-run flag

`ai_news_publish.py` builds static HTML into `../public/signals/` then `git add public/signals`,
commits, and `git push origin main` → triggers the Vercel deploy. To build **without** pushing
(local verification), set `SIGNALS_NO_PUSH=1`:

```bash
SIGNALS_NO_PUSH=1 python3 signals/scripts/ai_news_publish.py
```

## Co-founder Confidential gate

Each briefing's `## 🕵️‍♂️ Co-founder Confidential` section is split out, converted to HTML,
Base64-encoded into a hidden `<textarea>`, and decrypted **client-side only** (passcode stored
in `localStorage` under `arcleap_cofounder_key`). Keep that decryption client-side — running it
during SSR/static pre-render would throw `window is not defined` / hydration mismatches.

## Dependencies

- `xurl` (on PATH) for X.com fetch in the collector
- `GOOGLE_API_KEY` in `~/.hermes/.env` for Gemini translation in the publisher
- `git` remote `origin` → GitHub → Vercel

## Note

`~/.hermes/scripts/ai_news_scraper.py` is a **legacy** predecessor of the collector, used by no
cron job. Left in place, not part of this pipeline.
