"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkPasscode, endSession, startSession } from "@/lib/room";

export type EnterState = { error?: string };

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

export async function enter(_: EnterState, formData: FormData): Promise<EnterState> {
  const h = await headers();
  const ip = h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  if (recentMisses(ip, now).length >= MAX_MISSES) {
    console.warn(`[room] locked out ${ip}`);
    return { error: "Too many attempts. Try again in 15 minutes." };
  }

  const code = String(formData.get("code") ?? "").slice(0, 64);
  if (!code || !checkPasscode(code)) {
    misses.set(ip, [...recentMisses(ip, now), now]);
    console.warn(`[room] wrong passcode from ${ip}`);
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { error: "That passcode didn’t work." };
  }

  misses.delete(ip);
  await startSession();
  console.info(`[room] unlocked from ${ip}`);
  redirect("/room");
}

export async function lock() {
  await endSession();
  redirect("/room");
}
