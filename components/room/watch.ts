// Follows one video's playback and reports it to /room/track: a "play" beat
// when a play starts, then "watch" beats with the seconds watched since the
// last one (every 10 seconds while playing, and on pause, end or leaving the
// page). Only steady playback counts as watched; skipping ahead doesn't.

const BEAT_MS = 10_000;
// Position jumps larger than this between two readings are seeks, not watching.
const MAX_STEP = 2.5;

export type Watch = {
  playing(position: number): void;
  time(position: number): void;
  paused(): void;
  ended(): void;
  close(): void;
};

const playId = () => Array.from(crypto.getRandomValues(new Uint8Array(9)), (b) => (b % 36).toString(36)).join("");

function send(body: object) {
  const text = JSON.stringify(body);
  try {
    if (navigator.sendBeacon?.("/room/track", text)) return;
  } catch {
    // Fall through to fetch.
  }
  fetch("/room/track", { method: "POST", body: text, keepalive: true }).catch(() => {});
}

export function watch(video: string, duration: () => number): Watch {
  let play: string | null = null;
  let last: number | null = null;
  let watched = 0;
  let far = 0;
  let timer: ReturnType<typeof setInterval> | undefined;

  const beat = (k: "play" | "watch") => {
    if (!play) return;
    send({ k, v: video, p: play, s: Math.round(watched * 10) / 10, far: Math.round(far * 10) / 10, dur: Math.round(duration() || 0) });
    watched = 0;
  };
  const flush = () => {
    if (watched > 0) beat("watch");
  };
  const stop = () => {
    clearInterval(timer);
    timer = undefined;
    last = null;
  };
  const onHide = () => {
    if (document.visibilityState === "hidden") flush();
  };

  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", onHide);

  return {
    playing(position) {
      if (!play) {
        play = playId();
        far = position;
        beat("play");
      }
      last = position;
      timer ??= setInterval(flush, BEAT_MS);
    },
    time(position) {
      if (last !== null) {
        const step = position - last;
        if (step > 0 && step <= MAX_STEP) {
          watched += step;
          far = Math.max(far, position);
        }
      }
      if (timer) last = position;
    },
    paused() {
      flush();
      stop();
    },
    ended() {
      flush();
      stop();
      play = null;
    },
    close() {
      flush();
      stop();
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onHide);
    },
  };
}
