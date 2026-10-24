import type { Metadata } from "next";
import { Gate } from "@/components/room/Gate";
import { RoomShell } from "@/components/room/RoomShell";
import { RoomVideo } from "@/components/room/RoomVideo";
import { hasDeck } from "@/lib/deck";
import { roomSession, track, videos } from "@/lib/room";
import { SHARED } from "@/lib/room-store";
import { enter, lock } from "./actions";

export const metadata: Metadata = {
  title: "Private room — ArcLeap AI",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: null },
};

export default async function RoomPage() {
  const session = await roomSession();
  if (!session) {
    return (
      <RoomShell aside="Locked">
        <div className="grid room-intro">
          <h1 className="room-title">Private.</h1>
          <div className="room-side">
            <p className="room-body">This page is locked.</p>
            <Gate action={enter} />
          </div>
        </div>
      </RoomShell>
    );
  }

  await track(session.invite ?? SHARED, "visit");
  const list = videos();

  return (
    <RoomShell aside="Confidential" lock={lock}>
      <div className="grid room-intro">
        <h1 className="room-title">Demos.</h1>
        {hasDeck() ? (
          // Plain links: these are route handlers, not pages.
          <div className="room-side room-deck">
            <a className="button" href="/room/deck">
              <span>Deck</span>
              <span aria-hidden="true">→</span>
            </a>
            <a className="text-link" href="/room/deck.pdf">
              <span>PDF</span>
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        ) : null}
      </div>
      {list.length ? (
        <ol className="room-videos">
          {list.map((video, i) => (
            <RoomVideo key={video.key} video={video} index={i} />
          ))}
        </ol>
      ) : (
        <p className="room-empty">Videos will appear here soon.</p>
      )}
    </RoomShell>
  );
}
