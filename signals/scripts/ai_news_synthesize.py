#!/usr/bin/env python3
"""
ai_news_synthesize.py
Stage 2: Read today's accumulated JSONL and print for Leo to synthesize.
Accepts optional --since HH:MM argument to filter to items collected after that time.
Morning briefing (8am): reads full day file.
Afternoon briefing (3:45pm): reads only items since ~3pm.
"""

import json, os, sys, argparse
from datetime import date, datetime, timezone
from collections import defaultdict

_SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))   # <repo>/signals/scripts
_SIGNALS_DIR = os.path.dirname(_SCRIPT_DIR)                 # <repo>/signals
DATA_DIR = os.path.join(_SIGNALS_DIR, "data", "raw")
TODAY = date.today().isoformat()
DATA_FILE = os.path.join(DATA_DIR, f"{TODAY}.jsonl")

# Auto-detect morning/afternoon based on local time if run without manual args
now_hour = datetime.now().hour
default_label = "Morning"
default_since = None
if now_hour >= 15: # 3:00 PM PT or later
    default_label = "Afternoon"
    default_since = "22:00" # 22:00 UTC is 15:00 PDT

parser = argparse.ArgumentParser()
parser.add_argument("--since", default=default_since, help="Only include items collected after HH:MM UTC")
parser.add_argument("--label", default=default_label, help="Briefing label: Morning or Afternoon")
args = parser.parse_args()

if not os.path.exists(DATA_FILE):
    print(f"[NO DATA] No news file for {TODAY}.")
    sys.exit(0)

items = []
with open(DATA_FILE) as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        try:
            items.append(json.loads(line))
        except:
            pass

# Filter by --since if provided
if args.since:
    cutoff_str = f"{TODAY}T{args.since}:00+00:00"
    items = [i for i in items if i.get("ts","") >= cutoff_str]

if not items:
    print(f"[EMPTY] No items found for {TODAY}" + (f" since {args.since}" if args.since else "") + ".")
    sys.exit(0)

by_group = defaultdict(list)
for item in items:
    by_group[item.get("group","Other")].append(item)

hn_items = sorted(by_group.get("HackerNews",[]), key=lambda x: x.get("score",0), reverse=True)

print(f"=== AI NEWS {args.label.upper()} DIGEST | {TODAY} | {len(items)} items ===\n")

if hn_items:
    print(f"## HACKERNEWS ({len(hn_items)} items)\n")
    for item in hn_items:
        print(f"  [{item.get('score',0)}pts, {item.get('comments',0)}c] {item['title']}")
        print(f"    {item['url']}")
    print()

reddit_groups = {k:v for k,v in by_group.items() if not k.startswith(("HackerNews","X —"))}
x_groups = {k:v for k,v in by_group.items() if k.startswith("X —")}

if reddit_groups:
    print("## REDDIT\n")
    for group, group_items in sorted(reddit_groups.items()):
        by_sub = defaultdict(list)
        for item in group_items:
            by_sub[item.get("source","?")].append(item)
        print(f"### {group}")
        for sub, sub_items in sorted(by_sub.items()):
            print(f"\n  {sub} ({len(sub_items)}):")
            for item in sub_items:
                print(f"    - {item['title']}")
        print()

if x_groups:
    print("## X.COM\n")
    for group, group_items in sorted(x_groups.items()):
        label = group.replace("X — ","")
        top = sorted(group_items, key=lambda x: x.get("score",0), reverse=True)
        print(f"### {label} ({len(top)} tweets)")
        for item in top[:10]:
            handle = item.get("source","").replace("x.com/@","")
            print(f"  @{handle} [{item.get('score',0)}❤]: {item['title'][:100]}")
        print()

print(f"=== END {args.label.upper()} DIGEST ===")

