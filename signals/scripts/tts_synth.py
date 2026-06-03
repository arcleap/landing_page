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
KOKORO_LANG = {"en": "en-us", "zh": "cmn"}                # ZH must be "cmn" (espeak-ng Mandarin), not "zh"
PIPER_VOICE = {"en": "en_US-lessac-medium", "zh": "zh_CN-huayan-medium"}


def kokoro_synth(text, lang, out_wav):
    import soundfile as sf
    from kokoro_onnx import Kokoro
    k = Kokoro(os.path.join(VOICES, "kokoro-v1.0.onnx"), os.path.join(VOICES, "voices-v1.0.bin"))
    samples, sr = k.create(text, voice=KOKORO_VOICE[lang], speed=1.0, lang=KOKORO_LANG[lang])
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
