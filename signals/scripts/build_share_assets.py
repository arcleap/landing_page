#!/usr/bin/env python3
"""Standalone share/distribution asset builder + backfiller.

Reuses the helpers in ai_news_publish.py but DELIBERATELY does NOT:
  - sync briefings from Hermes (no network),
  - regenerate translations / audio / Opus calls,
  - run build_site(),
  - git commit or push.

It is safe to run repeatedly (idempotent). It:
  1. reconstructs the per-day briefing index from signals/data/briefings,
  2. writes public/signals/rss.xml, public/sitemap.xml, public/robots.txt,
  3. renders the default + per-issue OG cards (headless chromium if available;
     graceful fallback to the committed default otherwise),
  4. injects the <head> share block into the already-published archive/*.html
     and index.html (so live files get cards without a full regen),
  5. writes legacy YYYY-MM-DD-{morning,afternoon}.html redirect stubs.

Usage:
    python3 build_share_assets.py
"""
import os

import ai_news_publish as P


def collect_briefings():
    """Same selection logic as build_site(), minus the network sync."""
    by_date = {}
    for session_type in dict.fromkeys(P.SESSIONS.values()):
        folder = os.path.join(P.BRIEFINGS_DIR, session_type)
        if not os.path.isdir(folder):
            continue
        for fn in sorted(os.listdir(folder)):
            if not fn.endswith(".md"):
                continue
            data = P.parse_briefing_file(os.path.join(folder, fn), session_type)
            if not data:
                continue
            d = data["date"]
            by_date.setdefault(d, {})
            existing = by_date[d].get(session_type)
            if not existing or data["run_time"] > existing["run_time"]:
                by_date[d][session_type] = data
    return by_date


def day_share_kwargs(d, day_briefings):
    """Compute (description, og_image_rel, published_time) for one day page."""
    desc = P.DEFAULT_SHARE_DESC
    top = ""
    pub_time = None
    for s in ("morning", "afternoon"):
        if s in day_briefings:
            pub_en, _ = P.split_cofounder_content(day_briefings[s]["content"])
            desc = P._meta_description(pub_en)
            top = P._top_headline(pub_en)
            pub_time = day_briefings[s].get("run_time")
            break

    og_rel = P.DEFAULT_OG_IMAGE
    from datetime import datetime
    short = datetime.strptime(d, "%Y-%m-%d").strftime("%b %d, %Y")
    sessions = [s for s in ("morning", "afternoon") if s in day_briefings]
    issue_png = os.path.join(P.PUBLIC_DIR, "og", "signals", f"{d}.png")
    if P.render_og_card(issue_png, f"ArcLeap Signals · {short}",
                        top or "Frontier-AI market intelligence",
                        " + ".join(s.capitalize() for s in sessions) + " briefing"):
        og_rel = f"/og/signals/{d}.png"
    return desc, og_rel, P._iso_pt(pub_time)


def main():
    by_date = collect_briefings()
    if not by_date:
        print("No briefings found; nothing to backfill.")
        return
    sorted_dates = sorted(by_date.keys(), reverse=True)
    print(f"Dates: {', '.join(sorted_dates)}")

    # 1. Default OG card (the reliable baseline).
    default_png = os.path.join(P.PUBLIC_DIR, "og", "signals-default.png")
    if P.render_og_card(default_png, "ArcLeap Signals",
                        "Frontier-AI market intelligence, twice daily",
                        "arcleap.ai/signals"):
        print(f"  ✓ {default_png}")
    else:
        print("  ! default OG card not rendered (no headless browser) — "
              "commit a baseline PNG manually if missing")

    # 2. RSS / sitemap / robots.
    n = P.generate_rss(by_date, sorted_dates)
    P.generate_sitemap(sorted_dates)
    P.generate_robots()
    print(f"  ✓ rss.xml ({n} items) · sitemap.xml · robots.txt")

    # 3. Per-day: OG card + head injection into the existing static page + stubs.
    archive_dir = os.path.join(P.SITE_DIR, "archive")
    from datetime import datetime
    for d in sorted_dates:
        db = by_date[d]
        pretty = datetime.strptime(d, "%Y-%m-%d").strftime("%A, %B %d, %Y")
        desc, og_rel, pub_time = day_share_kwargs(d, db)
        block = P.share_head_block(
            title=f"ArcLeap Signals — {pretty}",
            description=desc,
            canonical_path=f"/signals/archive/{d}.html",
            og_image=og_rel,
            published_time=pub_time,
            page_type="article")
        page = os.path.join(archive_dir, f"{d}.html")
        if os.path.exists(page):
            with open(page, encoding="utf-8") as f:
                html = f.read()
            html = P.inject_share_head(html, block)
            with open(page, "w", encoding="utf-8") as f:
                f.write(html)
            print(f"  ✓ head -> archive/{d}.html  (og: {og_rel})")
        else:
            print(f"  ! archive/{d}.html missing — skipped head injection")
        for s in ("morning", "afternoon"):
            if s in db:
                P.write_legacy_session_stub(d, s)
        print(f"  ✓ legacy stubs: "
              + ", ".join(f"{d}-{s}.html" for s in db))

    # 4. Index page head.
    index_path = os.path.join(P.SITE_DIR, "index.html")
    if os.path.exists(index_path):
        block = P.share_head_block(
            title="ArcLeap AI Signals Hub — Market Telemetry",
            description=P.DEFAULT_SHARE_DESC,
            canonical_path="/signals",
            og_image=P.DEFAULT_OG_IMAGE,
            page_type="website")
        with open(index_path, encoding="utf-8") as f:
            html = f.read()
        html = P.inject_share_head(html, block)
        with open(index_path, "w", encoding="utf-8") as f:
            f.write(html)
        print("  ✓ head -> index.html")

    print("Done. No git operations performed.")


if __name__ == "__main__":
    main()
