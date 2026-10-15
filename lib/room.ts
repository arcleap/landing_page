import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// The private room at /room. This repo is public, so nothing secret lives in it:
// codes, video IDs and the signing key come from environment variables.
//
//   ROOM_SECRET  random key that signs sessions, 32+ characters
//                (`openssl rand -hex 32`). Changing it signs everyone out.
//   ROOM_CODES   one code per guest, `Name=CODE` pairs separated by commas:
//                `Firm A=K7Q2-M9XD-4TRP, Firm B=H3NW-8CJZ-QL6V`.
//                Case, spaces and dashes don't matter. Codes need 10+ letters
//                or digits (`node scripts/room-code.mjs` makes one). Removing
//                or changing a guest's code signs that guest out.
//   ROOM_VIDEOS  JSON list of unlisted YouTube videos:
//                `[{"title":"Demo one","id":"dQw4w9WgXcQ","note":"2 min"}]`
//
// Vercel applies changed variables on the next deploy.

export type Video = { title: string; id: string; note?: string };
type Guest = { name: string; code: string };

const COOKIE = "arcleap_room";
const PATH = "/room";
const SESSION_DAYS = 7;
const MIN_CODE = 10;

const normalize = (code: string) => code.toUpperCase().replace(/[^A-Z0-9]/g, "");

function secret(): string | null {
  const value = process.env.ROOM_SECRET?.trim() ?? "";
  if (value.length < 32) {
    console.error("[room] ROOM_SECRET is missing or shorter than 32 characters; the room stays closed.");
    return null;
  }
  return value;
}

function guests(): Guest[] {
  const out: Guest[] = [];
  for (const pair of (process.env.ROOM_CODES ?? "").split(",")) {
    const at = pair.lastIndexOf("=");
    if (at < 0) continue;
    const name = pair.slice(0, at).trim();
    const code = normalize(pair.slice(at + 1));
    if (!name) continue;
    if (code.length < MIN_CODE) {
      console.error(`[room] code for "${name}" is shorter than ${MIN_CODE} characters; ignored.`);
      continue;
    }
    out.push({ name, code });
  }
  return out;
}

export function videos(): Video[] {
  try {
    const list: unknown = JSON.parse(process.env.ROOM_VIDEOS ?? "[]");
    if (!Array.isArray(list)) return [];
    return list.flatMap((item) => {
      const { title, id, note } = (item ?? {}) as Record<string, unknown>;
      if (typeof title !== "string" || typeof id !== "string" || !/^[\w-]{11}$/.test(id)) return [];
      return [{ title, id, note: typeof note === "string" ? note : undefined }];
    });
  } catch {
    console.error("[room] ROOM_VIDEOS is not valid JSON.");
    return [];
  }
}

const mac = (key: string, text: string) => createHmac("sha256", key).update(text).digest();
const same = (a: Buffer, b: Buffer) => a.length === b.length && timingSafeEqual(a, b);
// A short fingerprint of a guest's code, so changing the code ends their sessions.
const fingerprint = (key: string, guest: Guest) => mac(key, `code:${guest.code}`).subarray(0, 12).toString("base64url");

// Compares against every guest without stopping early, so timing says nothing about which part matched.
export function match(input: string): string | null {
  const key = secret();
  if (!key) return null;
  const given = mac(key, `try:${normalize(input)}`);
  let found: string | null = null;
  for (const guest of guests()) {
    if (same(given, mac(key, `try:${guest.code}`)) && !found) found = guest.name;
  }
  return found;
}

type Session = { n: string; f: string; e: number };

export async function startSession(name: string) {
  const key = secret();
  const guest = guests().find((g) => g.name === name);
  if (!key || !guest) return;
  const session: Session = {
    n: guest.name,
    f: fingerprint(key, guest),
    e: Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400,
  };
  const body = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = mac(key, `session:${body}`).toString("base64url");
  (await cookies()).set(COOKIE, `${body}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: PATH,
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function endSession() {
  (await cookies()).set(COOKIE, "", { path: PATH, maxAge: 0 });
}

// The guest's name if the session cookie is signed, unexpired, and their code is unchanged.
export async function currentGuest(): Promise<string | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  const key = raw ? secret() : null;
  if (!raw || !key) return null;
  const [body, signature] = raw.split(".");
  if (!body || !signature) return null;
  if (!same(Buffer.from(signature, "base64url"), mac(key, `session:${body}`))) return null;
  try {
    const session = JSON.parse(Buffer.from(body, "base64url").toString()) as Session;
    if (typeof session.e !== "number" || session.e < Date.now() / 1000) return null;
    const guest = guests().find((g) => g.name === session.n);
    return guest && fingerprint(key, guest) === session.f ? guest.name : null;
  } catch {
    return null;
  }
}
