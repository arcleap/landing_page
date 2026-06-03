#!/usr/bin/env python3
"""TTS backend — run with the TTS venv python (~/.signals-tts/bin/python).

Expressive local synthesis via Kokoro (EN + ZH); automatic Piper fallback if Kokoro
or its g2p is unavailable. Reads plain text from --in, writes a WAV to --out.

Usage: python tts_synth.py --lang en --in text.txt --out out.wav
"""
import os
os.environ.setdefault("OMP_NUM_THREADS", str(os.cpu_count() or 4))  # use all cores (Kokoro is CPU-bound)

import argparse, sys

VOICES = os.path.expanduser(os.environ.get("SIGNALS_TTS_VOICES", "~/.signals-tts-voices"))
KOKORO_VOICE = {"en": "am_michael", "zh": "zm_yunyang"}   # EN: Michael; ZH: Yunyang (Mandarin news-anchor)
KOKORO_LANG = {"en": "en-us"}                             # EN via espeak; ZH uses misaki phonemes (below)
PIPER_VOICE = {"en": "en_US-lessac-medium", "zh": "zh_CN-huayan-medium"}

_ZH_G2P = None  # misaki Mandarin g2p (jieba dict load ~1s)
_EN_G2P = None  # misaki English g2p for embedded Latin terms (OpenAI, GPT-5)


def _get_g2p():
    global _ZH_G2P, _EN_G2P
    if _ZH_G2P is None:
        from misaki import zh
        _ZH_G2P = zh.ZHG2P()
        try:                       # misaki 0.9.4's en_callable routing is unreliable,
            from misaki import en  # so we phonemize Latin runs ourselves (below).
            _EN_G2P = en.G2P(british=False)
        except Exception:
            _EN_G2P = None
    return _ZH_G2P, _EN_G2P


def _phonemize_sentence(sentence):
    """Mix CJK + Latin within one sentence: Mandarin via misaki ZH, embedded English/
    numbers via misaki EN. Both emit Kokoro-compatible phonemes, so we concatenate."""
    import re
    zh_g2p, en_g2p = _get_g2p()
    out = []
    for seg in re.findall(r'[一-鿿]+|[^一-鿿]+', sentence):
        if re.search(r'[一-鿿]', seg):
            ph, _ = zh_g2p(seg)
        elif en_g2p and re.search(r'[A-Za-z0-9]', seg):
            r = en_g2p(seg)
            ph = r[0] if isinstance(r, tuple) else r
        else:
            ph = seg.strip()       # punctuation / spaces — keep for prosody
        ph = (ph or "").strip()
        if ph:
            out.append(ph)
    return " ".join(out)


def _zh_phonemes(text):
    """Yield one Kokoro phoneme string per sentence (chunked to stay within model length).
    misaki gives the alphabet Kokoro's zh voices were trained on; espeak 'cmn' would
    produce Mandarin-sounding-but-wrong phonemes."""
    import re
    for chunk in re.split(r'(?<=[。！？!?；;\n])', text):
        chunk = chunk.strip()
        if not chunk:
            continue
        ph = _phonemize_sentence(chunk)
        if ph:
            yield ph


def kokoro_synth(text, lang, out_wav):
    import numpy as np, soundfile as sf
    from kokoro_onnx import Kokoro
    k = Kokoro(os.path.join(VOICES, "kokoro-v1.0.onnx"), os.path.join(VOICES, "voices-v1.0.bin"))
    voice = KOKORO_VOICE[lang]
    if lang == "zh":
        sr, parts = 24000, []
        for ph in _zh_phonemes(text):
            s, sr = k.create(ph, voice=voice, speed=1.0, is_phonemes=True)
            parts.append(s)
            parts.append(np.zeros(int(sr * 0.18), dtype=s.dtype))  # natural inter-sentence pause
        if not parts:
            raise RuntimeError("no ZH phonemes produced")
        samples = np.concatenate(parts)
    else:
        samples, sr = k.create(text, voice=voice, speed=1.0, lang=KOKORO_LANG[lang])
    sf.write(out_wav, samples, sr)


def piper_synth(text, lang, out_wav):
    import subprocess
    subprocess.run([sys.executable, "-m", "piper", "-m", PIPER_VOICE[lang], "--data-dir", VOICES,
                    "-f", out_wav, "--sentence-silence", "0.45"],
                   input=text, text=True, check=True, capture_output=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", required=True, choices=["en", "zh"])
    ap.add_argument("--in", dest="inp", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    text = open(a.inp, encoding="utf-8").read().strip()
    if not text:
        sys.exit(2)
    try:
        kokoro_synth(text, a.lang, a.out)
        print(f"[tts_synth] kokoro {a.lang} ok")
    except Exception as e:
        print(f"[tts_synth] kokoro {a.lang} failed ({e}); falling back to piper", file=sys.stderr)
        piper_synth(text, a.lang, a.out)
        print(f"[tts_synth] piper {a.lang} ok")


if __name__ == "__main__":
    main()
