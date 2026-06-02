#!/usr/bin/env python3
"""
run_briefing_free.py
Runs a cost-free co-founder briefing using the local Claude Code CLI subscription (claude -p).
Isolates the environment to avoid accidental per-token API billing.
Prints the final report to stdout for Hermes cron delivery and archiving.
"""

import subprocess
import os
import sys
import tempfile
import argparse
from datetime import datetime

# Path setups
_SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))   # <repo>/signals/scripts
_SIGNALS_DIR = os.path.dirname(_SCRIPT_DIR)                 # <repo>/signals
_REPO_DIR = os.path.dirname(_SIGNALS_DIR)                   # <repo>

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--since", default=None, help="Only include items collected after HH:MM UTC")
    parser.add_argument("--label", default=None, help="Briefing label: Morning or Afternoon")
    args = parser.parse_args()

    # Determine automatic label if not passed
    now_hour = datetime.now().hour
    label = args.label
    if not label:
        label = "Afternoon" if now_hour >= 15 else "Morning"

    # Step 1: Run the raw feed digest generator (ai_news_synthesize.py)
    cmd = [sys.executable, os.path.join(_SCRIPT_DIR, "ai_news_synthesize.py")]
    if args.since:
        cmd += ["--since", args.since]
    if args.label:
        cmd += ["--label", args.label]
        
    try:
        synth_result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        raw_digest = synth_result.stdout
    except Exception as e:
        print(f"Error running ai_news_synthesize.py: {e}", file=sys.stderr)
        sys.exit(1)

    if "[NO DATA]" in raw_digest or "[EMPTY]" in raw_digest:
        # No data to process, print SILENT so the cron job suppresses sending empty messages
        print("[SILENT]")
        sys.exit(0)

    # Step 2: Write raw digest to a temp file inside the repo workspace so Claude Code can access it
    os.makedirs(os.path.join(_SIGNALS_DIR, "data"), exist_ok=True)
    fd, temp_path = tempfile.mkstemp(suffix=".txt", prefix="briefing_digest_", dir=os.path.join(_SIGNALS_DIR, "data"))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as tmp_f:
            tmp_f.write(raw_digest)

        # Step 3: Build a rigorous prompt matching the original co-founder briefing expectations
        prompt = f"""Read the raw scraped tech feed digest in the file at {temp_path}.
Write a highly sophisticated, twice-daily AI market telemetry and strategic startup signals briefing titled "Leo's {label} Briefing — {datetime.today().strftime('%B %d, %Y')}".

You are writing under your co-founder persona, Lead Intelligence Analyst "Leo" at ArcLeap Research Lab. The briefing must follow this structure:

### Structure Requirements:

## Response

📊 **Source Statistics**
- Include bullet points detailing total unique items, items by source (HackerNews, Reddit subs, X.com categories). Mention if all sources were successfully reached. (Extract these from the feed statistics at the top of the raw file).

---

🌅 **Leo's {label} Briefing — {datetime.today().strftime('%B %d, %Y')}**

🔥 **Deep-Dive: Contrarian & Non-Consensus Signals**
For the top 3-4 most critical, non-consensus stories from the feed, write an extensive deep dive.
- Format: Use bullet points where the header is the bolded title of the story (e.g. "- **The FOSS Cold War: Active Sabotage of AI Agents...**").
- Content: Do NOT just summarize. Provide a deep contrarian synthesis: what are the underlying structural battles? What is the non-consensus tech opportunity or hidden threat for a startup co-founder? Why does this matter?
- Links: Crucially, include clickable hyperlinks using exact URL sources from the feed (e.g., "[HackerNews Comments](https://...)" or "[Source Post](url)"). Every story must have clickable source links.

---

### Topic Bucket Breakdowns
Synthesize other items in the feed into clean thematic buckets like:
- **Core AI Research & Local Inference**
- **Products, Tools & Frontier Models**
- **Hardware, Compute & Infrastructure**
For each bucket, write a concise analytical bullet point synthesizing the general market direction and notable items with clickable source links.

---

## 🕵️‍♂️ Co-founder Confidential
Provide an exclusive section containing highly tactical, private insights.
- Content: Highlight the absolute most critical strategic decision, product idea, or technical arbitrage opportunity that ArcLeap should pursue immediately based on today's telemetry. This section must feel like a private co-founder DM.

Avoid conversational greetings, meta-commentary, or generic summaries. Output raw markdown following the exact structure above, starting with "## Response". Keep the tone highly technical, sharp, and business-focused.
"""

        # Step 4: Isolate environment from Anthropic keys to guarantee subscription billing
        safe_env = os.environ.copy()
        for key in ["ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN", "ANTHROPIC_API_URL", "CLAUDE_API_KEY"]:
            safe_env.pop(key, None)

        # Step 5: Execute claude -p non-interactively
        result = subprocess.run(
            ["claude", "-p", prompt],
            capture_output=True,
            text=True,
            env=safe_env,
            check=True
        )

        final_output = result.stdout.strip()
        
        # Output to stdout (to be captured by Hermes and delivered)
        print(final_output)

    except Exception as e:
        print(f"Error executing briefing generation via claude -p: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass

if __name__ == "__main__":
    main()
