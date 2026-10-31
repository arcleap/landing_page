import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, isValidSession } from "@/lib/room";

// arcleap.ai/room/studio: the EDP Studio, served from its own computer, behind the room's passcode.
// Once the room's session checks out, the request goes on to the Studio with STUDIO_KEY, which only this proxy
// knows; the Studio answers nothing without it. The room's cookie stays here. Like the room, nothing secret lives
// in this repo; both come from environment variables:
//
//   STUDIO_ORIGIN  the Studio's HTTPS address, e.g. https://<machine>.<tailnet>.ts.net (no trailing slash)
//   STUDIO_KEY     32+ characters, the same as the Studio's EDP_HOSTED_KEY
//
// Without both (or without the room's session), /room/studio sends people to /room.
const PREFIX = "/room/studio";

export const config = { matcher: ["/room/studio", "/room/studio/:path*"] };

export function proxy(request: NextRequest) {
  const origin = process.env.STUDIO_ORIGIN?.trim().replace(/\/+$/, "") ?? "";
  const key = process.env.STUDIO_KEY?.trim() ?? "";
  if (!origin.startsWith("https://") || key.length < 32 || !isValidSession(request.cookies.get(COOKIE)?.value)) {
    return NextResponse.redirect(new URL("/room", request.url));
  }
  const { pathname, search } = request.nextUrl;
  const headers = new Headers(request.headers);
  headers.delete("cookie");
  headers.set("x-edp-key", key);
  headers.set("x-edp-prefix", PREFIX);
  const target = new URL((pathname.slice(PREFIX.length) || "/") + search, origin);
  return NextResponse.rewrite(target, { request: { headers } });
}
