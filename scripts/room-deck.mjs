// Encrypts the investor deck for the private room. This repo is public, so only
// the ciphertext is committed (content/private/*.enc); the server decrypts it
// with ROOM_DECK_KEY, after checking the room passcode (lib/deck.ts).
// Usage: node scripts/room-deck.mjs <deck.html> [deck.pdf]
//
// The key is ROOM_DECK_KEY if set, else ~/.config/arcleap/room-deck.key. If
// neither exists, a new key is written to that file and never printed: copy it
// from there into Vercel as ROOM_DECK_KEY. Keep using the same key for later
// versions of the deck, then commit the new .enc files and deploy.
import { createCipheriv, createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const KEY_FILE = join(homedir(), ".config/arcleap/room-deck.key");
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "../content/private");

function loadKey() {
  let hex = process.env.ROOM_DECK_KEY?.trim();
  if (!hex && existsSync(KEY_FILE)) hex = readFileSync(KEY_FILE, "utf8").trim();
  if (!hex) {
    hex = randomBytes(32).toString("hex");
    mkdirSync(dirname(KEY_FILE), { recursive: true, mode: 0o700 });
    writeFileSync(KEY_FILE, `${hex}\n`, { mode: 0o600 });
    console.log(`New key written to ${KEY_FILE}. Add it to Vercel as ROOM_DECK_KEY.`);
  }
  if (!/^[0-9a-f]{64}$/i.test(hex)) throw new Error("ROOM_DECK_KEY must be 64 hex characters.");
  return Buffer.from(hex, "hex");
}

// Layout: 12-byte IV, 16-byte GCM tag, ciphertext. The file name is bound in as
// associated data, so the HTML and PDF can't be swapped for each other.
function encrypt(key, source, name) {
  const plain = readFileSync(source);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(name));
  const body = Buffer.concat([cipher.update(plain), cipher.final()]);
  writeFileSync(join(OUT_DIR, `${name}.enc`), Buffer.concat([iv, cipher.getAuthTag(), body]));
  const sha = createHash("sha256").update(plain).digest("hex").slice(0, 16);
  console.log(`${name}.enc  ${(plain.length / 1024).toFixed(0)} KB, source SHA-256 ${sha}`);
}

const [html, pdf] = process.argv.slice(2);
if (!html) {
  console.error("Usage: node scripts/room-deck.mjs <deck.html> [deck.pdf]");
  process.exit(1);
}
const key = loadKey();
mkdirSync(OUT_DIR, { recursive: true });
encrypt(key, html, "deck.html");
if (pdf) encrypt(key, pdf, "deck.pdf");
