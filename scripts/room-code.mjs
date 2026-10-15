// Prints a fresh passcode for the private room, e.g. `K7Q2-M9XD-4TRP`.
// Usage: node scripts/room-code.mjs [count]
import { randomInt } from "node:crypto";

// No 0/O, 1/I/L or U/V, so codes read back unambiguously.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTWXYZ";
const count = Number(process.argv[2] ?? 1);

for (let n = 0; n < count; n++) {
  const chars = Array.from({ length: 12 }, () => ALPHABET[randomInt(ALPHABET.length)]);
  console.log(chars.join("").replace(/(.{4})(?=.)/g, "$1-"));
}
