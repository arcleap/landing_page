#!/usr/bin/env python3
import os
import re
import json
import base64
from datetime import datetime

def split_cofounder_content(text):
    """Splits text into (public_text, cofounder_text)."""
    # Split by the header. We handle emojis and text variations.
    pattern = r"(##\s*🕵️‍♂️\s*(?:Co-founder\s+Confidential|联合创始人机密|联合创始人机密文件|Co-founder Confidential))"
    parts = re.split(pattern, text, flags=re.IGNORECASE)
    if len(parts) >= 3:
        public_text = parts[0].strip()
        cofounder_text = "".join(parts[2:]).strip()
        return public_text, cofounder_text
    return text.strip(), ""

# Repo-portable paths (resolve through the ~/.hermes/scripts symlink to the repo).
_SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))   # <repo>/signals/scripts
_SIGNALS_DIR = os.path.dirname(_SCRIPT_DIR)                 # <repo>/signals
_REPO_DIR = os.path.dirname(_SIGNALS_DIR)                   # <repo> (landing_page)

# Hermes writes agent briefings to ~/.hermes/cron/output/<job_id>/ (not script-controllable);
# ingest from there and archive copies into the repo for version-controlled history.
HERMES_CRON_DIR = os.path.expanduser("~/.hermes/cron/output")
BRIEFINGS_DIR = os.path.join(_SIGNALS_DIR, "data", "briefings")
TRANS_DIR = os.path.join(_SIGNALS_DIR, "data", "translated")
os.makedirs(BRIEFINGS_DIR, exist_ok=True)
os.makedirs(TRANS_DIR, exist_ok=True)

SITE_DIR = os.path.join(_REPO_DIR, "public", "signals")
os.makedirs(SITE_DIR, exist_ok=True)
os.makedirs(os.path.join(SITE_DIR, "archive"), exist_ok=True)

# Map folder/job to session label
SESSIONS = {
    "f708e9d64322": "morning",
    "e9b4bb7aede2": "afternoon"
}

def translate_markdown(text, target_lang="Chinese"):
    """Translate markdown to Chinese via Gemini Flash (light Tier-1 task: cheap + fast). Model fallback."""
    import urllib.request
    api_key = None
    env_path = os.path.expanduser("~/.hermes/.env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.strip().startswith("GOOGLE_API_KEY="):
                    api_key = line.split("=", 1)[1].strip().strip(chr(34)).strip(chr(39))
                    break
    api_key = api_key or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print("  GOOGLE_API_KEY not found, skipping translation.")
        return None
    prompt = ("You are a world-class AI/startup/tech translator. Translate the following Markdown into "
              f"natural, idiomatic {target_lang}. Preserve ALL markdown formatting and ALL [anchor](url) "
              "links exactly. Use modern Chinese tech terminology (MoE/混合专家模型, prompt injection/提示词注入, "
              "inference/推理). Output ONLY the translated markdown, no preamble. MARKDOWN TO TRANSLATE: " + text)
    payload = {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"temperature": 0.2}}
    for model in ("gemini-3.5-flash", "gemini-2.5-flash"):
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        try:
            req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"),
                                         headers={"Content-Type": "application/json"}, method="POST")
            with urllib.request.urlopen(req, timeout=90) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            print(f"  Translation via {model} failed: {e}")
    return None


def get_translated_content(date_str, session_type, original_content):
    """Retrieve translated content from cache, or translate and save if not cached (with MD5 hash validation)."""
    import hashlib
    cache_file = os.path.join(TRANS_DIR, f"{date_str}-{session_type}.zh.md")
    hash_file = os.path.join(TRANS_DIR, f"{date_str}-{session_type}.zh.md.hash")
    
    current_hash = hashlib.md5(original_content.encode("utf-8")).hexdigest()
    
    if os.path.exists(cache_file) and os.path.exists(hash_file) and os.path.getsize(cache_file) > 0:
        try:
            with open(hash_file, "r", encoding="utf-8") as hf:
                cached_hash = hf.read().strip()
            if cached_hash == current_hash:
                with open(cache_file, "r", encoding="utf-8") as f:
                    return f.read()
        except Exception as e:
            print(f"  Error reading translation cache hash: {e}")
            
    print(f"  Chinese cache for {date_str} {session_type} is missing or stale. Translating...")
    translated = translate_markdown(original_content, "Chinese")
    if translated:
        try:
            with open(cache_file, "w", encoding="utf-8") as f:
                f.write(translated)
            with open(hash_file, "w", encoding="utf-8") as hf:
                hf.write(current_hash)
            print(f"  ✓ Cached translation and hash for {date_str} {session_type}")
            return translated
        except Exception as e:
            print(f"  Error writing translation cache or hash: {e}")
    return None

def parse_briefing_file(filepath, session_type):
    """Parse a cron output markdown file and extract the agent's response."""
    if not os.path.exists(filepath):
        return None
    
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Extract Run Time metadata
    run_time_match = re.search(r"\*\*Run Time:\*\* ([\d\-\s:]+)", content)
    run_time_str = run_time_match.group(1).strip() if run_time_match else ""
    
    # Extract response section
    parts = re.split(re.compile(r"^##\s+Response\s*$", re.IGNORECASE | re.MULTILINE), content)
    if len(parts) < 2:
        return None
    
    response_content = parts[-1].strip()
    
    # If the response was [SILENT] or empty, skip it
    if "[SILENT]" in response_content or not response_content:
        return None
        
    # Get date from file name or run_time
    file_name = os.path.basename(filepath)
    date_match = re.search(r"(\d{4}-\d{2}-\d{2})", file_name)
    date_str = date_match.group(1) if date_match else datetime.today().strftime("%Y-%m-%d")
    
    return {
        "date": date_str,
        "run_time": run_time_str,
        "session": session_type,
        "content": response_content
    }

def markdown_to_html(md_text):
    """A lightweight markdown-to-HTML converter that handles basic formatting, headers, links, and lists."""
    html = md_text
    
    # Escape HTML
    html = html.replace("<", "&lt;").replace(">", "&gt;")
    
    # Convert dividers
    html = re.sub(r"^---+$", "<hr class='border-zinc-800 my-6' />", html, flags=re.MULTILINE)
    
    # Convert Headers
    html = re.sub(r"^###\s+(.+)$", "<h3 class='text-lg font-bold text-zinc-100 mt-6 mb-2'>\g<1></h3>", html, flags=re.MULTILINE)
    html = re.sub(r"^##\s+(.+)$", "<h2 class='text-xl font-bold text-sky-400 mt-8 mb-4 border-b border-zinc-800 pb-2'>\g<1></h2>", html, flags=re.MULTILINE)
    html = re.sub(r"^#\s+(.+)$", "<h1 class='text-2xl font-black text-zinc-100 mt-8 mb-6'>\g<1></h1>", html, flags=re.MULTILINE)
    
    # Convert bold and italic
    html = re.sub(r"\*\*([^*\n]+)\*\*", "<strong class='text-zinc-100 font-semibold'>\g<1></strong>", html)
    html = re.sub(r"\*([^*\n]+)\*", "<em class='text-zinc-400 italic'>\g<1></em>", html)
    
    # Convert links
    html = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", "<a href='\g<2>' target='_blank' class='text-sky-400 hover:text-sky-300 underline inline-flex items-center gap-1 transition-colors'>\g<1> <svg class='w-3 h-3 inline' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'></path></svg></a>", html)
    
    # Bullet points
    lines = html.split("\n")
    in_list = False
    new_lines = []
    for line in lines:
        match = re.match(r"^[\s]*[•\-*][\s]+(.*)$", line)
        if match:
            if not in_list:
                new_lines.append("<ul class='list-disc pl-5 space-y-2 my-4 text-zinc-300'>")
                in_list = True
            new_lines.append(f"<li>{match.group(1)}</li>")
        else:
            if in_list:
                new_lines.append("</ul>")
                in_list = False
            new_lines.append(line)
    if in_list:
        new_lines.append("</ul>")
    
    html = "\n".join(new_lines)
    
    # Convert paragraphs
    paragraphs = html.split("\n\n")
    for i, p in enumerate(paragraphs):
        p_strip = p.strip()
        if p_strip and not p_strip.startswith("<h") and not p_strip.startswith("<ul") and not p_strip.startswith("<li") and not p_strip.startswith("<hr") and not p_strip.startswith("<div"):
            paragraphs[i] = f"<p class='text-zinc-300 leading-relaxed my-3'>{p_strip}</p>"
    
    html = "\n\n".join(paragraphs)
    return html

def sync_briefings():
    """Ingest Hermes-produced agent briefings into the repo's centralized, version-controlled store.
    Hermes writes to ~/.hermes/cron/output/<job_id>/; copy new/updated .md files into
    signals/data/briefings/<session>/ so the repo holds the canonical briefing history."""
    import shutil
    for job_id, session_type in SESSIONS.items():
        src_dir = os.path.join(HERMES_CRON_DIR, job_id)
        if not os.path.isdir(src_dir):
            continue
        dest_dir = os.path.join(BRIEFINGS_DIR, session_type)
        os.makedirs(dest_dir, exist_ok=True)
        for file_name in os.listdir(src_dir):
            if not file_name.endswith(".md"):
                continue
            src = os.path.join(src_dir, file_name)
            dest = os.path.join(dest_dir, file_name)
            try:
                if (not os.path.exists(dest)) or os.path.getmtime(src) > os.path.getmtime(dest):
                    shutil.copy2(src, dest)
            except Exception as e:
                print(f"  Briefing sync failed for {src}: {e}")


def render_raw_materials(date_str):
    """Bottom-of-page collapsible: the Tier-1 verified, dual-scored, outlier-tagged raw signal set."""
    path = os.path.join(_SIGNALS_DIR, "data", "enriched", f"{date_str}.json")
    if not os.path.exists(path):
        return ""
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except Exception:
        return ""
    items = data.get("items", [])
    if not items:
        return ""
    c = data.get("counts", {})
    bc = c.get("by_confidence", {})
    badge = {"Confirmed": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
             "Reported": "bg-sky-500/10 text-sky-400 border-sky-500/20",
             "Rumor": "bg-zinc-700/40 text-zinc-400 border-zinc-700"}
    rows = []
    for e in items:
        conf = e.get("confidence", "Rumor")
        b = badge.get(conf, badge["Rumor"])
        star = '<span class="text-sky-400 font-bold" title="preserved non-consensus outlier">&#9733;</span> ' if e.get("outlier") else ""
        url = e.get("url", "#")
        title = (e.get("title", "") or "").replace("<", "&lt;").replace(">", "&gt;")
        rows.append(
            '<tr class="border-b border-zinc-900/60 hover:bg-zinc-900/30">'
            f'<td class="py-1.5 pr-2 align-top whitespace-nowrap"><span class="text-[10px] px-1.5 py-0.5 rounded border {b}">{conf}</span></td>'
            f'<td class="py-1.5 pr-2 align-top text-[10px] text-zinc-500 whitespace-nowrap">{e.get("delta","")}</td>'
            f'<td class="py-1.5 pr-2 align-top text-[10px] text-zinc-500 whitespace-nowrap">i{e.get("importance","")}/e{e.get("edge","")}</td>'
            f'<td class="py-1.5 align-top">{star}<a href="{url}" target="_blank" class="text-zinc-300 hover:text-sky-400">{title}</a> '
            f'<span class="text-zinc-600 text-[10px]">[{e.get("source","")}]</span></td></tr>'
        )
    summary = (f'{c.get("total", len(items))} items &middot; {c.get("outliers", 0)} &#9733;outliers &middot; '
               f'Confirmed {bc.get("Confirmed",0)} / Reported {bc.get("Reported",0)} / Rumor {bc.get("Rumor",0)}')
    return (
        '<details class="mt-16 group">'
        '<summary class="cursor-pointer select-none text-sm font-bold text-zinc-400 uppercase tracking-wider hover:text-sky-400 transition-colors flex items-center gap-2">'
        '<span class="transition-transform group-open:rotate-90">&#9656;</span> Raw Materials '
        '<span class="text-[10px] font-normal text-zinc-600 normal-case tracking-normal">(Tier 1 &mdash; verified &amp; scored; &#9733; = preserved outlier)</span>'
        '</summary>'
        f'<p class="text-xs text-zinc-600 mt-2 mb-3">{summary}</p>'
        '<div class="overflow-x-auto"><table class="w-full text-sm border-collapse">'
        + "".join(rows) +
        '</table></div></details>'
    )


def render_stats(date_str):
    """Source Statistics header, computed deterministically from the Tier-1 enriched sidecar."""
    path = os.path.join(_SIGNALS_DIR, "data", "enriched", f"{date_str}.json")
    if not os.path.exists(path):
        return ""
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except Exception:
        return ""
    items = data.get("items", [])
    if not items:
        return ""
    c = data.get("counts", {})
    bc = c.get("by_confidence", {})
    hn = sum(1 for e in items if str(e.get("source", "")).startswith("hackernews"))
    reddit = sum(1 for e in items if str(e.get("source", "")).startswith("reddit/"))
    subs = len({e.get("source", "") for e in items if str(e.get("source", "")).startswith("reddit/")})
    x = sum(1 for e in items if str(e.get("source", "")).startswith("x.com"))
    total = c.get("total", len(items))
    return (
        '<div class="mb-8 p-4 rounded-xl bg-zinc-900/40 border border-zinc-900 not-prose">'
        '<div class="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">&#128202; Source Statistics</div>'
        '<div class="flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-400">'
        f'<span><b class="text-zinc-200">{total}</b> unique items</span>'
        f'<span>HackerNews <b class="text-zinc-200">{hn}</b></span>'
        f'<span>Reddit <b class="text-zinc-200">{reddit}</b> ({subs} subs)</span>'
        f'<span>X.com <b class="text-zinc-200">{x}</b></span>'
        f'<span><b class="text-zinc-200">{c.get("outliers",0)}</b> &#9733;outliers</span>'
        f'<span>{c.get("new",0)} new / {c.get("ongoing",0)} ongoing</span>'
        f'<span class="text-zinc-500">Confirmed {bc.get("Confirmed",0)} &middot; Reported {bc.get("Reported",0)} &middot; Rumor {bc.get("Rumor",0)}</span>'
        '</div></div>'
    )


# ── Local TTS (Piper) ──────────────────────────────────────────────────────────
TTS_PY = os.path.expanduser(os.environ.get("SIGNALS_TTS_PY", "~/.signals-tts/bin/python"))
TTS_VOICES = os.path.expanduser(os.environ.get("SIGNALS_TTS_VOICES", "~/.signals-tts-voices"))
TTS_VOICE = {"en": "en_US-lessac-medium", "zh": "zh_CN-huayan-medium"}


def clean_for_tts(md):
    """Markdown/links/emoji -> clean spoken prose."""
    t = md or ""
    t = re.sub(r"```.*?```", " ", t, flags=re.DOTALL)
    t = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", t)
    t = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", t)          # link -> anchor text
    t = re.sub(r"https?://\S+", " ", t)                       # bare urls
    t = re.sub(r"[#>*_`~|]+", " ", t)                          # md punctuation
    # strip emoji / pictographs / arrows by codepoint (no regex-escape headaches; keeps CJK)
    t = "".join(ch for ch in t if not (
        0x1F000 <= ord(ch) <= 0x1FAFF or 0x2600 <= ord(ch) <= 0x27BF or
        0x2B00 <= ord(ch) <= 0x2BFF or 0x2190 <= ord(ch) <= 0x21FF or
        ord(ch) in (0xFE0F, 0x200D, 0x2B50, 0x2728)))
    t = re.sub(r"(?m)^\s*[-•]\s*", " ", t)                    # bullet markers
    t = t.replace("\n", " ")
    t = re.sub(r"[ \t]+", " ", t)
    return t.strip()


def _tts_hash(s_):
    import hashlib
    return hashlib.md5(s_.encode("utf-8")).hexdigest()


def generate_audio(text, lang, date_str, session):
    """Synthesize the PUBLIC section to mp3 via local Piper. Cached by content hash. Non-fatal."""
    import subprocess, tempfile
    clean = clean_for_tts(text)
    if len(clean) < 20:
        return None
    name = f"{date_str}-{session}-{lang}"
    mp3_path = os.path.join(SITE_DIR, "audio", f"{name}.mp3")
    hash_path = os.path.join(_SIGNALS_DIR, "data", "audio", f"{name}.hash")
    h = _tts_hash(clean)
    if os.path.exists(mp3_path) and os.path.exists(hash_path):
        try:
            if open(hash_path, encoding="utf-8").read().strip() == h:
                return f"/signals/audio/{name}.mp3"   # cache hit
        except Exception:
            pass
    if not os.path.exists(TTS_PY):
        print(f"  [tts] piper not found at {TTS_PY}; skipping audio for {name}")
        return None
    os.makedirs(os.path.dirname(mp3_path), exist_ok=True)
    os.makedirs(os.path.dirname(hash_path), exist_ok=True)
    fd, txt_path = tempfile.mkstemp(suffix=".txt")
    wav_path = mp3_path[:-4] + ".wav"
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(clean)
        subprocess.run([TTS_PY, "-m", "piper", "-m", TTS_VOICE[lang], "--data-dir", TTS_VOICES,
                        "-f", wav_path, "-i", txt_path], check=True, capture_output=True, timeout=400)
        subprocess.run(["ffmpeg", "-y", "-i", wav_path, "-ac", "1", "-b:a", "48k", mp3_path],
                       check=True, capture_output=True, timeout=120)
        with open(hash_path, "w", encoding="utf-8") as f:
            f.write(h)
        print(f"  [tts] {name}.mp3 ({os.path.getsize(mp3_path)//1024} KB)")
        return f"/signals/audio/{name}.mp3"
    except Exception as e:
        print(f"  [tts] synth failed for {name}: {e}")
        return None
    finally:
        for p in (txt_path, wav_path):
            try:
                os.remove(p)
            except Exception:
                pass


def audio_player(url):
    if not url:
        return ""
    return ('<div class="not-prose mb-5">'
            '<div class="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">\U0001F50A Listen</div>'
            f'<audio controls preload="none" class="w-full h-10" src="{url}"></audio></div>')


def prune_audio(days=14):
    import time
    d = os.path.join(SITE_DIR, "audio")
    if not os.path.isdir(d):
        return
    cutoff = time.time() - days * 86400
    for fn in os.listdir(d):
        fp = os.path.join(d, fn)
        try:
            if os.path.isfile(fp) and os.path.getmtime(fp) < cutoff:
                os.remove(fp)
        except Exception:
            pass


def build_site():
    print("Rebuilding static website from briefings...")

    # Ingest latest Hermes briefings into the repo store, then build from the repo copy
    sync_briefings()
    os.makedirs(os.path.join(SITE_DIR, "audio"), exist_ok=True)
    prune_audio(14)
    
    # Collect all briefings
    briefings_by_date = {}
    
    for session_type in dict.fromkeys(SESSIONS.values()):
        folder_path = os.path.join(BRIEFINGS_DIR, session_type)
        if not os.path.isdir(folder_path):
            continue
            
        for file_name in os.listdir(folder_path):
            if not file_name.endswith(".md"):
                continue
            filepath = os.path.join(folder_path, file_name)
            
            try:
                data = parse_briefing_file(filepath, session_type)
                if data:
                    date_str = data["date"]
                    briefings_by_date.setdefault(date_str, {})
                    
                    existing = briefings_by_date[date_str].get(session_type)
                    if not existing or data["run_time"] > existing["run_time"]:
                        briefings_by_date[date_str][session_type] = data
            except Exception as e:
                print(f"Error parsing file {filepath}: {e}")

    if not briefings_by_date:
        print("No briefings found to publish.")
        return
        
    sorted_dates = sorted(briefings_by_date.keys(), reverse=True)
    SESSION_ORDER = ["morning", "afternoon"]
    # One post per (date, session) — morning & afternoon are SEPARATE pages.
    entries = [(d, s) for d in sorted_dates for s in SESSION_ORDER if s in briefings_by_date[d]]
    
    # Layout wrapper
    def wrap_template(title, content_html, active_key=None):
        sidebar_items = []
        for (d, s) in entries:
            dt_obj = datetime.strptime(d, "%Y-%m-%d")
            pretty_date = dt_obj.strftime("%b %d, %Y")
            icon = "🌅" if s == "morning" else "🌇"
            sess_label = "Morning" if s == "morning" else "Afternoon"
            if f"{d}-{s}" == active_key:
                card = "bg-zinc-900/80 border border-zinc-800/60"
                txt = "text-sky-400 font-bold"
            else:
                card = "hover:bg-zinc-900/60 border border-transparent"
                txt = "text-zinc-300 hover:text-sky-400"
            sidebar_items.append(f'<a href="/signals/archive/{d}-{s}.html" class="block px-3 py-2.5 rounded-xl transition-all {card}"><div class="text-sm font-semibold {txt} transition-all">{pretty_date}</div><div class="text-[11px] text-zinc-500 mt-1 font-medium">{icon} {sess_label}</div></a>')
        sidebar_html = chr(10).join(sidebar_items)
        
        return f"""<!DOCTYPE html>
<html lang="en" class="bg-zinc-950 text-zinc-100">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        body {{
            font-family: 'Plus Jakarta Sans', sans-serif;
        }}
    </style>
</head>
<body class="flex min-h-screen bg-zinc-950">
    <!-- Mobile Header -->
    <div class="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 z-30 flex items-center justify-between px-6">
        <button onclick="toggleSidebar()" class="text-zinc-400 hover:text-zinc-200 focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
        </button>
        <span class="text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">ArcLeap AI</span>
        <div class="w-6"></div> <!-- spacer to center logo -->
    </div>

    <!-- Backdrop Overlay for Mobile -->
    <div id="sidebar-backdrop" onclick="toggleSidebar()" class="fixed inset-0 bg-black/60 z-20 hidden md:hidden transition-opacity"></div>

    <!-- Sidebar -->
    <aside id="sidebar" class="fixed inset-y-0 left-0 z-40 w-80 border-r border-zinc-900 flex-shrink-0 flex flex-col h-screen bg-zinc-950/95 backdrop-blur-md transform -translate-x-full transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:bg-zinc-950">
        <!-- Close button for mobile -->
        <div class="md:hidden flex justify-end p-4 border-b border-zinc-900">
            <button onclick="toggleSidebar()" class="text-zinc-500 hover:text-zinc-300">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
        
        <!-- Brand -->
        <div class="p-6 border-b border-zinc-900 hidden md:block">
            <a href="/" class="flex items-center gap-3">
                <span class="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">ArcLeap AI</span>
            </a>
            <p class="text-xs text-zinc-500 mt-2 font-medium uppercase tracking-wider">Startup Intelligence Hub</p>
        </div>
        
        <!-- Archive Navigation -->
        <div class="flex-1 overflow-y-auto p-4 space-y-1">
            <h4 class="text-xs font-semibold text-zinc-500 px-3 mb-3 uppercase tracking-wider">Briefing Log</h4>
            <a href="/signals" class="block px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-all mb-2 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                Signals Hub
            </a>
            {sidebar_html}
        </div>
        
        <!-- Sidebar Newsletter -->
        <div class="p-6 border-t border-zinc-900 bg-zinc-950">
            <p class="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Join 1,000+ Founders</p>
            <form action="https://buttondown.email/api/emails/embed-subscribe/arcleap" method="post" target="popupwindow" onsubmit="window.open('https://buttondown.email/arcleap', 'popupwindow')" class="space-y-2">
                <input type="email" name="email" required placeholder="Founder email..." class="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-sky-400 placeholder-zinc-600 transition-all" />
                <input type="hidden" value="1" name="embed" />
                <button type="submit" class="w-full bg-gradient-to-r from-sky-400 to-indigo-500 text-zinc-950 font-bold py-2.5 rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all">
                    Subscribe
                </button>
            </form>
        </div>
        
        <!-- Footer Info -->
        <div class="p-6 border-t border-zinc-900 text-xs text-zinc-500">
            <p class="font-semibold text-zinc-400 mb-1">Published by:</p>
            <p>ArcLeap Research Lab</p>
            <p class="mt-4 text-zinc-600">&copy; 2026 ArcLeap AI</p>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 min-w-0 bg-zinc-950 overflow-y-auto pt-16 md:pt-0">
        <div class="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
            {content_html}
        </div>
    </main>

    <script>
    function setLanguage(id, lang) {{
        const enBlock = document.getElementById('content-en-' + id);
        const zhBlock = document.getElementById('content-zh-' + id);
        const btnEn = document.getElementById('btn-en-' + id);
        const btnZh = document.getElementById('btn-zh-' + id);
        
        if (lang === 'en') {{
            enBlock.classList.remove('hidden');
            zhBlock.classList.add('hidden');
            btnEn.className = 'px-3 py-1 text-xs rounded-full bg-zinc-800 text-sky-400 font-semibold border border-zinc-700 transition-all';
            btnZh.className = 'px-3 py-1 text-xs rounded-full bg-zinc-900 text-zinc-500 font-medium hover:bg-zinc-800 transition-all';
        }} else {{
            enBlock.classList.add('hidden');
            zhBlock.classList.remove('hidden');
            btnEn.className = 'px-3 py-1 text-xs rounded-full bg-zinc-900 text-zinc-500 font-medium hover:bg-zinc-800 transition-all';
            btnZh.className = 'px-3 py-1 text-xs rounded-full bg-zinc-800 text-sky-400 font-semibold border border-zinc-700 transition-all';
        }}
        
        // Update cofounder section visibility if decrypted
        const saved = localStorage.getItem("arcleap_cofounder_key");
        if (saved === "0915") {{
            const enSection = document.getElementById("cofounder-content-en-" + id);
            const zhSection = document.getElementById("cofounder-content-zh-" + id);
            if (enSection && zhSection) {{
                if (lang === 'en') {{
                    enSection.classList.remove("hidden");
                    zhSection.classList.add("hidden");
                }} else {{
                    enSection.classList.add("hidden");
                    zhSection.classList.remove("hidden");
                }}
            }}
        }}
    }}

    function utf8B64Decode(str) {{
        try {{
            return new TextDecoder().decode(Uint8Array.from(atob(str), c => c.charCodeAt(0)));
        }} catch (e) {{
            console.error("UTF-8 decoding failed, falling back", e);
            return atob(str);
        }}
    }}

    function checkExistingLock() {{
        const saved = localStorage.getItem("arcleap_cofounder_key");
        if (saved === "0915") {{
            // Automatically unlock and render all cofounder blocks
            document.querySelectorAll("[id^='cofounder-lock-']").forEach(el => el.classList.add("hidden"));
            
            document.querySelectorAll("[id^='cofounder-content-en-']").forEach(el => {{
                const blockId = el.id.replace("cofounder-content-en-", "");
                const encodedEnEl = document.getElementById("data-en-" + blockId);
                if (encodedEnEl) {{
                    const decodedEn = utf8B64Decode(encodedEnEl.value);
                    const bodyEnEl = document.getElementById("cofounder-body-en-" + blockId);
                    if (bodyEnEl) bodyEnEl.innerHTML = decodedEn;
                    
                    const enBlockActive = !document.getElementById("content-en-" + blockId).classList.contains("hidden");
                    if (enBlockActive) {{
                        el.classList.remove("hidden");
                    }}
                }}
            }});
            
            document.querySelectorAll("[id^='cofounder-content-zh-']").forEach(el => {{
                const blockId = el.id.replace("cofounder-content-zh-", "");
                const encodedZhEl = document.getElementById("data-zh-" + blockId);
                if (encodedZhEl) {{
                    const decodedZh = utf8B64Decode(encodedZhEl.value);
                    const bodyZhEl = document.getElementById("cofounder-body-zh-" + blockId);
                    if (bodyZhEl) bodyZhEl.innerHTML = decodedZh;
                    
                    const zhBlockActive = !document.getElementById("content-zh-" + blockId).classList.contains("hidden");
                    if (zhBlockActive) {{
                        el.classList.remove("hidden");
                    }}
                }}
            }});
        }}
    }}

    function unlockCofounder(id) {{
        const input = document.getElementById("passcode-input-" + id).value;
        if (input === "0915") {{
            localStorage.setItem("arcleap_cofounder_key", "0915");
            checkExistingLock();
        }} else {{
            const err = document.getElementById("error-message-" + id);
            if (err) {{
                err.classList.remove("hidden");
                setTimeout(() => err.classList.add("hidden"), 3000);
            }}
        }}
    }}

    window.addEventListener("DOMContentLoaded", checkExistingLock);
    </script>
</body>
</html>
"""

    # Generate daily pages
    for d in sorted_dates:
        day_briefings = briefings_by_date[d]
        dt_obj = datetime.strptime(d, "%Y-%m-%d")
        pretty_date = dt_obj.strftime("%A, %B %d, %Y")
        
        day_content_blocks = []
        
        for s_type in ["morning", "afternoon"]:
            if s_type in day_briefings:
                brief = day_briefings[s_type]
                icon = "🌅" if s_type == "morning" else "🌆"
                label = "Morning Briefing" if s_type == "morning" else "Afternoon Update"
                
                # Fetch Chinese translation
                translated_md = get_translated_content(d, s_type, brief["content"])
                
                # Split content into public and cofounder parts
                pub_en, co_en = split_cofounder_content(brief["content"])
                pub_zh, co_zh = split_cofounder_content(translated_md if translated_md else "")
                
                # Convert both to HTML
                stats_html = render_stats(d)
                audio_en = generate_audio(pub_en, "en", d, s_type)
                audio_zh = generate_audio(pub_zh, "zh", d, s_type)
                html_en = audio_player(audio_en) + stats_html + markdown_to_html(pub_en)
                html_zh = audio_player(audio_zh) + stats_html + markdown_to_html(pub_zh if pub_zh else "*(Translation failed or not available)*")
                
                block_id = f"{d}-{s_type}"
                
                cofounder_html_section = ""
                if co_en:
                    # Convert to HTML and Base64-encode
                    html_co_en = markdown_to_html(co_en)
                    html_co_zh = markdown_to_html(co_zh if co_zh else "*(Translation failed or not available)*")
                    
                    b64_en = base64.b64encode(html_co_en.encode("utf-8")).decode("utf-8")
                    b64_zh = base64.b64encode(html_co_zh.encode("utf-8")).decode("utf-8")
                    
                    cofounder_html_section = f"""
                    <!-- Base64 Encoded Secret Payload -->
                    <textarea id="data-en-{block_id}" class="hidden">{b64_en}</textarea>
                    <textarea id="data-zh-{block_id}" class="hidden">{b64_zh}</textarea>
                    
                    <!-- Locked/Decryption Container -->
                    <div id="cofounder-lock-{block_id}" class="mt-8 p-8 bg-zinc-950 border border-sky-500/20 rounded-2xl text-center relative overflow-hidden backdrop-blur-md">
                        <div class="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent"></div>
                        <div class="relative z-10 max-w-sm mx-auto">
                            <div class="w-12 h-12 bg-sky-500/10 text-sky-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-sky-500/20">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                </svg>
                            </div>
                            <h3 class="text-lg font-bold text-zinc-100">Co-founder Channel Locked</h3>
                            <p class="text-xs text-zinc-400 mt-1 mb-4">This section contains subjective, strategic co-founder signals. Enter passcode to decrypt.</p>
                            <div class="flex gap-2 justify-center">
                                <input type="password" id="passcode-input-{block_id}" placeholder="Enter passcode..." class="bg-zinc-900 border border-zinc-800 text-zinc-100 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-sky-400 w-48 text-center transition-all" onkeydown="if(event.key === 'Enter') unlockCofounder('{block_id}')" />
                                <button onclick="unlockCofounder('{block_id}')" class="bg-gradient-to-r from-sky-400 to-indigo-500 text-zinc-950 font-bold px-4 py-2 rounded-xl text-xs hover:opacity-90 active:scale-95 transition-all">
                                    Decrypt
                                </button>
                            </div>
                            <p id="error-message-{block_id}" class="text-red-500 text-[10px] mt-2 hidden">Invalid passcode. Access denied.</p>
                        </div>
                    </div>
                    
                    <!-- Decrypted Containers -->
                    <div id="cofounder-content-en-{block_id}" class="hidden mt-8 p-8 bg-sky-500/5 border border-sky-500/10 rounded-2xl">
                        <div class="flex items-center gap-2 mb-4 text-xs font-bold text-sky-400 uppercase tracking-widest border-b border-sky-500/10 pb-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            Co-founder Confidential (EN)
                        </div>
                        <div class="prose prose-invert max-w-none text-zinc-200" id="cofounder-body-en-{block_id}"></div>
                    </div>
                    
                    <div id="cofounder-content-zh-{block_id}" class="hidden mt-8 p-8 bg-sky-500/5 border border-sky-500/10 rounded-2xl">
                        <div class="flex items-center gap-2 mb-4 text-xs font-bold text-sky-400 uppercase tracking-widest border-b border-sky-500/10 pb-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            联合创始人机密 (ZH)
                        </div>
                        <div class="prose prose-invert max-w-none text-zinc-200" id="cofounder-body-zh-{block_id}"></div>
                    </div>
                    """
                
                session_html = f"""
                <section id="{s_type}" class="scroll-mt-24 mb-16 bg-zinc-900/40 border border-zinc-900 rounded-2xl p-8 backdrop-blur-sm">
                    <!-- Section Header -->
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-900">
                        <div class="flex items-center gap-3">
                            <span class="text-3xl">{icon}</span>
                            <div>
                                <h2 class="text-2xl font-black text-zinc-100">{label}</h2>
                                <p class="text-xs text-zinc-500 mt-1 font-semibold tracking-wide uppercase">Analyzed at {brief["run_time"]} PT</p>
                            </div>
                        </div>
                        
                        <!-- Language Switcher -->
                        <div class="flex gap-2 self-start md:self-center">
                            <button onclick="setLanguage('{block_id}', 'en')" id="btn-en-{block_id}" class="px-3 py-1 text-xs rounded-full bg-zinc-800 text-sky-400 font-semibold border border-zinc-700 transition-all">English 🇺🇸</button>
                            <button onclick="setLanguage('{block_id}', 'zh')" id="btn-zh-{block_id}" class="px-3 py-1 text-xs rounded-full bg-zinc-900 text-zinc-500 font-medium hover:bg-zinc-800 transition-all">中文 🇨🇳</button>
                        </div>
                    </div>
                    
                    <!-- Content Containers -->
                    <div id="content-en-{block_id}" class="prose prose-invert max-w-none">
                        {html_en}
                    </div>
                    <div id="content-zh-{block_id}" class="prose prose-invert max-w-none hidden">
                        {html_zh}
                    </div>
                    
                    {cofounder_html_section}
                </section>
                """
                raw_materials_html = render_raw_materials(d)
                page_body = f"""
        <div class="mb-12">
            <a href="/signals" class="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-sky-400 transition-colors group mb-4">
                <svg class="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Back to Signals Hub
            </a>
            <h1 class="text-4xl font-extrabold tracking-tight text-zinc-100">{pretty_date}</h1>
            <p class="text-zinc-500 mt-2">{icon} {label}</p>
        </div>
        {session_html}
        {raw_materials_html}
        """
                page_html = wrap_template(f"ArcLeap AI — {pretty_date} ({label})", page_body, f"{d}-{s_type}")
                with open(os.path.join(SITE_DIR, "archive", f"{d}-{s_type}.html"), "w", encoding="utf-8") as f:
                    f.write(page_html)
            
    # Generate dedicated index.html (Signals Hub) — one card per (date, session)
    archive_cards = []
    for (d, s) in entries:
        dt_obj = datetime.strptime(d, "%Y-%m-%d")
        pretty_date = dt_obj.strftime("%B %d, %Y")
        icon = "🌅" if s == "morning" else "🌇"
        sess_label = "Morning" if s == "morning" else "Afternoon"
        badge = ("bg-sky-500/10 text-sky-400 border-sky-500/20" if s == "morning"
                 else "bg-indigo-500/10 text-indigo-400 border-indigo-500/20")
        archive_cards.append(f"""
        <div class="p-6 bg-zinc-900/40 border border-zinc-900 rounded-2xl hover:border-zinc-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
            <div>
                <span class="text-xs text-zinc-500 font-bold uppercase tracking-wider">{dt_obj.strftime("%A")}</span>
                <h3 class="text-xl font-bold text-zinc-100 mt-1">{pretty_date}</h3>
                <div class="flex gap-2 mt-3"><span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border {badge}">{icon} {sess_label}</span></div>
            </div>
            <a href="/signals/archive/{d}-{s}.html" class="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-zinc-950 bg-sky-400 rounded-xl hover:bg-sky-300 active:scale-95 transition-all">
                Read Intelligence
                <svg class="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </a>
        </div>
        """)
    archive_cards_html = chr(10).join(archive_cards)

    index_content = f"""
    <!-- Hero Section -->
    <div class="text-center py-12 border-b border-zinc-900 mb-12">
        <h1 class="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">ArcLeap AI Signals</h1>
        <p class="text-lg text-zinc-400 max-w-xl mx-auto mt-4 leading-relaxed">
            Twice-daily technical market telemetry, non-consensus startup opportunities, and developer sentiment shifts.
        </p>
    </div>

    <!-- Newsletter Subscription Card -->
    <div class="p-8 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/80 rounded-2xl shadow-xl mb-16 relative overflow-hidden group">
        <div class="absolute -right-16 -top-16 w-32 h-32 bg-sky-400/5 rounded-full blur-3xl group-hover:bg-sky-400/10 transition-colors"></div>
        <div class="max-w-2xl mx-auto text-center relative z-10">
            <h2 class="text-2xl font-bold text-zinc-100">Subscribe to Daily Signals</h2>
            <p class="text-sm text-zinc-400 mt-2 mb-6">
                Receive the morning briefing and afternoon market intel directly in your inbox. No fluff, just hard signals.
            </p>
            <form action="https://buttondown.email/api/emails/embed-subscribe/arcleap" method="post" target="popupwindow" onsubmit="window.open('https://buttondown.email/arcleap', 'popupwindow')" class="flex flex-col sm:flex-row gap-3">
                <input type="email" name="email" required placeholder="Enter your email address..." class="bg-zinc-950 border border-zinc-800 text-zinc-100 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 flex-1 min-w-0 placeholder-zinc-600 transition-all" />
                <input type="hidden" value="1" name="embed" />
                <button type="submit" class="bg-gradient-to-r from-sky-400 to-indigo-500 text-zinc-950 font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                    Subscribe
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
            </form>
        </div>
    </div>

    <!-- Briefing List -->
    <div class="space-y-6">
        <h2 class="text-xl font-bold text-zinc-400 uppercase tracking-wider mb-6">All Briefing Logs</h2>
        {archive_cards_html}
    </div>
    """
    
    index_html = wrap_template("ArcLeap AI Signals Hub — Market Telemetry", index_content)
    with open(os.path.join(SITE_DIR, "index.html"), "w", encoding="utf-8") as f:
        f.write(index_html)
        
    print(f"✓ Rebuilt: index.html + {len(entries)} per-session archive pages.")
    
    # Push to GitHub
    git_push_changes()


def git_push_changes():
    """Push the generated files inside the cloned Next.js repo to GitHub to trigger Vercel rebuild."""
    import subprocess
    if os.environ.get("SIGNALS_NO_PUSH") == "1":
        print("  [SIGNALS_NO_PUSH=1] Dry-run: skipping git commit/push.")
        return
    print("Pushing updated signals to GitHub...")
    repo_dir = _REPO_DIR
    try:
        # Check status
        status_res = subprocess.run(["git", "status", "--porcelain"], cwd=repo_dir, capture_output=True, text=True)
        if not status_res.stdout.strip():
            print("  No changes to push.")
            return
            
        # Git add
        subprocess.run(["git", "add", "public/signals"], cwd=repo_dir, check=True)
        
        # Git commit
        commit_msg = f"Auto-publish briefing signals: {datetime.today().strftime('%Y-%m-%d')}"
        subprocess.run(["git", "commit", "-m", commit_msg], cwd=repo_dir, check=True)
        
        # Git push
        subprocess.run(["git", "push", "origin", "main"], cwd=repo_dir, check=True)
        print("  ✓ Successfully pushed changes to GitHub! Vercel is now rebuilding.")
    except Exception as e:
        print(f"  Error pushing to GitHub: {e}")


if __name__ == "__main__":
    build_site()
