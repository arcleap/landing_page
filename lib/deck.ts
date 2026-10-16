import { createDecipheriv } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { isUnlocked } from "@/lib/room";

// The investor deck in the private room, at /room/deck and /room/deck.pdf.
// This repo is public, so only AES-256-GCM ciphertext is committed
// (content/private/*.enc, made by `node scripts/room-deck.mjs`). The key is
// one more environment variable:
//
//   ROOM_DECK_KEY  64 hex characters; the script makes it on its first run.

export type DeckFile = "deck.html" | "deck.pdf";

const TYPES: Record<DeckFile, Record<string, string>> = {
  "deck.html": { "Content-Type": "text/html; charset=utf-8" },
  "deck.pdf": {
    "Content-Type": "application/pdf",
    "Content-Disposition": 'inline; filename="ArcLeap-AI-Investor-Deck.pdf"',
  },
};

// Sent on every deck response, including the redirect, so nothing in between keeps a copy.
const PRIVATE = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

function deckKey(): Buffer | null {
  const hex = process.env.ROOM_DECK_KEY?.trim() ?? "";
  return /^[0-9a-f]{64}$/i.test(hex) ? Buffer.from(hex, "hex") : null;
}

export const hasDeck = () => deckKey() !== null;

// The decrypted file, or null if the key is missing or wrong or the file is absent.
async function readDeck(name: DeckFile): Promise<Buffer | null> {
  const key = deckKey();
  if (!key) {
    console.error("[room] ROOM_DECK_KEY is missing or not 64 hex characters; the deck stays closed.");
    return null;
  }
  try {
    const data = await readFile(path.join(process.cwd(), "content/private", `${name}.enc`));
    const decipher = createDecipheriv("aes-256-gcm", key, data.subarray(0, 12));
    decipher.setAAD(Buffer.from(name));
    decipher.setAuthTag(data.subarray(12, 28));
    return Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]);
  } catch (error) {
    console.error(`[room] couldn't open ${name}: ${error instanceof Error ? error.message : error}`);
    return null;
  }
}

// Visitors who haven't unlocked the room are sent back to it without a byte of the deck.
export async function serveDeck(name: DeckFile): Promise<Response> {
  if (!(await isUnlocked())) {
    return new Response(null, { status: 303, headers: { ...PRIVATE, Location: "/room" } });
  }
  const file = await readDeck(name);
  if (!file) {
    return new Response("The deck isn’t available right now.", {
      status: 503,
      headers: { ...PRIVATE, "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return new Response(new Uint8Array(file), { headers: { ...PRIVATE, ...TYPES[name] } });
}
