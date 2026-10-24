"use server";

import { redirect } from "next/navigation";
import { checkInvitePasscode, checkPasscode, endSession, startSession, track } from "@/lib/room";
import { attempt, WRONG, type EnterState } from "@/lib/room-gate";
import { inviteByToken, SHARED } from "@/lib/room-store";

// From /room with the shared passcode, or from an investor's link with theirs.
export async function enter(_: EnterState, formData: FormData): Promise<EnterState> {
  const token = String(formData.get("invite") ?? "");
  const invite = token ? await inviteByToken(token) : null;
  if (token && (!invite || invite.revoked)) return { error: "This link isn’t active anymore." };

  const failed = await attempt(formData, (code) => (invite ? checkInvitePasscode(invite, code) : checkPasscode(code)));
  if (failed) {
    if (invite && failed.error === WRONG) await track(invite.id, "fail");
    return failed;
  }
  const device = await startSession(invite ?? undefined);
  await track(invite?.id ?? SHARED, "unlock", device ? { d: device } : undefined);
  redirect("/room");
}

export async function lock() {
  await endSession();
  redirect("/room");
}
