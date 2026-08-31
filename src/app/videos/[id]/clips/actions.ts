"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function getOwnedVideo(videoId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, slug")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { supabase, user, profile: null, video: null };

  const { data: video } = await supabase
    .from("videos")
    .select("id, profile_id")
    .eq("id", videoId)
    .eq("profile_id", profile.id)
    .maybeSingle();

  return { supabase, user, profile, video };
}

export async function saveClip(formData: FormData) {
  const videoId = String(formData.get("video_id") ?? "");
  const { supabase, video, profile } = await getOwnedVideo(videoId);
  if (!video) return { ok: false as const, message: "Video not found." };

  const label = String(formData.get("label") ?? "").trim() || "Highlight";
  const startSec = Number(formData.get("start_sec") ?? 0);
  const endSec = Number(formData.get("end_sec") ?? 0);
  const isFeatured = formData.get("is_featured") === "on";

  if (!Number.isFinite(startSec) || !Number.isFinite(endSec) || endSec <= startSec) {
    return {
      ok: false as const,
      message: "End time must be after start time.",
    };
  }

  const { count } = await supabase
    .from("clips")
    .select("*", { count: "exact", head: true })
    .eq("video_id", video.id);

  const { error } = await supabase.from("clips").insert({
    video_id: video.id,
    label,
    start_sec: startSec,
    end_sec: endSec,
    sort_order: count ?? 0,
    is_featured: isFeatured,
  });

  if (error) {
    return {
      ok: false as const,
      message: `${error.message} — run supabase/m5-clips.sql in Supabase.`,
    };
  }

  revalidatePath(`/videos/${video.id}/clips`);
  revalidatePath("/videos");
  if (profile?.slug) revalidatePath(`/p/${profile.slug}`);
  return { ok: true as const, message: "Clip saved." };
}

export async function deleteClip(formData: FormData) {
  const videoId = String(formData.get("video_id") ?? "");
  const clipId = String(formData.get("clip_id") ?? "");
  const { supabase, video, profile } = await getOwnedVideo(videoId);
  if (!video || !clipId) return;

  await supabase.from("clips").delete().eq("id", clipId).eq("video_id", video.id);
  revalidatePath(`/videos/${video.id}/clips`);
  revalidatePath("/videos");
  if (profile?.slug) revalidatePath(`/p/${profile.slug}`);
}
