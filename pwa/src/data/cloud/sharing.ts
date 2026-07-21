import type { Member } from "../types";
import type { Role } from "../permissions";
import { getSupabase } from "./client";

// Sharing adapter (Phase 4). All calls are RLS-scoped; write operations only
// succeed for the list owner (members management) per 0002_sharing.sql.

function token(): string {
  return (
    Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10)
  );
}

export interface InviteResult {
  token: string;
  url: string;
}

// Owner creates an invite; returns a shareable join link.
export async function createInvite(
  listId: string,
  role: Role,
  invitedByUserId: string,
  email?: string
): Promise<InviteResult> {
  const sb = getSupabase();
  if (!sb) throw new Error("Cloud backend is not configured.");
  const t = token();
  const { error } = await sb.from("invitations").insert({
    list_id: listId,
    role,
    invite_token: t,
    invited_by_user_id: invitedByUserId,
    invited_email: email?.trim() ? email.trim().toLowerCase() : null,
  });
  if (error) throw new Error(error.message);
  const base = `${window.location.origin}${import.meta.env.BASE_URL}`.replace(/\/$/, "");
  return { token: t, url: `${base}/join/${t}` };
}

// Invited user accepts; returns the list id they joined.
export async function acceptInvite(inviteToken: string): Promise<string> {
  const sb = getSupabase();
  if (!sb) throw new Error("Cloud backend is not configured.");
  const { data, error } = await sb.rpc("accept_invitation", { p_token: inviteToken });
  if (error) throw new Error(error.message);
  return data as string;
}

export async function listMembers(listId: string): Promise<Member[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("list_members")
    .select("user_id,role,display_name,email")
    .eq("list_id", listId);
  return ((data ?? []) as {
    user_id: string;
    role: string;
    display_name: string | null;
    email: string | null;
  }[]).map((m) => ({
    userId: m.user_id,
    role: m.role as Role,
    displayName: m.display_name ?? undefined,
    email: m.email ?? undefined,
  }));
}

export async function updateMemberRole(listId: string, userId: string, role: Role): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb
    .from("list_members")
    .update({ role })
    .eq("list_id", listId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function removeMember(listId: string, userId: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb
    .from("list_members")
    .delete()
    .eq("list_id", listId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}
