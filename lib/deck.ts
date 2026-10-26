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

// The site's light/dark switch, added to the deck as it's served so the vault
// file stays as it is (the deck already themes itself from data-theme on
// <html>). It shares the site's stored choice ("arcleap-theme", as in
// ThemeToggle) and otherwise starts light, whatever the system setting.
const THEME_HEAD =
  `<script>try{document.documentElement.dataset.theme=localStorage.getItem("arcleap-theme")==="dark"?"dark":"light"}catch(e){document.documentElement.dataset.theme="light"}</script>` +
  `<style>#theme svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round}#theme .sun,:root[data-theme="dark"] #theme .moon{display:none}:root[data-theme="dark"] #theme .sun{display:block}</style>`;

const THEME_BUTTON =
  `<button type="button" id="theme" aria-label="Toggle light and dark theme" title="Toggle light and dark theme">` +
  `<svg class="moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 15.2A8.4 8.4 0 0 1 8.8 4 8.4 8.4 0 1 0 20 15.2Z"/></svg>` +
  `<svg class="sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.5"/><path d="M12 2.5v2M12 19.5v2M4.5 12h-2M21.5 12h-2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4"/></svg>` +
  `</button>` +
  `<script>document.getElementById("theme").addEventListener("click",function(){var d=document.documentElement,t=d.dataset.theme==="dark"?"light":"dark";d.dataset.theme=t;try{localStorage.setItem("arcleap-theme",t)}catch(e){}})</script>`;

// The switch goes last in the deck's top-bar controls, after Full screen (or
// after Next if a later deck drops Full screen). Without those, the deck still
// starts light, just without the switch.
function withTheme(html: string): string {
  const head = /<head\b[^>]*>/i;
  if (!head.test(html)) return html;
  html = html.replace(head, (tag) => tag + THEME_HEAD);
  for (const id of ["fs", "next"]) {
    const control = new RegExp(`<button\\b[^>]*\\bid="${id}"[^>]*>[\\s\\S]*?</button>`);
    if (control.test(html)) return html.replace(control, (tag) => tag + THEME_BUTTON);
  }
  return html;
}

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
  const body = name === "deck.html" ? withTheme(file.toString("utf8")) : new Uint8Array(file);
  return new Response(body, { headers: { ...PRIVATE, ...TYPES[name] } });
}
