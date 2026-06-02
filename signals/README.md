# Signals Hub — AI News Pipeline (3-tier)

Self-contained, founder-tuned AI/markets intelligence for the ArcLeap **Signals Hub**
(`/signals` on the landing page). Runs twice daily via Hermes cron. Three tiers, split by cost:

- **Tier 1 — collect + enrich (cheap):** scrape → verify-tag → dual-score (importance + edge) → JSON sidecar. **Outliers are preserved & flagged, never culled** — the true value lives there.
- **Tier 2 — compile (Opus, subscription):** filter the sidecar into Jin's Founder Reading Notes (public Highlights + passcode Co-founder Insights) and queue convergence candidates.
- **Tier 3 — deep eval (on-demand, NOT daily):** escalate a candidate to `/brainstorm` (Builder↔Critic↔Monica) / `/decide`. See `~/my-vault/Research/founder-reading-notes/`.

## Layout
```
signals/
├── scripts/                    # canonical, version-controlled pipeline code
│   ├── ai_news_collector.py      # T1a: scrape HN + Reddit + X (xurl) → raw JSONL
│   ├── enrich_signals.py         # T1b: verify-tag + dedup/delta + dual-score (Gemini Flash, parallel) → enriched JSON; NEVER culls, flags [OUTLIER]
│   ├── run_tier2_briefing.py     # T2: enriched JSON → claude -p (Opus) Founder Reading Notes + candidate ledger
│   ├── ai_news_publish.py        # build 3-section static HTML → ../public/signals, git push → Vercel; translate via Gemini Flash
│   ├── ai_news_synthesize.py     # raw JSONL → plain digest (used as a fallback/util)
│   └── run_briefing_free.py      # superseded by run_tier2_briefing.py (kept for reference)
└── data/                       # GITIGNORED (regenerable)
    ├── raw/                      # YYYY-MM-DD.jsonl raw scrapes
    ├── enriched/                 # YYYY-MM-DD.json  ← the Tier-1↔Tier-2 contract + Raw Materials source
    ├── translated/               # <date>-<session>.zh.md(+.hash) cache
    └── briefings/                # morning/ + afternoon/ — archived briefings
```

## How it runs (Hermes cron + shims)
Hermes only runs cron scripts **physically under `~/.hermes/scripts/`** and **rejects symlinks that
resolve outside it**. So each entry there is a tiny **real shim** that `runpy`-delegates to the
canonical repo script (edit the repo; the shim picks it up, no redeploy). Scripts resolve repo paths
via `os.path.realpath(__file__)`.

| Job ID | Name | Schedule | Script |
|---|---|---|---|
| `a0da24f5737f` / `c3f148dc7a7f` | news-collect (AM/PM) | `0 7,15 * * *` | ai_news_collector.py |
| `f708e9d64322` / `e9b4bb7aede2` | briefing (AM/PM) | `45 7,15 * * *` | **run_tier2_briefing.py** (no-agent; runs enrich if needed, then Opus) |
| `ba3bda1de8ff` | website-publisher | `0 8,16 * * *` | ai_news_publish.py (no-agent) |

**Cron timeout:** Opus briefings exceed the default 120s no-agent cap → set `cron.script_timeout_seconds: 600`
in `~/.hermes/config.yaml` (live-reloaded; no gateway restart).

## Billing (important)
Tier-2/3 use `claude -p` billed to the **Claude subscription**, not per-token. The scripts strip
`ANTHROPIC_API_KEY` / `ANTHROPIC_AUTH_TOKEN` / `ANTHROPIC_BASE_URL` / `CLAUDE_API_KEY` from the child env
(fail-safe) and honor `CLAUDE_CODE_OAUTH_TOKEN`. **Do not `source ~/.hermes/.env` before a `claude -p` call** —
it would re-inject the Anthropic key and silently switch to per-token. Tier-1 enrichment + translation use
Gemini Flash (cheap, separate Google cost).

## Webpage (3 sections, top→bottom)
1. **Daily Highlights** — Tier-2 public notes (bilingual).
2. **Founder Insights** — Tier-2 Co-founder Confidential, **passcode-gated** (base64 + `localStorage.arcleap_cofounder_key`); decrypt **client-side only**.
3. **Raw Materials** — Tier-1 enriched set (collapsible): confidence badge + delta + i/e scores + ★ outliers.

## Dependencies
- `xurl` on PATH (collector), `GOOGLE_API_KEY` in `~/.hermes/.env` (Flash enrich + translate),
  `claude` CLI logged into the subscription (Tier-2/3), `git` remote `origin` → GitHub → Vercel.
- Dry-run the publisher without deploying: `SIGNALS_NO_PUSH=1 python3 signals/scripts/ai_news_publish.py`.
- Legacy: `~/.hermes/scripts/ai_news_scraper.py` (predecessor, unused).
