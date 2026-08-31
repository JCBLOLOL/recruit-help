import { AppShell } from "@/components/app-shell";
import { ClipEditor } from "@/components/clip-editor";
import { formatTime } from "@/lib/profile/labels";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { deleteClip } from "./actions";

export default async function ClipsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
  if (!profile) redirect("/dashboard");

  const { data: video } = await supabase
    .from("videos")
    .select("id, title, storage_path")
    .eq("id", id)
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!video) notFound();

  const { data: signed } = await supabase.storage
    .from("videos")
    .createSignedUrl(video.storage_path, 60 * 60);

  const { data: clips } = await supabase
    .from("clips")
    .select("id, label, start_sec, end_sec, is_featured, sort_order")
    .eq("video_id", video.id)
    .order("sort_order");

  return (
    <AppShell
      wide
      backHref="/videos"
      backLabel="Videos"
      right={
        <form action="/auth/signout" method="post">
          <button type="submit" className="text-sm text-slate-400 hover:text-white">
            Log out
          </button>
        </form>
      }
    >
      <h1 className="text-3xl font-bold tracking-tight">Highlight clips</h1>
      <p className="mt-2 text-slate-400">{video.title}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {signed?.signedUrl ? (
          <ClipEditor videoId={video.id} videoUrl={signed.signedUrl} />
        ) : (
          <p className="text-red-300">Could not load this video.</p>
        )}

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Saved clips</h2>
          {(clips ?? []).length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              No clips yet. Mark start and end times on the video.
            </p>
          ) : (
            <ul className="mt-5 space-y-3">
              {(clips ?? []).map((clip) => (
                <li
                  key={clip.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-white">{clip.label}</p>
                    <p className="text-xs text-slate-500">
                      {formatTime(clip.start_sec)} – {formatTime(clip.end_sec)}
                      {clip.is_featured ? " · Featured" : ""}
                    </p>
                  </div>
                  <form action={deleteClip}>
                    <input type="hidden" name="video_id" value={video.id} />
                    <input type="hidden" name="clip_id" value={clip.id} />
                    <button type="submit" className="text-sm text-red-400 hover:text-red-300">
                      Delete
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
