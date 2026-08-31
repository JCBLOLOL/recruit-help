"use client";

import { formatTime } from "@/lib/profile/labels";
import { useRef, useState } from "react";
import { saveClip } from "@/app/videos/[id]/clips/actions";
import { useRouter } from "next/navigation";

export function ClipEditor({
  videoId,
  videoUrl,
}: {
  videoId: string;
  videoUrl: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [startSec, setStartSec] = useState(0);
  const [endSec, setEndSec] = useState(5);
  const [featured, setFeatured] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function currentTime() {
    return videoRef.current?.currentTime ?? 0;
  }

  async function onSave() {
    setError(null);
    setMessage(null);
    setSaving(true);
    const formData = new FormData();
    formData.set("video_id", videoId);
    formData.set("label", label);
    formData.set("start_sec", String(startSec));
    formData.set("end_sec", String(endSec));
    if (featured) formData.set("is_featured", "on");
    const result = await saveClip(formData);
    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setMessage(result.message);
    setLabel("");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
      <h2 className="text-lg font-semibold">Mark a highlight</h2>
      <p className="mt-1 text-sm text-slate-400">
        Play the video, then set start and end times.
      </p>

      <video
        ref={videoRef}
        src={videoUrl}
        controls
        className="mt-5 aspect-video w-full rounded-xl bg-black"
        preload="metadata"
      />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm text-slate-300">
            Start: <strong className="text-white">{formatTime(startSec)}</strong>
          </p>
          <button
            type="button"
            className="mt-2 rounded-lg border border-slate-600 px-3 py-2 text-sm hover:border-slate-400"
            onClick={() => setStartSec(currentTime())}
          >
            Set start
          </button>
        </div>
        <div>
          <p className="text-sm text-slate-300">
            End: <strong className="text-white">{formatTime(endSec)}</strong>
          </p>
          <button
            type="button"
            className="mt-2 rounded-lg border border-slate-600 px-3 py-2 text-sm hover:border-slate-400"
            onClick={() => setEndSec(currentTime())}
          >
            Set end
          </button>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="clip_label" className="block text-sm font-medium text-slate-300">
          Clip name
        </label>
        <input
          id="clip_label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Line drive to left"
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none ring-emerald-500 focus:ring-2"
        />
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="h-4 w-4 accent-emerald-500"
        />
        Feature this clip on my public page
      </label>

      {error && (
        <p className="mt-4 rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-4 rounded-lg bg-emerald-950/50 px-3 py-2 text-sm text-emerald-300">
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="mt-5 rounded-lg bg-emerald-500 px-6 py-2.5 font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save clip"}
      </button>
    </div>
  );
}
