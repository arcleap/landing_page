import { randomInt } from "node:crypto";
import { Redis } from "@upstash/redis";

// Investor links and the room's activity log, kept in Upstash Redis (added
// from the Vercel Marketplace, which sets KV_REST_API_URL and KV_REST_API_TOKEN,
// or the UPSTASH_REDIS_REST_* pair). Without them the room still opens with
// the shared passcode; there are just no investor links and nothing is logged.
//
// Production and previews keep separate data, so trying a link on staging
// never shows up in the real log.

export type Invite = {
  id: string;
  token: string;
  code: string;
  name: string;
  firm?: string;
  created: number;
  revoked?: number;
};

// One entry in the log. `d` is the browser (device cookie), `ua` its browser
// and system, `at` the city Vercel places the visitor in.
export type Kind = "link" | "fail" | "unlock" | "visit" | "deck" | "pdf" | "play";
export type Entry = { t: number; k: Kind; d?: string; ua?: string; at?: string; v?: string; p?: string };
export type Visitor = Pick<Entry, "d" | "ua" | "at">;

// One play of one video, from pressing play until it ends or the page closes.
// `w` is seconds actually watched, `far` the furthest point reached by
// watching (not by skipping ahead), `dur` the video's length.
export type Play = { p: string; v: string; t: number; last: number; w: number; far: number; dur: number; d?: string };
export type Beat = { k: "play" | "watch"; v: string; p: string; s: number; far: number; dur: number };

// The shared passcode's visits are logged under this name instead of an invite id.
export const SHARED = "shared";

const PREFIX = process.env.VERCEL_ENV === "production" ? "room" : "room-test";
const LOG_LENGTH = 500;
// Far more plays than anyone makes; past this, new ones aren't kept.
const MAX_PLAYS = 1000;
const key = (...parts: string[]) => [PREFIX, ...parts].join(":");

let client: Redis | null | undefined;

function db(): Redis | null {
  if (client === undefined) {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    // Values are stored as JSON text and parsed here, so a passcode that looks like a number stays a string.
    client = url && token ? new Redis({ url, token, automaticDeserialization: false }) : null;
  }
  return client;
}

export const hasStore = () => db() !== null;

function parse<T>(text: string | null | undefined): T | null {
  try {
    return text ? (JSON.parse(text) as T) : null;
  } catch {
    return null;
  }
}

// No 0/O, 1/I/L or U/V, so codes read back unambiguously (as in scripts/room-code.mjs).
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTWXYZ";
const pick = (length: number) => Array.from({ length }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
const ID = /^[a-z0-9]{8,24}$/;

export async function getInvite(id: string): Promise<Invite | null> {
  const redis = db();
  if (!redis || !ID.test(id)) return null;
  try {
    return parse<Invite>(await redis.get<string>(key("invite", id)));
  } catch (error) {
    console.error(`[room] couldn't read invite ${id}: ${error instanceof Error ? error.message : error}`);
    return null;
  }
}

export async function inviteByToken(token: string): Promise<Invite | null> {
  const redis = db();
  if (!redis || !ID.test(token)) return null;
  try {
    const id = await redis.get<string>(key("token", token));
    return id ? getInvite(id) : null;
  } catch (error) {
    console.error(`[room] couldn't look up a link: ${error instanceof Error ? error.message : error}`);
    return null;
  }
}

// Newest first.
export async function listInvites(): Promise<Invite[]> {
  const redis = db();
  if (!redis) return [];
  const ids = await redis.zrange<string[]>(key("invites"), 0, -1, { rev: true });
  if (!ids.length) return [];
  const rows = await redis.mget<(string | null)[]>(...ids.map((id) => key("invite", id)));
  return rows.flatMap((row) => parse<Invite>(row) ?? []);
}

// A link (12 random letters and digits) and its own passcode, like K7Q2-M9XD-4TRP.
export async function createInvite(name: string, firm?: string): Promise<Invite | null> {
  const redis = db();
  if (!redis) return null;
  const invite: Invite = {
    id: pick(10).toLowerCase(),
    token: pick(12).toLowerCase(),
    code: pick(12).replace(/(.{4})(?=.)/g, "$1-"),
    name,
    ...(firm ? { firm } : {}),
    created: Date.now(),
  };
  await redis
    .multi()
    .set(key("invite", invite.id), JSON.stringify(invite))
    .set(key("token", invite.token), invite.id)
    .zadd(key("invites"), { score: invite.created, member: invite.id })
    .exec();
  return invite;
}

// A turned-off link stops opening the room at once, and signs out whoever it let in.
export async function setRevoked(id: string, revoked: boolean) {
  const redis = db();
  const invite = await getInvite(id);
  if (!redis || !invite) return;
  const next: Invite = { ...invite };
  if (revoked) next.revoked = Date.now();
  else delete next.revoked;
  await redis.set(key("invite", id), JSON.stringify(next));
}

export async function deleteInvite(id: string) {
  const redis = db();
  const invite = await getInvite(id);
  if (!redis || !invite) return;
  await redis
    .multi()
    .del(key("invite", id), key("token", invite.token), key("log", id), key("plays", id))
    .zrem(key("invites"), id)
    .exec();
}

// Logging never gets in the way of the page: failures are only reported.
// `t` defaults to now; pass the time of the request when logging after it.
export async function log(subject: string, entry: Omit<Entry, "t"> & { t?: number }) {
  const redis = db();
  if (!redis) return;
  try {
    const text = JSON.stringify({ t: Date.now(), ...entry });
    await redis.multi().lpush(key("log", subject), text).ltrim(key("log", subject), 0, LOG_LENGTH - 1).exec();
  } catch (error) {
    console.error(`[room] couldn't log ${entry.k}: ${error instanceof Error ? error.message : error}`);
  }
}

// The first beat of a play also goes in the log; later beats add to its watched time.
export async function logBeat(subject: string, beat: Beat, visitor: Visitor) {
  const redis = db();
  if (!redis) return;
  try {
    const now = Date.now();
    const plays = key("plays", subject);
    const prev = parse<Play>(await redis.hget<string>(plays, beat.p));
    if (prev ? prev.v !== beat.v : (await redis.hlen(plays)) >= MAX_PLAYS) return;
    const play: Play = prev ?? { p: beat.p, v: beat.v, t: now, last: now, w: 0, far: 0, dur: 0, ...(visitor.d ? { d: visitor.d } : {}) };
    play.last = now;
    play.w = Math.round((play.w + beat.s) * 10) / 10;
    play.far = Math.max(play.far, beat.far);
    if (beat.dur > 0) play.dur = beat.dur;
    await redis.hset(plays, { [beat.p]: JSON.stringify(play) });
    if (!prev) await log(subject, { k: "play", v: beat.v, p: beat.p, ...visitor });
  } catch (error) {
    console.error(`[room] couldn't log a play: ${error instanceof Error ? error.message : error}`);
  }
}

export type Activity = { log: Entry[]; plays: Play[] };

// Each subject's log (newest first) and plays (oldest first).
export async function activity(subjects: string[]): Promise<Map<string, Activity>> {
  const redis = db();
  const result = new Map<string, Activity>();
  if (!redis || !subjects.length) return result;
  const pipe = redis.pipeline();
  for (const subject of subjects) {
    pipe.lrange(key("log", subject), 0, -1);
    pipe.hgetall(key("plays", subject));
  }
  const rows = await pipe.exec<unknown[]>();
  subjects.forEach((subject, n) => {
    const lines = (rows[2 * n] as string[] | null) ?? [];
    const plays = Object.values((rows[2 * n + 1] as Record<string, string> | null) ?? {});
    result.set(subject, {
      log: lines.flatMap((line) => parse<Entry>(line) ?? []),
      plays: plays.flatMap((text) => parse<Play>(text) ?? []).sort((a, b) => a.t - b.t),
    });
  });
  return result;
}
