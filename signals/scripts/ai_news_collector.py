#!/usr/bin/env python3
"""
ai_news_collector.py
Stage 1: Collect raw AI news from HackerNews + Reddit.
Runs every 3 hours via cron (no_agent=True).
- Deduplicates against today's existing file
- Appends only new items
- Prints NOTHING on success (silent = no Telegram noise)
- Prints an error message only on fatal failure (triggers alert)

Data file: <repo>/signals/data/raw/YYYY-MM-DD.jsonl (resolved via realpath of this script)
Each line: JSON object with keys: source, group, title, url, score, ts
"""

import json, sys, time, os
import urllib.request as req
from datetime import datetime, timezone, date, timedelta
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor

# ── Config ────────────────────────────────────────────────────────────────────
_SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))   # <repo>/signals/scripts
_SIGNALS_DIR = os.path.dirname(_SCRIPT_DIR)                 # <repo>/signals
DATA_DIR = os.path.join(_SIGNALS_DIR, "data", "raw")
os.makedirs(DATA_DIR, exist_ok=True)
TODAY = date.today().isoformat()          # e.g. 2026-06-01
DATA_FILE = os.path.join(DATA_DIR, f"{TODAY}.jsonl")

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

# ── Sources ───────────────────────────────────────────────────────────────────
# Full sweep every run (no rotation). Runs twice/day: 7am + 3pm PT.
# Reddit: sequential with 0.5s delay — free, no cost concern.
# X.com: batched OR queries (15 accounts/query) — $0.033/query.
#   ~215 accounts / 15 = ~15 queries per sweep × 2/day = 30 queries/day = ~$1/day = ~$30/month

REDDIT_SUBS = {
    "Core AI — Research":    ["MachineLearning","LocalLLaMA","singularity","artificial","reinforcementlearning"],
    "Core AI — Products":    ["ChatGPT","ClaudeAI","OpenAI","perplexity_ai","GeminiAI"],
    "Generative AI":         ["StableDiffusion","midjourney","AIArt","comfyui"],
    "AI Infra":              ["deeplearning","mlops","computervision","LanguageTechnology"],
    "3D / 4D / Spatial":     ["photogrammetry","gaussian_splatting","virtualreality","SpatialComputing","3Dmodeling"],
    "Agents & Automation":   ["LangChain","AIAssistants","nocode","automation"],
    "AI Apps — Business":    ["ChatGPTPromptEngineering","ProductManagement","marketing","SaaS","Entrepreneur"],
    "AI Apps — Consumer":    ["hardware","nvidia","Futurism","technology"],
    "Startups & VC":         ["startups","venturecapital","ycombinator"],
    "Social Media Platforms":["Twitter","youtube","TikTok","Instagram","socialmedia","linkedin"],
    "Privacy / Infra (#17)": ["netsec","homelab","cryptography","PrivacyGuides"],
    "Diaspora & Memory (#22)":["ChineseAmerican","Genealogy","AsianParents","OldPhotos","mildlyinteresting"],
}

# X.com accounts — flat dict of group → [handles]. Batched OR queries, 15/batch.
X_GROUPS = {
    0: {  # 00:00, 12:00 UTC — Core AI labs + researchers + generative AI creators
        "AI Labs & Companies": [
            "OpenAI","AnthropicAI","GoogleDeepMind","Google","Microsoft","Meta",
            "nvidia","xai","MistralAI","CohereAI","HuggingFace","perplexity_ai",
            "GroqInc","togethercompute","replicate","modal_labs",
            "GoogleAI",            # Google AI blog/announcements
            "GeminiApp",           # Gemini product account
            "Scale_AI",            # Scale AI (data + evals)
        ],
        "Researchers & Engineers": [
            "karpathy","ylecun","demishassabis","sama","ilyasut","gdb","fchollet",
            "GaryMarcus","goodfellow_ian","drfeifei","geoffreyhinton","hardmaru",
            "GwernBranwen","simonw","swyx","jxnlco","emollick","AravSrinivas",
            "jonbarron","ak92501","_akhaliq","paperswithcode",
            "AndrewYNg",           # Stanford + Coursera, ex-Baidu AI
            "lilianweng",          # ex-VP AI Safety OpenAI, co-founder Thinking Machines
            "_jasonwei",           # Meta superintelligence labs, ex-OpenAI/Google
            "soumithchintala",     # PyTorch creator, Thinking Machines
            "_rockt",              # Co-founder Recursive SI, Prof AI UCL
            "tydsh",               # Co-founder Recursive SI, ex-Meta FAIR
            "danqi_chen",          # Princeton + Thinking Machines
            "percyliang",          # Stanford, co-founder Thinking Machines
            "rasbt",               # ML/AI research engineer, LLM book author
            "ShunyuYao12",         # Language agents researcher
            "goodside",            # Riley Goodside — prompt engineering pioneer
            "YejinChoinka",        # Stanford + NVIDIA, commonsense AI
            "SchmidhuberAI",       # Jürgen Schmidhuber — LSTM inventor
            "ClementDelangue",     # HuggingFace CEO
            "huggingface",         # HuggingFace main account
            "arcprize",            # ARC Prize — open AGI benchmark
            "arena",               # LM Arena (LMSYS) — live model evals
            "dair_ai",             # Democratizing AI research
            "Recursive_SI",        # Recursive self-improving SI lab
            "googlegemma",         # Google Gemma open models
            "Alibaba_Qwen",        # Qwen open models
            "CVPR","NeurIPSConf","iclr_conf","icmlconf",  # top AI conferences
            "stanfordnlp","StanfordAILab","berkeley_ai",  # top AI labs
            "PyTorch",             # PyTorch official
            # from jinmiao_ai follows
            "_Hao_Zhu",            # researcher, Stanford NLP
            "brandondamos",        # RL @Reflection_AI, ex-Meta/DeepMind
            "CaimingXiong",        # co-founder Recursive SI, ex-Salesforce AI
            "ChujieZheng",         # researcher @Alibaba_Qwen
            "eqhylxx",             # Lily Liu, @OpenAI + vLLM
            "giffmana",            # Lucas Beyer, researcher ex-DeepMind/OpenAI
            "haopeng_uiuc",        # UIUC CS, ex-AllenAI/Google
            "juliarturc",          # Julia Turc, AI explainer + YC S24 founder
            "kaiwei_chang",        # UCLA NLP/ML professor
            "kchonyc",             # Kyunghyun Cho, NYU
            "lunwang1996",         # @OpenAI, ex-DeepMind
            "seb_ruder",           # research scientist @Meta, ex-DeepMind
            "SeongsikKi5837",      # researcher @thinkymachines
            "weijie444",           # @OpenAI + Wharton professor
            "xuandongzhao",        # postdoc UC Berkeley, ML/NLP/safety
            "xyz2maureen",         # Xueyan Zou, Tsinghua, robotics vision
            "YiMaTweets",          # Yi Ma, mathematical AI theory
            "yinfeiy",             # multimodal, ex-Apple/Google Research
            "Zhou_Yu_AI",          # Columbia, conversational AI
        ],
        "Gemini / DeepMind / World Models": [
            "OriolVinyalsML",      # DeepMind VP Research, Gemini co-lead
            "YiTayML",             # Google DeepMind, Gemini model co-lead
            "FeinbergVlad",        # Gemini Pretraining TL, Google DeepMind
            "Francis_YAO_",        # Gemini 3 perception + Project Astra, now xAI
            "shlomifruchter",      # Research Director DeepMind, Veo/Genie3/Gemini Omni
            "doomie",              # Co-lead Gemini Omni, Google DeepMind
            "nbrichtova",          # Ships GenMedia @DeepMind — Nano Banana, Veo, Gemini Omni
            "borgeaud_s",          # Gemini pre-training lead, DeepMind
            "MuCai7",              # multimodal + agents, ex-DeepMind
            "OfficialLoganK",      # Gemini + Google AI Studio team
            "addyosmani",          # Director Google Cloud AI, Gemini Agents
            "ammaar",              # Lead Product @GoogleAIStudio
            "pushmeet",            # Chief Scientist Google Cloud, VP DeepMind
            "quocleix",            # Google Fellow
            "janexwang",           # Senior staff DeepMind, neuro+AI
            "jeffdean",            # Chief Scientist Google DeepMind, Gemini lead
            "sundarpichai",        # Google CEO — Gemini strategy
            "moonlake",            # efficient world models (startup)
            "theworldlabs",        # World Labs — spatial intelligence, Fei-Fei Li
            "bilawalsidhu",        # Spatial intelligence + world models, 1.6M creator
            "olivercameron",       # CEO @odysseyml — AI world simulation
            "ZheningHuang",        # PhD Cambridge, Video World Model + 3D reconstruction
        ],
        "Generative AI Creators": [
            "pharmapsychotic",     # CLIP/diffusion tools, ComfyUI power user
            "karenxcheng",         # AI video/art, large audience
            "xsteenbrugge",        # AI art, diffusion research
            "nickfloats",          # AI art/video creator
            "ItsMeYohannes",       # AI video generation
            "multimodalart",       # HuggingFace spaces, diffusion demos
            "fofrAI",              # "I like melty AI" — generative art
            "_LucasRizzotto",      # making games for movie theaters, AI+3D
        ],
    },
    1: {  # 03:00, 15:00 UTC — Infra + 3D/Spatial + Agents/builders
        "3D / 4D / Spatial Intelligence": [
            "DrJimFan",            # NVIDIA embodied AI, physical AI lead
            "ID_AA_Carmack",       # John Carmack — indie AGI, spatial
            "scobleizer",          # AR/VR/spatial computing early adopter
            "adcock_brett",        # Figure AI CEO, humanoid robots
            "kaikostack",          # NeRF / 3DGS researcher
            "bmild",               # NeRF original author
            "jbhuang0604",         # computer vision / NeRF researcher
            "DeemosTech",          # 3D Generative AI (Rodin, ChatAvatar)
            "mintdotgg",           # 3D Generator, vibe curator
            "bilawalsidhu",        # spatial intelligence + world models, 1.6M creator
            "dmvrg",               # AR/VR creative technology
            "PavloMolchanov",      # Director of Research @NVIDIA
            "jackhuynh",           # SVP Computing & Graphics @AMD
        ],
        "AI Infra & Open Source": [
            "LangChainAI","hwchase17","llama_index","weaviate_io","pinecone","ChromaDB",
            "ggerganov","winglian","teknium1","natfriedman","danielgross","mckaywrigley",
            "LangChain",           # LangChain main account
            "OpenRouter",          # 500+ model router
            "alighodsi",           # Databricks CEO
            "jeremyphoward",       # fast.ai co-founder
            "rauchg",              # Vercel CEO
            "vercel",              # Vercel (AI deployment infra)
            "leerob",              # Teaching devs @Cursor, ex-Vercel
            "ericzakariasson",     # Cursor contributor
            "mntruell",            # Cursor CEO
            "bcherny",             # Claude Code @Anthropic
            "trq212",              # Claude Code @Anthropic
            "tensor_rotator",      # Inference @Anthropic, ex-Gemini
            "skcd42",              # xAI engineer
            "milichab",            # ex-Cursor CEO, now @xAI
            "steipete",            # AI dev tools / agents practitioner
        ],
        "Agents & Builder Community": [
            "dglazkov",            # Google agent infra
            "amasad",              # Replit CEO, vibe-coding
            "levelsio",            # ships fast, indie builder
            "gregisenberg",        # startup ideas, AI products
            "bentossell",          # no-code/AI builder community
            "theshawwn",           # TPU research club, OSS AI
        ],
    },
    2: {  # 06:00, 18:00 UTC — Founders + Investors + Business AI
        "AI Founders": [
            "dario_amodei","DarioAmodei","btaylor","alexandr_wang","mustafasuleyman","arthurmensch",
            "RichardSocher","emad","kaifulee","EladGil","eladgil","justinkan","shl",
            "elonmusk",            # Tesla/SpaceX/xAI/X
            "satyanadella",        # Microsoft CEO
            "patrickc",            # Stripe CEO
            "collision",           # Stripe co-founder
            "tobi",                # Shopify CEO
            "levie",               # Box CEO
            "ekuyda",              # Replica/Wabi founder
            "nikitabier",          # Head of Product @X
            "jasonfried",          # 37signals/Basecamp founder
            "ajassy",              # Amazon CEO
            "dkhos",               # Uber CEO
            "t_xu",                # DoorDash CEO
            "vladtenev",           # Robinhood CEO
            "eldsjal",             # Spotify founder
            "bscholl",             # Boom Supersonic CEO
            "rahulvohra",          # Superhuman CEO
            "alighodsi",           # Databricks CEO
            "mwseibel",            # YC partner emeritus
            "hardmaru",            # Sakana AI CEO
            "dillonrolnick",       # Nous Research CEO
            "timoreilly",          # O'Reilly Media, tech trends
            "ChrisJBakke",         # founder w/ exits to X, Indeed, Zillow
            "saranormous",         # Sarah Guo — Conviction VC, AI startup investor
            "zoink",               # Dylan Field — Figma CEO, design+AI
        ],
        "Investors & Analysts": [
            "paulg","garrytan","naval","sarah_guo","semil","benedictevans",
            "sequoia","a16z","ycombinator","khoslaventures","Jason","chamath",
            "davemorin","firstmarkcap","pmarca","cdixon","mmay3r",
            "roelofbotha",         # Sequoia partner
            "stephzhan",           # Sequoia GP, AI focus
            "shaunmmaguire",       # Sequoia partner
            "andrew__reed",        # Sequoia partner
            "omooretweets",        # a16z partner, AI
            "venturetwins",        # a16z partner, AI (ElevenLabs etc)
            "jaltma",              # Benchmark partner
            "BessemerVP","BatteryVentures","IndexVentures","GreylockVC",
            "generalcatalyst","lightspeedvp","svangel","upfrontvc","Accel","benchmark",
            "davidcowan",          # Bessemer partner
            "davidhornik",         # Lobby Capital
            "m2jr",                # Mike Maples Jr, Floodgate
        ],
        "AI Apps — Business & Product": [
            "shreyas",             # ex-Stripe/Twitter PM
            "lenny_rachitsky",     # Lenny's Newsletter, PM/growth
            "andrewchen",          # a16z, consumer growth
            "joulee",              # Julie Zhuo, product
            "petergyang",          # product + AI
            "thisiskp_",           # KP — product/AI community
            "ShaanVP","theSamParr",# My First Million, startup ideas
        ],
    },
    3: {  # 09:00, 21:00 UTC — Social platforms + Finance + Diaspora/Media
        "Social Platform Leaders": [
            "jack",                # Bluesky / Block
            "mosseri",             # Instagram head
            "neal_mohan",          # YouTube CEO
            "shou_zi_chew",        # TikTok CEO
            "evanspiegel",         # Snap CEO
        ],
        "Journalists & Media": [
            "benthompson",         # Stratechery — best tech strategy
            "stratechery",         # Stratechery account
            "benedictevans",       # independent analyst
            "mikeisaac",           # NYT tech
            "verge","TechCrunch","wired","venturebeat","theinformation",
            "lexfridman",          # long-form AI interviews
            "balajis",             # contrarian macro+AI
            "waitbutwhy",          # Tim Urban — long-form AI essays
            "arstechnica",         # Ars Technica tech coverage
            "engadget",            # Engadget tech news
            "WSJ",                 # Wall Street Journal
            "TheEconomist",        # The Economist
            "PirateWires",         # tech/politics/culture
        ],
        "AI Hardware Stocks & Finance": [
            # Semiconductor / AI hardware analysts
            "semianalysis",        # Dylan Patel — THE semiconductor deep-dive source
            "PatrickMoorhead",     # chip + server analyst (Moor Insights)
            "Karl_Freund",         # GPU/AI accelerator analyst (Cambrian AI)
            "DanIves",             # Wedbush — most aggressive AI stock coverage
            "EricBalchunas",       # Bloomberg Senior ETF Analyst
            "biancoresearch",      # Jim Bianco — macro investment research
            # Macro / market commentary
            "KobeissiLetter",      # industry leading macro commentary
            "LukeGromen",          # macro — Forest for the Trees (FFTT)
            "InTheAssembly",       # macro analysis + market structure
            "DaveHcontrarian",     # 52yr Wall Street macro strategist
            "RayDalio",            # Bridgewater founder
            "MichaelSantoli",      # CNBC senior markets commentator
            "CathieDWood","arkInvest",  # ARK Invest — AI/innovation ETFs
            "zerohedge",           # macro contrarian, risk signal
            "biancoresearch",      # macro research
            # Options / flow / political trades
            "unusual_whales",      # options flow, retail-friendly
            "QuiverQuant",         # Main Street vs Wall Street data
            "pelositracker",       # politicians' trades tracker
            "tradewithcong",       # Congress trades
            "StockMKTNewz",        # fast stock market news
            # AI hardware community / stock analysis
            "StockMarketNerd",     # NVDA/AMD/AVGO/ARM deep dives
            "EricJacksonFund",     # EMJ Capital, AI stock focus
            "TechAltar",           # tech/hardware analysis
            "WholeMarsBlog","wholemars",  # AI+hardware (Tesla/NVDA)
            "amitisinvesting",     # tech stocks incl PLTR
            "Mr_Derivatives",      # daily stock commentary
            "jam_croissant",       # quant/vol/flow/macro PM
            "PegasusFund",         # L/S equity PM
            "aleabitoreddit",      # AI/semi supply chain analyst (ex-WSB)
        ],
        "AI Safety": [
            "ESYudkowsky","robbensinger","tegmark","PauliusMikalonis",
        ],
    },
}


AI_KW = [
    "ai","llm","gpt","claude","gemini","openai","anthropic","model","neural",
    "machine learning","deep learning","agent","inference","transformer","nvidia",
    "gpu","robotics","foundation model","mistral","diffusion","multimodal","rag",
    "fine-tun","benchmark","hugging","deepmind","groq","tpu","cuda","vllm",
    "ollama","llama","agi","agentic","copilot","cursor","autonomous","embodied",
    "reasoning","sora","stable diffusion","mcp","tool use","reasoning model",
]

# ── Helpers ───────────────────────────────────────────────────────────────────
def fetch_url(url, timeout=6):
    r = req.Request(url, headers={
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    })
    with req.urlopen(r, timeout=timeout) as resp:
        return resp.read().decode("utf-8", errors="replace")


def sanitize_text(text):
    if not isinstance(text, str):
        return text
    # Remove bidirectional formatting characters (causes prompt-injection blocks)
    for char in ['\u202a', '\u202b', '\u202c', '\u202d', '\u202e', '\u200e', '\u200f', '\u2066', '\u2067', '\u2068', '\u2069']:
        text = text.replace(char, '')
    return text


def load_seen_titles(days_back=3):
    """Load titles saved in the last N days to deduplicate."""
    seen = set()
    today_dt = date.today()
    for i in range(days_back):
        day = (today_dt - timedelta(days=i)).isoformat()
        filepath = os.path.join(DATA_DIR, f"{day}.jsonl")
        if os.path.exists(filepath):
            with open(filepath) as f:
                for line in f:
                    try:
                        seen.add(json.loads(line)["title"].lower().strip())
                    except:
                        pass
    return seen


def append_item(item):
    with open(DATA_FILE, "a") as f:
        f.write(json.dumps(item, ensure_ascii=False) + "\n")


def fetch_reddit_sub(sub, limit=10):
    try:
        content = fetch_url(f"https://www.reddit.com/r/{sub}/hot/.rss")
        root = ET.fromstring(content)
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        posts = []
        for e in root.findall("atom:entry", ns)[:limit]:
            t = e.find("atom:title", ns)
            l = e.find("atom:link[@rel='alternate']", ns)
            title = (t.text or "").strip()
            link = l.attrib.get("href", "") if l is not None else ""
            if title and not title.startswith("["):  # skip mod posts
                posts.append({"title": title, "url": link})
        return posts
    except Exception as ex:
        return []   # silent on individual sub errors


def fetch_x_accounts(bucket_groups, batch_size=15, tweets_per_query=10):
    """
    Fetch tweets from X.com accounts using batched OR queries.
    batch_size=15 → 215 accounts / 15 = ~15 queries per sweep ($0.29/day at $0.02/query).
    One query like: from:karpathy OR from:sama OR from:ylecun ... returns up to tweets_per_query results.
    """
    import subprocess

    # Flatten all handles from this bucket's groups
    all_handles = []
    handle_to_group = {}
    for group, handles in bucket_groups.items():
        for h in handles:
            if h not in handle_to_group:  # dedupe
                all_handles.append(h)
                handle_to_group[h] = group

    # Split into batches
    batches = [all_handles[i:i+batch_size] for i in range(0, len(all_handles), batch_size)]

    items = []
    for batch in batches:
        query = " OR ".join(f"from:{h}" for h in batch)
        try:
            result = subprocess.run(
                ["xurl", "search", query, "-n", str(tweets_per_query)],
                capture_output=True, text=True, timeout=15
            )
            if result.returncode != 0:
                continue
            data = json.loads(result.stdout)

            # Build author_id → handle map from includes
            id_to_handle = {}
            for u in data.get("includes", {}).get("users", []):
                id_to_handle[u["id"]] = u.get("username", "unknown")

            for tweet in data.get("data", []):
                text = tweet.get("text", "").strip()
                if not text or text.startswith("RT "):
                    continue
                tid = tweet.get("id", "")
                author_id = tweet.get("author_id", "")
                handle = id_to_handle.get(author_id, "unknown")
                group = handle_to_group.get(handle, handle_to_group.get(
                    next((h for h in batch if h.lower() == handle.lower()), ""), "X"))
                items.append({
                    "title": text[:200],
                    "url": f"https://x.com/{handle}/status/{tid}",
                    "score": tweet.get("public_metrics", {}).get("like_count", 0),
                    "handle": handle,
                    "group": group,
                })
        except Exception:
            pass
        time.sleep(1.0)   # 1s between batch queries — stay well under rate limits
    return items


def fetch_hn(n_top=60):
    try:
        ids = json.loads(fetch_url("https://hacker-news.firebaseio.com/v0/topstories.json"))[:n_top]

        def fetch_item(sid):
            try:
                item = json.loads(fetch_url(
                    f"https://hacker-news.firebaseio.com/v0/item/{sid}.json", timeout=5))
                if item.get("title"):
                    return {
                        "title": item["title"],
                        "url": item.get("url", f"https://news.ycombinator.com/item?id={sid}"),
                        "score": item.get("score", 0),
                        "comments": item.get("descendants", 0),
                    }
            except:
                return None

        with ThreadPoolExecutor(max_workers=15) as ex:
            results = [r for r in ex.map(fetch_item, ids) if r]
        # Return all top + AI-filtered subset
        ai = [s for s in results if any(k in s["title"].lower() for k in AI_KW)]
        top = sorted(results, key=lambda x: x["score"], reverse=True)[:20]
        # Union, dedupe by title
        seen_t = set()
        combined = []
        for s in (ai + [x for x in top if x not in ai]):
            if s["title"] not in seen_t:
                seen_t.add(s["title"])
                combined.append(s)
        return combined
    except:
        return []


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    seen = load_seen_titles()
    now_ts = datetime.now(timezone.utc).isoformat()
    new_count = 0

    # HN — every run, parallel fetch
    hn_items = fetch_hn()
    for item in hn_items:
        key = item["title"].lower().strip()
        if key not in seen:
            seen.add(key)
            append_item({
                "source": "hackernews",
                "group": "HackerNews",
                "title": sanitize_text(item["title"]),
                "url": item["url"],
                "score": item.get("score", 0),
                "comments": item.get("comments", 0),
                "ts": now_ts,
            })
            new_count += 1

    # Reddit — full sweep, sequential with delay
    for group, subs in REDDIT_SUBS.items():
        for sub in subs:
            posts = fetch_reddit_sub(sub)
            for post in posts:
                key = post["title"].lower().strip()
                if key not in seen:
                    seen.add(key)
                    append_item({
                        "source": f"reddit/r/{sub}",
                        "group": group,
                        "title": sanitize_text(post["title"]),
                        "url": post["url"],
                        "score": 0,
                        "comments": 0,
                        "ts": now_ts,
                    })
                    new_count += 1
            time.sleep(0.5)

    # X.com — full sweep, batched OR queries (15 accounts/query)
    # Flatten X_GROUPS into a single group→handles dict for fetch_x_accounts
    all_x_groups = {}
    for bucket_groups in X_GROUPS.values():
        for group, handles in bucket_groups.items():
            all_x_groups.setdefault(group, []).extend(handles)
    x_items = fetch_x_accounts(all_x_groups, batch_size=15, tweets_per_query=10)
    for item in x_items:
        key = item["title"].lower().strip()
        if key not in seen:
            seen.add(key)
            append_item({
                "source": f"x.com/@{item['handle']}",
                "group": f"X — {item['group']}",
                "title": sanitize_text(item["title"]),
                "url": item["url"],
                "score": item.get("score", 0),
                "comments": 0,
                "ts": now_ts,
            })
            new_count += 1

    # Silent on success (empty stdout = no Telegram noise)
    sys.exit(0)



if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        # Print to stdout so cron alert fires
        print(f"[ai_news_collector FATAL] {e}")
        sys.exit(1)
