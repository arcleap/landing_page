import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// The private room at /room: one passcode, kept by Jin, for showing demos live.
// This repo is public, so nothing secret lives in it. Everything comes from
// environment variables:
//
//   ROOM_SECRET    random key that signs sessions, 32+ characters
//                  (`openssl rand -hex 32`). Changing it signs everyone out.
//   ROOM_PASSCODE  the passcode, 10+ letters or digits. Case, spaces and dashes
//                  don't matter (`node scripts/room-code.mjs` makes one).
//                  Changing it signs everyone out.
//   ROOM_VIDEOS    JSON list of unlisted YouTube videos:
//                  `[{"title":"Demo one","id":"dQw4w9WgXcQ","note":"2 MIN"}]`
//
// Vercel applies changed variables on the next deploy.

export type Video = { title: string; id: string; note?: string };

const COOKIE = "arcleap_room";
const PATH = "/room";
const SESSION_DAYS = 30;
const MIN_PASSCODE = 10;

const normalize = (code: string) => code.toUpperCase().replace(/[^A-Z0-9]/g, "");

// The signing key and passcode, or null (room closed) if either is missing or too short.
function config(): { key: string; passcode: string } | null {
  const key = process.env.ROOM_SECRET?.trim() ?? "";
  const passcode = normalize(process.env.ROOM_PASSCODE ?? "");
  if (key.length < 32) {
    console.error("[room] ROOM_SECRET is missing or shorter than 32 characters; the room stays closed.");
    return null;
  }
  if (passcode.length < MIN_PASSCODE) {
    console.error(`[room] ROOM_PASSCODE is missing or shorter than ${MIN_PASSCODE} letters or digits; the room stays closed.`);
    return null;
  }
  return { key, passcode };
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
// A short fingerprint of the passcode, so changing it ends existing sessions.
const fingerprint = (key: string, passcode: string) => mac(key, `code:${passcode}`).subarray(0, 12).toString("base64url");

// Compared as equal-length MACs in constant time, so timing says nothing about how close a guess was.
export function checkPasscode(input: string): boolean {
  const room = config();
  if (!room) return false;
  return same(mac(room.key, `try:${normalize(input)}`), mac(room.key, `try:${room.passcode}`));
}

type Session = { f: string; e: number };

export async function startSession() {
  const room = config();
  if (!room) return;
  const session: Session = {
    f: fingerprint(room.key, room.passcode),
    e: Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400,
  };
  const body = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = mac(room.key, `session:${body}`).toString("base64url");
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

// True if the session cookie is signed, unexpired, and the passcode hasn't changed since.
export async function isUnlocked(): Promise<boolean> {
  const raw = (await cookies()).get(COOKIE)?.value;
  const room = raw ? config() : null;
  if (!raw || !room) return false;
  const [body, signature] = raw.split(".");
  if (!body || !signature) return false;
  if (!same(Buffer.from(signature, "base64url"), mac(room.key, `session:${body}`))) return false;
  try {
    const session = JSON.parse(Buffer.from(body, "base64url").toString()) as Session;
    return (
      typeof session.e === "number" &&
      session.e > Date.now() / 1000 &&
      session.f === fingerprint(room.key, room.passcode)
    );
  } catch {
    return false;
  }
}
