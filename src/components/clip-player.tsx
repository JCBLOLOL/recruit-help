"use client";

import { useEffect, useRef } from "react";

export function ClipPlayer({
  src,
  startSec,
  endSec,
  label,
}: {
  src: string;
  startSec: number;
  endSec: number;
  label?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const onLoaded = () => {
      video.currentTime = startSec;
    };
    const onTime = () => {
      if (video.currentTime >= endSec) {
        video.pause();
        video.currentTime = startSec;
      }
    };

    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("timeupdate", onTime);
    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("timeupdate", onTime);
    };
  }, [startSec, endSec]);

  return (
    <div>
      <video
        ref={ref}
        src={`${src}#t=${startSec}`}
        controls
        preload="metadata"
        className="aspect-video w-full bg-black"
      />
      {label && (
        <p className="px-4 py-3 text-sm font-medium text-white">{label}</p>
      )}
    </div>
  );
}
