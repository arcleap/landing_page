import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Gate } from "@/components/room/Gate";
import { RoomShell } from "@/components/room/RoomShell";
import { roomSession, track } from "@/lib/room";
import { inviteByToken } from "@/lib/room-store";
import { enter } from "../../actions";

export const metadata: Metadata = {
  title: "Private room — ArcLeap AI",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: null },
};

// An investor's own link to the room. It opens only with the passcode made for
// it, so passing the room on means passing on both, and it's still their link
// in the log.
export default async function InvitePage({ params }: PageProps<"/room/i/[token]">) {
  const { token } = await params;
  const invite = await inviteByToken(token);

  if (!invite || invite.revoked) {
    return (
      <RoomShell aside="Locked">
        <div className="grid room-intro">
          <h1 className="room-title">Private.</h1>
          <p className="room-body">This link isn’t active anymore.</p>
        </div>
      </RoomShell>
    );
  }

  // Already in through this link: straight to the room.
  if ((await roomSession())?.invite === invite.id) redirect("/room");
  await track(invite.id, "link");

  return (
    <RoomShell aside="Locked">
      <div className="grid room-intro">
        <h1 className="room-title">Private.</h1>
        <div className="room-side">
          <p className="room-body">This page is locked.</p>
          <Gate action={enter} invite={invite.token} />
        </div>
      </div>
    </RoomShell>
  );
}
