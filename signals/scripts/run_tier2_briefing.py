#!/usr/bin/env python3
"""
run_tier2_briefing.py — Tier 2 of the Signals pipeline (the filter/compile layer).

Consumes the Tier-1b enriched JSON sidecar and produces Jin's Founder Reading Notes
via `claude -p` on the Opus subscription (flat-rate, env-isolated). Output =
  - public **Daily Highlights** (Top-5, Coverage-Map hits, Contrarian watch, Verification flags)
  - passcode-gated **## Co-founder Confidential** (Opportunity convergence + the one move)

It applies the LIGHT Idea-Machine filter (detect, don't generate), runs convergence
candidates through Jin's bar, and appends survivors to the candidate ledger for
on-demand Tier-3 escalation (/brainstorm). Prints clean markdown to stdout for the
Hermes no-agent cron to deliver + the publisher to ingest.

Billing: strips Anthropic API keys from the child env so claude -p always draws the
subscription, never per-token. Honors CLAUDE_CODE_OAUTH_TOKEN if present.
"""

import os, sys, json, re, subprocess, argparse
from datetime import date, datetime

_SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
_SIGNALS_DIR = os.path.dirname(_SCRIPT_DIR)
_REPO_DIR = os.path.dirname(_SIGNALS_DIR)
ENRICHED_DIR = os.path.join(_SIGNALS_DIR, "data", "enriched")

VAULT = os.path.expanduser("~/my-vault")
NOTES_DIR = os.path.join(VAULT, "Research", "founder-reading-notes")
LEDGER = os.path.join(NOTES_DIR, "candidate-ledger.md")

CLAUDE_MODEL = "opus"          # Opus 4.8 per spec (Tier 2/3 heavy reasoning)
MAX_DIGEST_ITEMS = 160         # outliers (capped) + top-signal fill; full set stays in the sidecar
OUTLIER_CAP = 90               # max outliers fed to Opus (the sidecar always preserves all of them)

COVERAGE = """Tracked directions (Coverage Map) — flag VALIDATORS and THREATS against these:
- #22 Animated Life (diaspora legacy films) — LIVE bet, meaning-pass, whole-self (T+H)
- #18 VPA/digital twins · C Cognitive Sovereignty (personal AI infra) · #9 AI-era anxiety/human value · #11 Arm the Super Individuals — the human-AI frontier (T+H) = Jin's real fit
- #17 Agent-Native Computing/ATCP · #19 Confidential AI + RL Verification · #15 Agents-World infra · B Financial infra for AI-as-asset — infra plays: high ceiling but meaning-thin / technical-only"""

PROMPT = r"""You are "Leo", Lead Intelligence Analyst and co-founder voice at ArcLeap Research Lab, writing Jin's twice-daily Founder Reading Notes for {DATE} ({LABEL}).

You are given a PRE-SCORED, PRE-VERIFIED signal set (Tier 1). Each line is tagged:
(confidence/delta/imp{N}/edge{N}[OUTLIER]) title [source] url — summary
- confidence: Confirmed (primary source) | Reported (credible secondary) | Rumor (social/unconfirmed)
- delta: NEW (unseen in prior 7d) | ONGOING (carrying over — do NOT re-hype as fresh news)
- importance 1-5 (reach/impact) · edge 1-5 (novelty/non-consensus) · [OUTLIER] = protected non-consensus signal

YOUR JOB IS TO FILTER AND SURFACE for THIS founder — not to generate generic ideas.

{COVERAGE}

Jin's bar (apply as the filter): MEANING is a hard gate; favor the on-ramp×ceiling diagonal; weight the WHOLE-SELF edge (technical + people-reading/empathy = "T+H"). The human-AI frontier (#22,#18,C,#9,#11) is his real fit; infra plays are meaning-thin — don't over-elevate them just because they're technically impressive.

Output EXACTLY this markdown, starting with "## Response":

## Response

🌅 **Leo's {LABEL} Reading Notes — {DATE}**

### 1. Top 5 — what actually matters today
Ranked by importance × relevance-to-Jin. Each = **one line what** + *one line so-what-for-me*, with a clickable [source](url). Prefer Confirmed/Reported; if a pick rests on a Rumor, flag it.

### 2. Coverage-Map hits
Map today's signals onto the tracked directions. State **VALIDATORS** (support a direction) AND **THREATS** (competitor/substrate risk) explicitly, each with [source](url). If none, write "none today."

### 3. Contrarian watch
Consensus-vs-edge divergences worth tracking before they're priced in. Draw primarily from [OUTLIER] / high-edge items — these are the protected non-consensus signals; do NOT let them get buried under the consensus stories.

### 4. Verification flags
Big claims still [Rumor] (funding amounts, benchmarks, IPOs, acquisitions): list as "⚠️ do not act on yet — needs primary source", with [source].

## 🕵️‍♂️ Co-founder Confidential

### Opportunity convergence (candidates — UNVALIDATED)
ONLY surface a wedge where >=2 INDEPENDENT sources converge on the SAME pain (pattern extraction). Run each survivor through Jin's bar: meaning gate, whole-self T+H edge, on-ramp, ceiling. DROP one-step-obvious ideas an LLM would propose unprompted (Gate 13). For each survivor give: the pain, the >=2 [sources](url), the bar read, and why it's non-consensus. Mark every one "candidate — needs Tier-3 /brainstorm + customer interviews." If nothing clears the bar, say so plainly — do NOT manufacture opportunities.

### The one move
The single highest-conviction strategic action for ArcLeap from today's telemetry. Sharp, private, co-founder-DM tone.

Then append this machine block (it is stripped before publishing — for the candidate ledger):
<<<CANDIDATES
[{"title":"short name","pain":"the converging pain","sources":["url1","url2"],"bar":"meaning/edge/on-ramp/ceiling one-liner","coverage_ref":"#NN or new"}]
CANDIDATES>>>
If no candidate cleared the bar, output exactly: <<<CANDIDATES
[]
CANDIDATES>>>

Rules: keep clickable [anchor](url) links from the feed. High-density, Jin reads fast. No greetings, no meta-commentary. Output raw markdown only, starting with "## Response".

=== SIGNAL SET ===
{DIGEST}
"""


def ensure_sidecar(today, label):
    path = os.path.join(ENRICHED_DIR, f"{today}.json")
    if not os.path.exists(path):
        print(f"[tier2] enriched sidecar missing — running enrich_signals.py", file=sys.stderr)
        subprocess.run([sys.executable, os.path.join(_SCRIPT_DIR, "enrich_signals.py"), "--label", label],
                       check=False)
    return path


def build_digest(sidecar):
    items = sidecar.get("items", [])
    sig = lambda x: x.get("importance", 0) + x.get("edge", 0)
    outliers = sorted([e for e in items if e.get("outlier")], key=sig, reverse=True)[:OUTLIER_CAP]
    rest = sorted([e for e in items if not e.get("outlier")], key=sig, reverse=True)
    chosen = outliers + rest[:max(0, MAX_DIGEST_ITEMS - len(outliers))]
    lines = []
    for e in chosen:
        tag = "[OUTLIER]" if e.get("outlier") else ""
        lines.append(
            f'({e.get("confidence","?")}/{e.get("delta","?")}/imp{e.get("importance","?")}/edge{e.get("edge","?")}{tag}) '
            f'{e.get("title","")} [{e.get("source","")}] {e.get("url","")} — {e.get("summary","")}'
        )
    return "\n".join(lines), len(chosen), len(outliers)


def extract_candidates(text):
    """Return (clean_text, candidates_list)."""
    m = re.search(r"<<<CANDIDATES\s*(.*?)\s*CANDIDATES>>>", text, re.DOTALL)
    cands = []
    if m:
        try:
            cands = json.loads(m.group(1).strip())
        except Exception:
            cands = []
        text = (text[:m.start()] + text[m.end():]).strip()
    return text, cands


def append_ledger(cands, today, label):
    if not cands:
        return
    try:
        os.makedirs(NOTES_DIR, exist_ok=True)
        existing = ""
        if os.path.exists(LEDGER):
            with open(LEDGER, encoding="utf-8") as f:
                existing = f.read()
        else:
            existing = ("# Candidate Ledger\n\n*Auto-appended by Tier-2 Reading Notes. Convergence "
                        "candidates awaiting on-demand Tier-3 deep eval (`/brainstorm` Builder↔Critic↔Monica, "
                        "`/decide`). Unvalidated — needs customer interviews.*\n\n"
                        "| Date | Candidate | Converging pain | Sources | Bar read | Coverage |\n"
                        "|---|---|---|---|---|---|\n")
        rows = []
        for c in cands:
            name = str(c.get("title", "")).strip()
            if not name or name.lower() in existing.lower():
                continue  # dedupe by name
            srcs = " ".join(f"[{i+1}]({u})" for i, u in enumerate(c.get("sources", [])[:3]))
            row = (f'| {today} {label} | {name} | {str(c.get("pain","")).replace("|","/")[:140]} '
                   f'| {srcs} | {str(c.get("bar","")).replace("|","/")[:120]} | {c.get("coverage_ref","")} |')
            rows.append(row)
        if rows:
            with open(LEDGER, "w", encoding="utf-8") as f:
                f.write(existing.rstrip() + "\n" + "\n".join(rows) + "\n")
            print(f"[tier2] appended {len(rows)} candidate(s) to ledger", file=sys.stderr)
    except Exception as e:
        print(f"[tier2] ledger append failed (non-fatal): {e}", file=sys.stderr)


def archive_notes(text, today, label):
    try:
        os.makedirs(NOTES_DIR, exist_ok=True)
        body = re.sub(r"^## Response\s*", "", text).strip()
        with open(os.path.join(NOTES_DIR, f"{today}-{label.lower()}.md"), "w", encoding="utf-8") as f:
            f.write(f"# Founder Reading Notes — {today} ({label})\n\n{body}\n")
    except Exception as e:
        print(f"[tier2] notes archive failed (non-fatal): {e}", file=sys.stderr)


def run_claude(prompt, timeout=600):
    """Run claude -p on the Opus subscription with Anthropic API keys stripped (subscription billing)."""
    safe_env = os.environ.copy()
    for k in ("ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN", "ANTHROPIC_BASE_URL", "CLAUDE_API_KEY"):
        safe_env.pop(k, None)   # keeps CLAUDE_CODE_OAUTH_TOKEN if present
    result = subprocess.run(
        ["claude", "-p", prompt, "--model", CLAUDE_MODEL],
        capture_output=True, text=True, env=safe_env, check=True, timeout=timeout, cwd=_REPO_DIR,
    )
    return result.stdout.strip()


MONICA_PROMPT = r"""You are "Monica", ArcLeap's adversarial red-team analyst. You are deliberately skeptical: your job is to KILL weak ideas, not encourage them. The builder's optimism runs too soft — you are the hard filter, and any "Jin's edge" claim is inflated until proven.

Red-team EACH convergence candidate below (surfaced by today's Tier-2 filter). Be specific and name names. For each:

1. **Weakest kill-gate** — which Idea Machine gate most threatens it? (real + frequent pain & WTP $20+/mo; wrapper test — can ChatGPT/Gemini already do it; moat >=2 sub-types; market ceiling $300M+/$1B+; 1+ steps ahead; Gate 13 OOD / one-step-obvious.)
2. **Incumbent / big-tech scan** — who already ships this? Has Anthropic/OpenAI/Google/Microsoft/Meta/AWS launched a product or protocol on this substrate in the last ~12 weeks? If so the moat must move up-stack.
3. **Graveyard** — what funded startups tried this and died or pivoted, and what does that prove?
4. **Edge-inflation audit** — how many other founders could execute this as well or better than Jin? Name better-positioned profiles/people if any. Treat any 4.5+/5 edge claim as 3/5 until audited.
5. **Verdict** — exactly one: 🔴 KILL · 🟡 NEEDS-EVIDENCE (state the single customer-interview question that decides it) · 🟢 PROCEED-NARROWLY (the one non-consensus wedge that survives).

If a candidate is one-step-obvious, KILL it. Default to skepticism. Output concise markdown starting EXACTLY with "### 🔴 Monica Red-Team — adversarial check". No preamble, no meta-commentary.

CANDIDATES (JSON):
{CANDS}
"""


def monica_redteam(cands):
    """Independent adversarial second pass over the convergence candidates (additive, non-fatal)."""
    if not cands:
        return ""
    try:
        prompt = MONICA_PROMPT.replace("{CANDS}", json.dumps(cands, ensure_ascii=False, indent=2))
        report = run_claude(prompt, timeout=400)
        if report and "Monica" in report:
            return report
        print("[tier2] Monica returned no usable report", file=sys.stderr)
    except Exception as e:
        print(f"[tier2] Monica red-team failed (non-fatal): {e}", file=sys.stderr)
    return ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--label", default=None)
    ap.add_argument("--date", default=None)
    args = ap.parse_args()

    today = args.date or date.today().isoformat()
    label = args.label or ("Afternoon" if datetime.now().hour >= 15 else "Morning")

    path = ensure_sidecar(today, label)
    if not os.path.exists(path):
        print("[SILENT]")  # no data → suppress delivery
        return
    with open(path, encoding="utf-8") as f:
        sidecar = json.load(f)
    if not sidecar.get("items"):
        print("[SILENT]")
        return

    digest, n, n_out = build_digest(sidecar)
    print(f"[tier2] feeding Opus {n} items ({n_out} outliers) of {sidecar['counts']['total']} total", file=sys.stderr)

    prompt = (PROMPT
              .replace("{DATE}", today).replace("{LABEL}", label)
              .replace("{COVERAGE}", COVERAGE).replace("{DIGEST}", digest))

    try:
        out = run_claude(prompt, timeout=600)
    except Exception as e:
        print(f"[tier2] claude -p failed: {e}", file=sys.stderr)
        sys.exit(1)
    if not out or "## Response" not in out:
        print(f"[tier2] unexpected claude output (no ## Response); raw head: {out[:300]}", file=sys.stderr)
        sys.exit(1)

    clean, cands = extract_candidates(out)

    # Additive: independent Monica red-team of the candidates, appended INSIDE the
    # passcode-gated Co-founder Confidential section (it follows that header in `clean`).
    monica = monica_redteam(cands)
    if monica:
        clean = clean.rstrip() + "\n\n---\n\n" + monica.strip()

    append_ledger(cands, today, label)
    archive_notes(clean, today, label)
    print(clean)   # delivered by Hermes + ingested by the publisher


if __name__ == "__main__":
    main()
