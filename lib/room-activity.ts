import type { Video } from "@/lib/room";
import type { Activity, Entry, Play } from "@/lib/room-store";

// Turns one investor's raw log into what the activity page shows.

// Room activity with a gap longer than this counts as a new visit.
const VISIT_GAP_MS = 30 * 60 * 1000;
// A browser can fetch the deck or PDF twice in a row for one opening.
const OPEN_GAP_MS = 2 * 60 * 1000;

export type Status = "new" | "link" | "room" | "watched";

export type VideoSummary = { key: string; title: string; plays: number; watched: number; far: number; dur: number };

export type Summary = {
  status: Status;
  first?: number;
  last?: number;
  visits: number;
  videos: VideoSummary[];
  deck: number;
  pdf: number;
  devices: number;
  places: string[];
  fails: number;
};

const IN_ROOM = new Set<Entry["k"]>(["unlock", "visit", "deck", "pdf", "play"]);

// How many runs of times there are, splitting wherever the gap is over `gap`.
function runs(times: number[], gap: number) {
  return times.sort((a, b) => a - b).filter((t, i, all) => i === 0 || t - all[i - 1] > gap).length;
}

export function summarize({ log, plays }: Activity, list: Video[]): Summary {
  const room = log.filter((entry) => IN_ROOM.has(entry.k));
  const titles = new Map(list.map((video) => [video.key, video.title]));
  const byVideo = new Map<string, VideoSummary>();
  for (const play of plays) {
    const video = byVideo.get(play.v) ?? { key: play.v, title: titles.get(play.v) ?? "Removed video", plays: 0, watched: 0, far: 0, dur: 0 };
    video.plays += 1;
    video.watched += play.w;
    video.far = Math.max(video.far, play.far);
    video.dur = Math.max(video.dur, play.dur);
    byVideo.set(play.v, video);
  }
  const devices = new Set([...log.map((entry) => entry.d), ...plays.map((play) => play.d)].filter(Boolean));
  const places = [...new Set(log.map((entry) => entry.at).filter((at): at is string => Boolean(at)))];
  const times = [...log.map((entry) => entry.t), ...plays.map((play) => play.last)];

  return {
    status: plays.some((play) => play.w > 0) ? "watched" : room.length ? "room" : log.length ? "link" : "new",
    first: room.length ? Math.min(...room.map((entry) => entry.t)) : undefined,
    last: times.length ? Math.max(...times) : undefined,
    visits: runs(room.map((entry) => entry.t), VISIT_GAP_MS),
    // In the room's order, then any videos since removed from it.
    videos: [...byVideo.values()].sort((a, b) => order(list, a.key) - order(list, b.key)),
    deck: runs(log.filter((entry) => entry.k === "deck").map((entry) => entry.t), OPEN_GAP_MS),
    pdf: runs(log.filter((entry) => entry.k === "pdf").map((entry) => entry.t), OPEN_GAP_MS),
    devices: devices.size,
    places,
    fails: log.filter((entry) => entry.k === "fail").length,
  };
}

function order(list: Video[], key: string) {
  const n = list.findIndex((video) => video.key === key);
  return n < 0 ? list.length : n;
}

export const clock = (seconds: number) => {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export type Line = { t: number; text: string; device?: string; ua?: string; at?: string };

// The log as sentences, newest first. Browsers are lettered A, B, … in the
// order they first appear, so a second browser stands out.
export function timeline({ log, plays }: Activity, list: Video[]): Line[] {
  const titles = new Map(list.map((video) => [video.key, video.title]));
  const byId = new Map(plays.map((play) => [play.p, play]));
  const letters = new Map<string, string>();
  for (const entry of [...log].reverse()) {
    if (entry.d && !letters.has(entry.d)) letters.set(entry.d, String.fromCharCode(65 + (letters.size % 26)));
  }
  return log.map((entry) => ({
    t: entry.t,
    text: describe(entry, titles, byId.get(entry.p ?? "")),
    device: entry.d ? letters.get(entry.d) : undefined,
    ua: entry.ua,
    at: entry.at,
  }));
}

function describe(entry: Entry, titles: Map<string, string>, play?: Play) {
  switch (entry.k) {
    case "link":
      return "Opened the link";
    case "fail":
      return "Tried a wrong passcode";
    case "unlock":
      return "Entered the passcode";
    case "visit":
      return "Opened the room";
    case "deck":
      return "Opened the deck";
    case "pdf":
      return "Opened the PDF";
    case "play": {
      const title = `“${titles.get(entry.v ?? "") ?? "Removed video"}”`;
      if (!play || play.w < 1) return `Played ${title}`;
      const of = play.dur ? ` of ${clock(play.dur)}` : "";
      return `Played ${title}: watched ${clock(play.w)}, up to ${clock(play.far)}${of}`;
    }
  }
}
