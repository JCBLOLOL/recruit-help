"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveVideoRecord } from "@/app/videos/actions";

const MAX_BYTES = 500 * 1024 * 1024; // 500MB

export function VideoUploader({
  userId,
  videoCount,
}: {
  userId: string;
  videoCount: number;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFileChange(file: File | null) {
    setMessage(null);
    setError(null);
    if (!file) return;

    if (videoCount >= 3) {
      setError("Beta limit: max 3 videos.");
      return;
    }

    const okType =
      file.type === "video/mp4" ||
      file.type === "video/quicktime" ||
      file.name.toLowerCase().endsWith(".mp4") ||
      file.name.toLowerCase().endsWith(".mov");

    if (!okType) {
      setError("Only MP4 or MOV files allowed.");
      return;
    }

    if (file.size > MAX_BYTES) {
      setError("File too large (max 500MB).");
      return;
    }

    setUploading(true);
    setProgress(10);

    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;

    setProgress(30);
    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "video/mp4",
      });

    if (uploadError) {
      setUploading(false);
      setProgress(0);
      setError(
        `${uploadError.message} — run supabase/m4-videos.sql in Supabase.`,
      );
      return;
    }

    setProgress(80);
    const formData = new FormData();
    formData.set("storage_path", path);
    formData.set("title", title.trim() || file.name.replace(/\.[^.]+$/, ""));

    const result = await saveVideoRecord(formData);
    setUploading(false);
    setProgress(100);

    if (!result.ok) {
      setError(result.message);
      setProgress(0);
      return;
    }

    setMessage(result.message);
    setTitle("");
    setProgress(0);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
      <h2 className="text-lg font-semibold">Upload game footage</h2>
      <p className="mt-1 text-sm text-slate-400">
        MP4 or MOV · max 500MB · {videoCount}/3 videos used
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="video_title"
            className="block text-sm font-medium text-slate-300"
          >
            Title (optional)
          </label>
          <input
            id="video_title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. vs Central HS — March 2026"
            disabled={uploading}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none ring-emerald-500 focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor="video_file"
            className="block text-sm font-medium text-slate-300"
          >
            Video file
          </label>
          <input
            id="video_file"
            type="file"
            accept="video/mp4,video/quicktime,.mp4,.mov"
            disabled={uploading || videoCount >= 3}
            className="mt-2 block w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:font-medium file:text-slate-950 hover:file:bg-emerald-400"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />
        </div>

        {uploading && (
          <div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-slate-400">Uploading… {progress}%</p>
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-lg bg-emerald-950/50 px-3 py-2 text-sm text-emerald-300">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
