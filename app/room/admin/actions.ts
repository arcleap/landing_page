"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { checkAdminPasscode, endAdminSession, isAdmin, startAdminSession } from "@/lib/room";
import { attempt, type EnterState } from "@/lib/room-gate";
import { createInvite, deleteInvite, setRevoked } from "@/lib/room-store";

// Jin's activity page. Every action checks the admin session itself, since a
// server action can be called directly.

export async function enterAdmin(_: EnterState, formData: FormData): Promise<EnterState> {
  const failed = await attempt(formData, checkAdminPasscode);
  if (failed) return failed;
  await startAdminSession();
  redirect("/room/admin");
}

export async function lockAdmin() {
  await endAdminSession();
  redirect("/room/admin");
}

const field = (formData: FormData, name: string) => String(formData.get(name) ?? "").trim().slice(0, 80);

export async function createLink(formData: FormData) {
  if (!(await isAdmin())) return;
  const name = field(formData, "name");
  if (!name) return;
  const invite = await createInvite(name, field(formData, "firm") || undefined);
  if (invite) redirect(`/room/admin?new=${invite.id}`);
}

export async function setLinkOn(formData: FormData) {
  if (!(await isAdmin())) return;
  await setRevoked(field(formData, "id"), formData.get("on") !== "1");
  refresh();
}

export async function deleteLink(formData: FormData) {
  if (!(await isAdmin())) return;
  await deleteInvite(field(formData, "id"));
  redirect("/room/admin");
}
