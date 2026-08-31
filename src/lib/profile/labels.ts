export const STAT_LABELS: Record<string, string> = {
  batting_avg: "Batting avg",
  obp: "OBP",
  era: "ERA",
  fb_velo: "FB velocity",
  exit_velo: "Exit velocity",
  sixty_time: "60-yard (sec)",
};

export function formatSide(value: string | null | undefined) {
  if (value === "R") return "Right";
  if (value === "L") return "Left";
  if (value === "S") return "Switch";
  return value ?? "";
}

export function formatTime(seconds: number) {
  const safe = Math.max(0, seconds);
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
