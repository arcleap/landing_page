#!/usr/bin/env python3
"""
enrich_signals.py — Tier 1b of the Signals pipeline.

Turns the raw scraped JSONL (Tier 1a / ai_news_collector.py) into a verified,
dual-scored, outlier-preserving JSON sidecar that Tier 2 (claude -p Opus) consumes
and the publisher renders as "Raw Materials".

Design principles (from the Idea Machine filtering mindset):
  * NEVER CULL. Every unique raw item appears in the sidecar. The true value lives
    in the outliers — low-reach but novel/non-consensus items are TAGGED, never dropped.
  * Dual score: importance (consensus/reach) AND edge (novelty/non-consensus). They
    are independent — a low-importance, high-edge item is exactly what we must keep.
  * Verification is rule-based (cheap, deterministic). Scoring uses Gemini 3.5 Flash
    (light, batched) with a deterministic heuristic fallback so the pipeline never breaks.

Output: <repo>/signals/data/enriched/YYYY-MM-DD.json
"""

import os, sys, json, re, argparse, hashlib, urllib.request
from datetime import date, datetime, timezone, timedelta
from concurrent.futures import ThreadPoolExecutor

_SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))   # <repo>/signals/scripts
_SIGNALS_DIR = os.path.dirname(_SCRIPT_DIR)                 # <repo>/signals
RAW_DIR = os.path.join(_SIGNALS_DIR, "data", "raw")
OUT_DIR = os.path.join(_SIGNALS_DIR, "data", "enriched")
os.makedirs(OUT_DIR, exist_ok=True)

FLASH_MODELS = ["gemini-3.5-flash", "gemini-2.5-flash"]   # primary + fallback
BATCH_SIZE = 60

# ── Verification (rule-based, no LLM) ──────────────────────────────────────────
PRIMARY_HINTS = (
    "arxiv.org", "github.com", "sec.gov", ".gov", "openai.com", "anthropic.com",
    "deepmind.google", "blog.google", "ai.google", "research.google", "huggingface.co",
    "nvidia.com", "microsoft.com", "apple.com", "meta.com", "ai.meta.com", "mistral.ai",
    "abs.xyz", "abc.xyz", "press.", "blog.", "investor.", "papers.", "researchgate",
)
SECONDARY_HINTS = (
    "techcrunch.com", "theverge.com", "wired.com", "arstechnica.com", "reuters.com",
    "bloomberg.com", "wsj.com", "ft.com", "nytimes.com", "theinformation.com",
    "venturebeat.com", "economist.com", "cnbc.com", "theregister.com", "404media.co",
    "politico.com", "npr.org", "fortune.com", "businessinsider.com",
)
NUMERIC_CLAIM_RE = re.compile(
    r"(\$\s?\d|\b\d[\d,.]*\s?(b|bn|m|k|million|billion|trillion)\b|\b\d+\s?%|"
    r"\bIPO\b|\bacqui|\braise[ds]?\b|\bfunding\b|\bvaluation\b|\bbenchmark|\btok/s\b|\bSOTA\b)",
    re.IGNORECASE,
)


def domain_of(url):
    m = re.match(r"https?://([^/]+)/?", url or "")
    return (m.group(1).lower() if m else "").lstrip("www.")


def classify_confidence(source, url, title):
    """[Confirmed] primary source · [Reported] credible secondary · [Rumor] social/unconfirmed."""
    src = (source or "").lower()
    dom = domain_of(url)
    social = src.startswith("reddit/") or src.startswith("x.com") or "reddit.com" in dom or "x.com" in dom or "twitter.com" in dom
    is_primary = any(h in dom for h in PRIMARY_HINTS) and not social
    is_secondary = any(h in dom for h in SECONDARY_HINTS)

    if is_primary:
        conf = "Confirmed"
    elif is_secondary:
        conf = "Reported"
    elif social:
        conf = "Rumor"
    else:
        conf = "Reported"  # surfaced on an aggregator; unknown domain

    # Spec rule: any number/funding/benchmark/IPO/acquisition claim needs a primary
    # link, else auto-downgrade to Rumor.
    if conf != "Confirmed" and NUMERIC_CLAIM_RE.search(title or ""):
        conf = "Rumor"
    return conf


# ── Dedup + delta (rule-based) ─────────────────────────────────────────────────
def norm_title(t):
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", "", (t or "").lower())).strip()


def fingerprint(t):
    return hashlib.md5(norm_title(t).encode("utf-8")).hexdigest()[:16]


def load_prior_fingerprints(today_iso, days=7):
    seen = set()
    base = date.fromisoformat(today_iso)
    for i in range(1, days + 1):
        d = (base - timedelta(days=i)).isoformat()
        fp = os.path.join(RAW_DIR, f"{d}.jsonl")
        if os.path.exists(fp):
            with open(fp) as f:
                for line in f:
                    try:
                        seen.add(fingerprint(json.loads(line).get("title", "")))
                    except Exception:
                        pass
    return seen


# ── Flash dual-scoring (batched, with heuristic fallback) ──────────────────────
def load_google_key():
    for p in (os.path.expanduser("~/.hermes/.env"),):
        if os.path.exists(p):
            with open(p) as f:
                for line in f:
                    s = line.strip()
                    if s.startswith("GOOGLE_API_KEY="):
                        return s.split("=", 1)[1].strip().strip('"').strip("'")
    return os.environ.get("GOOGLE_API_KEY")


def flash_score_batch(api_key, batch):
    """Return list of {importance, edge, outlier, summary} aligned to batch, or None on failure."""
    lines = [
        f'{i}. [{it["source"]}] {it["title"][:240]} (engagement={it.get("score",0)})'
        for i, it in enumerate(batch)
    ]
    prompt = (
        "You are a signal triage analyst for a startup founder. Score EACH item on two "
        "independent 1-5 axes. Return ONLY a compact JSON array, no prose.\n\n"
        "IMPORTANCE (1-5): reach, second-order impact, builder-actionability.\n"
        "EDGE (1-5): novelty, non-consensus angle, practitioner-pain, named-individual insight, "
        "weird-but-specific. HIGH edge often has LOW engagement — that is the point.\n"
        "OUTLIER (bool): true if this is a non-consensus / early / easily-overlooked signal whose "
        "value would be lost if filtered by popularity. When unsure, prefer true — never hide outliers.\n\n"
        "Score ALL items. Do not omit any index. Output exactly:\n"
        '[{"i":0,"importance":3,"edge":4,"outlier":true}, ...]\n\n'
        "ITEMS:\n" + "\n".join(lines)
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.1, "response_mime_type": "application/json"},
    }
    for model in FLASH_MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        try:
            req = urllib.request.Request(
                url, data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}, method="POST",
            )
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            txt = data["candidates"][0]["content"]["parts"][0]["text"].strip()
            txt = re.sub(r"^```(json)?|```$", "", txt.strip()).strip()
            arr = json.loads(txt)
            out = [None] * len(batch)
            for o in arr:
                idx = o.get("i")
                if isinstance(idx, int) and 0 <= idx < len(batch):
                    out[idx] = {
                        "importance": clamp(o.get("importance", 3)),
                        "edge": clamp(o.get("edge", 2)),
                        "outlier": bool(o.get("outlier", False)),
                    }
            return out
        except Exception as e:
            print(f"  [enrich] Flash model {model} failed: {e}", file=sys.stderr)
            continue
    return None


def clamp(v):
    try:
        return max(1, min(5, int(round(float(v)))))
    except Exception:
        return 3


NOVELTY_KW = ("sabotage", "regress", "contrarian", "non-consensus", "unexpected", "leak",
              "banned", "lawsuit", "demand letter", "open source", "foss", "local", "qwen",
              "arc", "world model", "spatial", "immigrant", "diaspora", "agent", "moe")


def heuristic_score(it):
    """Deterministic fallback so the pipeline never breaks if Flash is unavailable."""
    eng = int(it.get("score", 0) or 0)
    src = (it.get("source") or "").lower()
    # importance from engagement (source-relative)
    if src.startswith("hackernews"):
        importance = 5 if eng >= 400 else 4 if eng >= 200 else 3 if eng >= 80 else 2
    elif src.startswith("x.com"):
        importance = 4 if eng >= 500 else 3 if eng >= 100 else 2
    else:
        importance = 2
    title = (it.get("title") or "").lower()
    novelty = sum(1 for k in NOVELTY_KW if k in title)
    edge = min(5, 2 + novelty + (1 if eng < 50 and novelty else 0))
    outlier = edge >= 4 and importance <= 3
    return {"importance": importance, "edge": edge, "outlier": outlier}


# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--label", default=None, help="Morning / Afternoon (cosmetic)")
    ap.add_argument("--date", default=None, help="YYYY-MM-DD (default today)")
    args = ap.parse_args()

    today = args.date or date.today().isoformat()
    label = args.label or ("Afternoon" if datetime.now().hour >= 15 else "Morning")
    raw_file = os.path.join(RAW_DIR, f"{today}.jsonl")
    if not os.path.exists(raw_file):
        print(f"[enrich] no raw file for {today}", file=sys.stderr)
        sys.exit(0)

    # Load + dedup within the day (keep the highest-engagement instance of each title)
    by_fp = {}
    with open(raw_file) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                it = json.loads(line)
            except Exception:
                continue
            fp = fingerprint(it.get("title", ""))
            if not fp:
                continue
            prev = by_fp.get(fp)
            if prev is None or int(it.get("score", 0) or 0) > int(prev.get("score", 0) or 0):
                by_fp[fp] = it

    items = list(by_fp.items())
    prior = load_prior_fingerprints(today)

    api_key = load_google_key()
    raw_list = [it for _, it in items]

    # Score: Flash batched IN PARALLEL (output kept tiny — no summaries — for speed);
    # heuristic fallback per batch so the pipeline never stalls or culls.
    scores = [None] * len(raw_list)
    if api_key:
        batches = [(s, raw_list[s:s + BATCH_SIZE]) for s in range(0, len(raw_list), BATCH_SIZE)]

        def work(job):
            start, batch = job
            return start, flash_score_batch(api_key, batch), batch

        with ThreadPoolExecutor(max_workers=8) as ex:
            for start, res, batch in ex.map(work, batches):
                for j, r in enumerate(res or [None] * len(batch)):
                    scores[start + j] = r if r else heuristic_score(batch[j])
    else:
        print("  [enrich] no GOOGLE_API_KEY — using heuristic scoring", file=sys.stderr)
        scores = [heuristic_score(it) for it in raw_list]

    enriched = []
    for (fp, it), sc in zip(items, scores):
        sc = sc or heuristic_score(it)
        title = it.get("title", "")
        enriched.append({
            "id": fp,
            "title": title,
            "url": it.get("url", ""),
            "source": it.get("source", ""),
            "group": it.get("group", "Other"),
            "engagement": {"score": int(it.get("score", 0) or 0), "comments": int(it.get("comments", 0) or 0)},
            "ts": it.get("ts", ""),
            "confidence": classify_confidence(it.get("source"), it.get("url"), title),
            "delta": "ONGOING" if fp in prior else "NEW",
            "importance": sc["importance"],
            "edge": sc["edge"],
            "outlier": bool(sc["outlier"]),
            "summary": "",
        })

    # Sort: outliers first within each importance band so they never get visually buried,
    # then by combined signal. (Order is a view concern; nothing is dropped.)
    enriched.sort(key=lambda x: (x["outlier"], x["importance"] + x["edge"], x["edge"]), reverse=True)

    counts = {
        "total": len(enriched),
        "outliers": sum(1 for e in enriched if e["outlier"]),
        "new": sum(1 for e in enriched if e["delta"] == "NEW"),
        "ongoing": sum(1 for e in enriched if e["delta"] == "ONGOING"),
        "by_confidence": {
            c: sum(1 for e in enriched if e["confidence"] == c) for c in ("Confirmed", "Reported", "Rumor")
        },
    }
    sidecar = {
        "date": today,
        "label": label,
        "generated_ts": it.get("ts", "") and datetime.now(timezone.utc).isoformat(),
        "counts": counts,
        "items": enriched,
    }
    out_path = os.path.join(OUT_DIR, f"{today}.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(sidecar, f, ensure_ascii=False, indent=2)
    print(f"[enrich] {out_path}: {counts['total']} items "
          f"({counts['outliers']} outliers, {counts['new']} new) | "
          f"conf {counts['by_confidence']}")


if __name__ == "__main__":
    main()
