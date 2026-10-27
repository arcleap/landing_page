import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoomShell } from "@/components/room/RoomShell";

export const metadata: Metadata = {
  title: "Private room — ArcLeap AI",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: null },
};

// An investor's own link, arcleap.ai/room/<id>, showing the Papermark link with
// that id (papermark.com/view/<id>) inside the room. It skips the room passcode
// on purpose: Papermark asks for whatever the link is set to (an email), plays
// the video, and records who watched, when and for how long; Jin reads that in
// Papermark.
export default async function PapermarkPage({ params }: PageProps<"/room/[id]">) {
  const { id } = await params;
  if (!/^[A-Za-z0-9_-]{10,64}$/.test(id)) notFound();

  return (
    <RoomShell aside="Confidential">
      <div className="room-viewer">
        <iframe
          src={`https://app.papermark.com/view/${id}/embed`}
          title="ArcLeap AI private room"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </RoomShell>
  );
}
