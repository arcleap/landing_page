import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { after, userAgent } from "next/server";
import { getInvite, log, type Entry, type Invite, type Visitor } from "@/lib/room-store";

// The private room at /room. Jin's own passcode opens it for live demos; each
// investor gets their own link and passcode (made on /room/admin), so their
// visits can be followed. This repo is public, so nothing secret lives in it.
// Everything comes from environment variables:
//
//   ROOM_SECRET          random key that signs sessions, 32+ characters
//                        (`openssl rand -hex 32`). Changing it signs everyone out.
//   ROOM_PASSCODE        the shared passcode, 10+ letters or digits. Case, spaces
//                        and dashes don't matter (`node scripts/room-code.mjs`
//                        makes one). Changing it signs out everyone who used it.
//   ROOM_ADMIN_PASSCODE  opens the activity page at /room/admin, 12+ letters or
//                        digits. Keep it apart from ROOM_PASSCODE.
//   ROOM_VIDEOS          JSON list of videos, each an unlisted YouTube video
//                        ("id") or a file in the private Blob store ("file"):
//                        `[{"title":"Demo one","file":"demos/one.mp4","note":"2 MIN"},
//                          {"title":"Demo two","id":"dQw4w9WgXcQ"}]`
//
// Vercel applies changed variables on the next deploy.

// `key` names the video in the activity log: its YouTube id or file path.
export type Video = { key: string; title: string; note?: string; youtube?: string; file?: string };

const COOKIE = "arcleap_room";
const ADMIN_COOKIE = "arcleap_room_admin";
const DEVICE_COOKIE = "arcleap_room_device";
const PATH = "/room";
const SESSION_DAYS = 30;
const ADMIN_DAYS = 14;
const MIN_PASSCODE = 10;
const MIN_ADMIN_PASSCODE = 12;

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

// The admin passcode, or null (activity page closed) if it's missing or too short.
function adminPasscode(): string | null {
  const passcode = normalize(process.env.ROOM_ADMIN_PASSCODE ?? "");
  if (passcode.length >= MIN_ADMIN_PASSCODE) return passcode;
  console.error(`[room] ROOM_ADMIN_PASSCODE is missing or shorter than ${MIN_ADMIN_PASSCODE} letters or digits; the activity page stays closed.`);
  return null;
}

const VIDEO_FILE = /^(?!.*\.\.)[\w./-]+\.(mp4|m4v|mov|webm)$/i;

export function videos(): Video[] {
  try {
    const list: unknown = JSON.parse(process.env.ROOM_VIDEOS ?? "[]");
    if (!Array.isArray(list)) return [];
    return list.flatMap((item): Video[] => {
      const { title, id, file, note } = (item ?? {}) as Record<string, unknown>;
      if (typeof title !== "string") return [];
      const extra = { title, note: typeof note === "string" ? note : undefined };
      if (typeof file === "string" && VIDEO_FILE.test(file)) return [{ key: file, file, ...extra }];
      if (typeof id === "string" && /^[\w-]{11}$/.test(id)) return [{ key: id, youtube: id, ...extra }];
      return [];
    });
  } catch {
    console.error("[room] ROOM_VIDEOS is not valid JSON.");
    return [];
  }
}

const mac = (key: string, text: string) => createHmac("sha256", key).update(text).digest();
const same = (a: Buffer, b: Buffer) => a.length === b.length && timingSafeEqual(a, b);
// A short fingerprint of a passcode, so changing it ends the sessions it opened.
const fingerprint = (key: string, passcode: string) => mac(key, `code:${passcode}`).subarray(0, 12).toString("base64url");
const inviteCode = (invite: Invite) => `invite:${invite.id}:${normalize(invite.code)}`;

// Compared as equal-length MACs in constant time, so timing says nothing about how close a guess was.
function matches(key: string, input: string, passcode: string) {
  return same(mac(key, `try:${normalize(input)}`), mac(key, `try:${passcode}`));
}

export function checkPasscode(input: string): boolean {
  const room = config();
  return room ? matches(room.key, input, room.passcode) : false;
}

// An investor's passcode only opens the room through their own link.
export function checkInvitePasscode(invite: Invite, input: string): boolean {
  const room = config();
  return room ? matches(room.key, input, normalize(invite.code)) : false;
}

export function checkAdminPasscode(input: string): boolean {
  const room = config();
  const passcode = adminPasscode();
  return room && passcode ? matches(room.key, input, passcode) : false;
}

type Session = { f: string; e: number; i?: string };

function sign(key: string, kind: string, session: Session) {
  const body = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${body}.${mac(key, `${kind}:${body}`).toString("base64url")}`;
}

// The session in a cookie if its signature holds and it hasn't expired.
function read(key: string, kind: string, raw: string | undefined): Session | null {
  const [body, signature] = raw?.split(".") ?? [];
  if (!body || !signature) return null;
  if (!same(Buffer.from(signature, "base64url"), mac(key, `${kind}:${body}`))) return null;
  try {
    const session = JSON.parse(Buffer.from(body, "base64url").toString()) as Session;
    return typeof session.e === "number" && session.e > Date.now() / 1000 ? session : null;
  } catch {
    return null;
  }
}

const cookieOptions = (days: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: PATH,
  maxAge: days * 86400,
});

// With no invite, the session comes from the shared passcode. Returns the browser's device id.
export async function startSession(invite?: Invite): Promise<string | undefined> {
  const room = config();
  if (!room) return;
  const session: Session = {
    f: fingerprint(room.key, invite ? inviteCode(invite) : room.passcode),
    e: Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400,
    ...(invite ? { i: invite.id } : {}),
  };
  const jar = await cookies();
  jar.set(COOKIE, sign(room.key, "session", session), cookieOptions(SESSION_DAYS));
  // Names this browser in the activity log, so a forwarded link shows up as a second device.
  const device = jar.get(DEVICE_COOKIE)?.value ?? randomBytes(9).toString("base64url");
  jar.set(DEVICE_COOKIE, device, cookieOptions(365));
  return device;
}

export async function endSession() {
  (await cookies()).set(COOKIE, "", { path: PATH, maxAge: 0 });
}

// Who opened the room: an invite's id, or null for the shared passcode.
export type RoomSession = { invite: string | null };

// The session if its cookie is signed and unexpired, and the passcode that
// opened it hasn't changed since. An investor's session also ends when their
// link is turned off or deleted.
export async function roomSession(): Promise<RoomSession | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  const room = raw ? config() : null;
  const session = room ? read(room.key, "session", raw) : null;
  if (!room || !session) return null;
  if (!session.i) return session.f === fingerprint(room.key, room.passcode) ? { invite: null } : null;
  const invite = await getInvite(session.i);
  if (!invite || invite.revoked || session.f !== fingerprint(room.key, inviteCode(invite))) return null;
  return { invite: invite.id };
}

// Who's asking, for the activity log: their browser's device cookie, browser
// and system, and the city Vercel places them in (no IP address is kept).
// Link previewers and other bots are flagged so they aren't logged as visits.
export async function visitor(): Promise<Visitor & { bot: boolean }> {
  const [jar, h] = await Promise.all([cookies(), headers()]);
  const d = jar.get(DEVICE_COOKIE)?.value;
  const agent = userAgent({ headers: h });
  const ua = [agent.browser.name, agent.os.name, agent.device.type].filter(Boolean).join(" · ");
  let city = h.get("x-vercel-ip-city") ?? "";
  try {
    city = decodeURIComponent(city);
  } catch {
    // Kept as sent.
  }
  const at = [city, h.get("x-vercel-ip-country-region"), h.get("x-vercel-ip-country")].filter(Boolean).join(", ");
  return {
    ...(d && /^[\w-]{6,24}$/.test(d) ? { d } : {}),
    ...(ua ? { ua } : {}),
    ...(at ? { at } : {}),
    bot: agent.isBot,
  };
}

export async function startAdminSession() {
  const room = config();
  const passcode = adminPasscode();
  if (!room || !passcode) return;
  const session: Session = { f: fingerprint(room.key, passcode), e: Math.floor(Date.now() / 1000) + ADMIN_DAYS * 86400 };
  (await cookies()).set(ADMIN_COOKIE, sign(room.key, "admin", session), cookieOptions(ADMIN_DAYS));
}

export async function endAdminSession() {
  (await cookies()).set(ADMIN_COOKIE, "", { path: PATH, maxAge: 0 });
}

// Jin's own browser, signed in to the activity page. Nothing it does in the room is logged.
export async function isAdmin(): Promise<boolean> {
  const raw = (await cookies()).get(ADMIN_COOKIE)?.value;
  const room = raw ? config() : null;
  const passcode = room ? adminPasscode() : null;
  if (!room || !passcode) return false;
  return read(room.key, "admin", raw)?.f === fingerprint(room.key, passcode);
}

// Logs what someone did in the room once the response has gone out, under
// `subject` (an invite id, or SHARED). Jin's own browser and bots aren't logged.
export async function track(subject: string, k: Entry["k"], extra?: Omit<Entry, "t" | "k">) {
  if (await isAdmin()) return;
  const { bot, ...who } = await visitor();
  if (bot) return;
  const t = Date.now();
  after(() => log(subject, { t, k, ...who, ...extra }));
}
