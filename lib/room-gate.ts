import { headers } from "next/headers";

// The passcode check behind both gates (the room, and Jin's activity page).

export type EnterState = { error?: string };

export const WRONG = "That passcode didn’t work.";

// Best-effort per-instance limit on wrong guesses. The real defence is length:
// at 1,000 guesses a second, a 12-character passcode takes millions of years.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_MISSES = 8;
const misses = new Map<string, number[]>();

function recentMisses(ip: string, now: number) {
  const list = (misses.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length) misses.set(ip, list);
  else misses.delete(ip);
  return list;
}

// Runs `check` on the submitted passcode unless this IP is locked out. Returns
// the error to show, or null when the passcode opened the gate. A wrong one
// waits a moment before answering.
export async function attempt(formData: FormData, check: (code: string) => boolean): Promise<EnterState | null> {
  const h = await headers();
  const ip = h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  if (recentMisses(ip, now).length >= MAX_MISSES) {
    console.warn(`[room] locked out ${ip}`);
    return { error: "Too many attempts. Try again in 15 minutes." };
  }
  const code = String(formData.get("code") ?? "").slice(0, 64);
  if (!code || !check(code)) {
    misses.set(ip, [...recentMisses(ip, now), now]);
    console.warn(`[room] wrong passcode from ${ip}`);
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { error: WRONG };
  }
  misses.delete(ip);
  console.info(`[room] unlocked from ${ip}`);
  return null;
}
