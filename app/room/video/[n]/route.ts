import { issueSignedToken, presignUrl } from "@vercel/blob";
import { roomSession, videos } from "@/lib/room";

// A room video kept in the private Vercel Blob store (a "file" in ROOM_VIDEOS).
// An unlocked room is sent on to a signed link that expires after a few hours;
// anyone else gets nothing. So the page's own video address only plays with
// the room's cookie, and a copied blob link soon stops working.
// The store's credentials come from connecting it to the project in Vercel.

const VALID_MS = 3 * 60 * 60 * 1000;
const PRIVATE = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow, noarchive" };

// Each file's signed token is reused while it has over an hour to run.
const tokens = new Map<string, Awaited<ReturnType<typeof issueSignedToken>>>();

async function signedUrl(pathname: string) {
  let token = tokens.get(pathname);
  if (!token || token.validUntil - Date.now() < 60 * 60 * 1000) {
    token = await issueSignedToken({ pathname, operations: ["get"], validUntil: Date.now() + VALID_MS });
    tokens.set(pathname, token);
  }
  const { presignedUrl } = await presignUrl(token, { operation: "get", pathname, access: "private" });
  return presignedUrl;
}

export async function GET(_: Request, { params }: RouteContext<"/room/video/[n]">) {
  const { n } = await params;
  const video = videos()[Number(n) - 1];
  if (!(await roomSession()) || !video?.file) return new Response(null, { status: 404, headers: PRIVATE });
  try {
    return new Response(null, { status: 302, headers: { ...PRIVATE, Location: await signedUrl(video.file) } });
  } catch (error) {
    console.error(`[room] couldn't sign ${video.file}: ${error instanceof Error ? error.message : error}`);
    return new Response(null, { status: 503, headers: PRIVATE });
  }
}
