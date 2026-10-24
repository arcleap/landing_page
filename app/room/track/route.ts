import { after } from "next/server";
import { isAdmin, roomSession, videos, visitor } from "@/lib/room";
import { logBeat, SHARED, type Beat } from "@/lib/room-store";

// Playback beats from the room's videos (components/room/watch.ts). Only an
// unlocked room is heard, and it's always logged under its own session, so a
// beat can't be put on someone else's record.

const PLAY_ID = /^[a-z0-9]{6,24}$/;
const num = (value: unknown, max: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(Math.max(value, 0), max) : 0;

export async function POST(request: Request) {
  const done = new Response(null, { status: 204, headers: { "Cache-Control": "private, no-store" } });
  const session = await roomSession();
  if (!session || (await isAdmin())) return done;

  let body: Record<string, unknown>;
  try {
    body = JSON.parse((await request.text()).slice(0, 1000));
  } catch {
    return done;
  }
  const { k, v, p } = body;
  if ((k !== "play" && k !== "watch") || typeof p !== "string" || !PLAY_ID.test(p)) return done;
  if (!videos().some((video) => video.key === v)) return done;

  // Beats come every 10 seconds, but a tab in the background can hold them up for a while.
  const beat: Beat = { k, v: v as string, p, s: num(body.s, 600), far: num(body.far, 86400), dur: num(body.dur, 86400) };
  const { bot, ...who } = await visitor();
  if (bot) return done;
  after(() => logBeat(session.invite ?? SHARED, beat, who));
  return done;
}
