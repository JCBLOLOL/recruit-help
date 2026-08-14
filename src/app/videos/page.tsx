import { AppShell } from "@/components/app-shell";
import { VideoUploader } from "@/components/video-uploader";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { deleteVideo } from "./actions";

export default async function VideosPage() {
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

  const { data: videos } = await supabase
    .from("videos")
    .select("id, title, storage_path, created_at")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  const list = videos ?? [];

  const videosWithUrls = await Promise.all(
    list.map(async (video) => {
      const { data } = await supabase.storage
        .from("videos")
        .createSignedUrl(video.storage_path, 60 * 60);
      return { ...video, url: data?.signedUrl ?? null };
    }),
  );

  return (
    <AppShell
      wide
      backHref="/dashboard"
      backLabel="Dashboard"
      right={
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="text-sm text-slate-400 hover:text-white"
          >
            Log out
          </button>
        </form>
      }
    >
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Videos</h1>
          <p className="mt-2 text-slate-400">
            Upload game footage for your recruiting profile.
          </p>
        </div>
        <Link
          href="/profile/edit"
          className="text-sm text-emerald-400 hover:underline"
        >
          Edit profile →
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <VideoUploader userId={user.id} videoCount={list.length} />

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Your videos</h2>
          {videosWithUrls.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              No videos yet. Upload your first clip.
            </p>
          ) : (
            <ul className="mt-5 space-y-6">
              {videosWithUrls.map((video) => (
                <li
                  key={video.id}
                  className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/50"
                >
                  {video.url ? (
                    <video
                      src={video.url}
                      controls
                      className="aspect-video w-full bg-black"
                      preload="metadata"
                    />
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-slate-900 text-sm text-slate-500">
                      Preview unavailable
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <div>
                      <p className="font-medium text-white">{video.title}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(video.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <form action={deleteVideo}>
                      <input type="hidden" name="video_id" value={video.id} />
                      <button
                        type="submit"
                        className="text-sm text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
