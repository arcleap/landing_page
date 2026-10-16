import { serveDeck } from "@/lib/deck";

export function GET() {
  return serveDeck("deck.pdf");
}
