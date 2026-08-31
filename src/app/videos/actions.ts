"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveVideoRecord(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { ok: false as const, message: "Profile not found." };
  }

  const { count } = await supabase
    .from("videos")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profile.id);

  if ((count ?? 0) >= 3) {
    return {
      ok: false as const,
      message: "Beta limit: max 3 videos per athlete.",
    };
  }

  const storagePath = String(formData.get("storage_path") ?? "").trim();
  const title =
    String(formData.get("title") ?? "").trim() || "Game footage";

  if (!storagePath) {
    return { ok: false as const, message: "Missing video file path." };
  }

  const { error } = await supabase.from("videos").insert({
    profile_id: profile.id,
    storage_path: storagePath,
    title,
  });

  if (error) {
    return {
      ok: false as const,
      message: `${error.message} — run supabase/m4-videos.sql if tables are missing.`,
    };
  }

  revalidatePath("/videos");
  revalidatePath("/dashboard");
  return { ok: true as const, message: "Video saved." };
}

export async function deleteVideo(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const videoId = String(formData.get("video_id") ?? "");
  if (!videoId) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return;

  const { data: video } = await supabase
    .from("videos")
    .select("id, storage_path")
    .eq("id", videoId)
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!video) return;

  await supabase.storage.from("videos").remove([video.storage_path]);
  await supabase.from("videos").delete().eq("id", video.id);

  revalidatePath("/videos");
  revalidatePath("/dashboard");
}

export async function renameVideo(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const videoId = String(formData.get("video_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!videoId || !title) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, slug")
    .eq("user_id", user.id)
    .single();
  if (!profile) return;

  await supabase
    .from("videos")
    .update({ title })
    .eq("id", videoId)
    .eq("profile_id", profile.id);

  revalidatePath("/videos");
  if (profile.slug) revalidatePath(`/p/${profile.slug}`);
}
