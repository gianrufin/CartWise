import { getSupabase } from "./client";

// Item photos adapter (Phase 11). Objects live under "<listId>/..." in the
// private 'item-photos' bucket, so storage RLS scopes access to list members.

const BUCKET = "item-photos";

function randomName(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
}

// Upload a compressed blob; returns the storage path to save on the item.
export async function uploadItemPhoto(listId: string, blob: Blob): Promise<string> {
  const sb = getSupabase();
  if (!sb) throw new Error("Cloud backend is not configured.");
  const path = `${listId}/${randomName()}`;
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: "image/jpeg", upsert: true });
  if (error) throw new Error(error.message);
  return path;
}

// Signed URL for display (bucket is private).
export async function getPhotoUrl(path: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.storage.from(BUCKET).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export async function deleteItemPhoto(path: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.storage.from(BUCKET).remove([path]);
}
