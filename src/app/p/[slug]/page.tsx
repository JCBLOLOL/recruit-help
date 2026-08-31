import Link from "next/link";
import { ClipPlayer } from "@/components/clip-player";
import { STAT_LABELS, formatSide } from "@/lib/profile/labels";
import type { SocialLinks } from "@/lib/profile/types";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  if (value == null || value === "") return null;
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
      {children}
    </h2>
  );
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (error || !profile) {
    notFound();
  }

  const awardsResult = await supabase
    .from("awards")
    .select("title, year_optional")
    .eq("profile_id", profile.id)
    .order("sort_order");

  const externalResult = await supabase
    .from("external_profiles")
    .select("ncsa_url, perfect_game_url")
    .eq("profile_id", profile.id)
    .maybeSingle();

  const videosResult = await supabase
    .from("videos")
    .select("id, title, storage_path")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  const awards = awardsResult.error ? [] : (awardsResult.data ?? []);
  const external = externalResult.error ? null : externalResult.data;
  const videoList = videosResult.error ? [] : (videosResult.data ?? []);
  const videoIds = videoList.map((v) => v.id);

  let clips: {
    id: string;
    video_id: string;
    label: string;
    start_sec: number;
    end_sec: number;
    is_featured: boolean;
    sort_order: number;
  }[] = [];

  if (videoIds.length > 0) {
    const clipsResult = await supabase
      .from("clips")
      .select("id, video_id, label, start_sec, end_sec, is_featured, sort_order")
      .in("video_id", videoIds)
      .order("is_featured", { ascending: false })
      .order("sort_order");
    if (!clipsResult.error) clips = clipsResult.data ?? [];
  }

  const videoUrlById = new Map<string, string>();
  await Promise.all(
    videoList.map(async (video) => {
      const { data } = await supabase.storage
        .from("videos")
        .createSignedUrl(video.storage_path, 60 * 60);
      if (data?.signedUrl) videoUrlById.set(video.id, data.signedUrl);
    }),
  );

  const headshotUrl = profile.headshot_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.headshot_path}`
    : null;

  const stats = (profile.stats_json ?? {}) as Record<string, string>;
  const statEntries = Object.entries(stats).filter(([, v]) => Boolean(v));
  const social = (profile.social_links ?? {}) as SocialLinks;

  const sportLabel = profile.sport
    ? String(profile.sport).charAt(0).toUpperCase() +
      String(profile.sport).slice(1)
    : null;

  const location = [profile.city, profile.state].filter(Boolean).join(", ");

  const clipsWithVideo = clips
    .map((clip) => ({
      ...clip,
      videoUrl: videoUrlById.get(clip.video_id) ?? null,
      videoTitle: videoList.find((v) => v.id === clip.video_id)?.title,
    }))
    .filter((c) => c.videoUrl);

  const featuredClips = clipsWithVideo.filter((c) => c.is_featured);
  const otherClips = clipsWithVideo.filter((c) => !c.is_featured);

  const hasContact =
    profile.contact_email || profile.contact_phone || profile.parent_email_optional;

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800/80">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-4 sm:px-8">
          <Link
            href="/"
            className="shrink-0 rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-200 hover:border-slate-500 hover:bg-slate-900"
          >
            ← Home
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold tracking-wide text-emerald-400"
          >
            Recruit Help
          </Link>
          <span className="ml-auto hidden text-xs text-slate-500 sm:inline">
            Built for athletes, by athletes
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8 sm:py-14">
        <section className="flex flex-col gap-8 border-b border-slate-800 pb-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-wrap items-start gap-6">
            {headshotUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={headshotUrl}
                alt={profile.full_name}
                className="h-32 w-32 rounded-2xl object-cover ring-1 ring-slate-700"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-slate-900 text-3xl font-bold text-emerald-400 ring-1 ring-slate-700">
                {(profile.full_name || "?").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
                {profile.full_name}
              </h1>
              <p className="mt-3 text-lg text-slate-300">
                {[
                  profile.position_primary,
                  profile.position_secondary &&
                    `Also ${profile.position_secondary}`,
                  profile.grad_year && `Class of ${profile.grad_year}`,
                  sportLabel,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {(profile.school || location) && (
                <p className="mt-2 text-slate-400">
                  {[profile.school, location].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <SectionTitle>Measurables</SectionTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            <InfoCard label="Height" value={profile.height} />
            <InfoCard
              label="Weight"
              value={profile.weight ? `${profile.weight} lbs` : null}
            />
            <InfoCard label="Throws" value={formatSide(profile.throws)} />
            <InfoCard label="Bats" value={formatSide(profile.bats)} />
            <InfoCard label="GPA" value={profile.gpa_optional} />
            <InfoCard label="Primary position" value={profile.position_primary} />
            <InfoCard
              label="Secondary position"
              value={profile.position_secondary}
            />
            <InfoCard label="Grad year" value={profile.grad_year} />
            <InfoCard label="Sport" value={sportLabel} />
          </div>
        </section>

        {statEntries.length > 0 && (
          <section className="mt-10">
            <SectionTitle>Performance stats</SectionTitle>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {statEntries.map(([key, value]) => (
                <InfoCard
                  key={key}
                  label={STAT_LABELS[key] ?? key.replaceAll("_", " ")}
                  value={value}
                />
              ))}
            </div>
          </section>
        )}

        {clipsWithVideo.length > 0 && (
          <section className="mt-10">
            <SectionTitle>Highlights</SectionTitle>
            {featuredClips.length > 0 && (
              <div className="mt-4 grid gap-6 lg:grid-cols-2">
                {featuredClips.map((clip) => (
                  <div
                    key={clip.id}
                    className="overflow-hidden rounded-2xl border border-emerald-800/40 bg-slate-900/50"
                  >
                    <ClipPlayer
                      src={clip.videoUrl!}
                      startSec={clip.start_sec}
                      endSec={clip.end_sec}
                      label={clip.label}
                    />
                    <p className="px-4 pb-3 text-xs text-emerald-400">
                      Featured · {clip.videoTitle}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {otherClips.length > 0 && (
              <div
                className={`mt-4 grid gap-6 ${featuredClips.length > 0 ? "lg:grid-cols-2" : "lg:grid-cols-2"}`}
              >
                {otherClips.map((clip) => (
                  <div
                    key={clip.id}
                    className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50"
                  >
                    <ClipPlayer
                      src={clip.videoUrl!}
                      startSec={clip.start_sec}
                      endSec={clip.end_sec}
                      label={clip.label}
                    />
                    {clip.videoTitle && (
                      <p className="px-4 pb-3 text-xs text-slate-500">
                        {clip.videoTitle}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {profile.bio && (
          <section className="mt-10 max-w-3xl">
            <SectionTitle>About</SectionTitle>
            <p className="mt-4 text-lg leading-relaxed text-slate-300">
              {profile.bio}
            </p>
          </section>
        )}

        {(profile.recruiting_goals || profile.academic_interests) && (
          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            {profile.recruiting_goals && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
                <SectionTitle>Recruiting goals</SectionTitle>
                <p className="mt-3 leading-relaxed text-slate-300">
                  {profile.recruiting_goals}
                </p>
              </div>
            )}
            {profile.academic_interests && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
                <SectionTitle>Academic interests</SectionTitle>
                <p className="mt-3 leading-relaxed text-slate-300">
                  {profile.academic_interests}
                </p>
              </div>
            )}
          </section>
        )}

        {(awards ?? []).length > 0 && (
          <section className="mt-10">
            <SectionTitle>Awards &amp; achievements</SectionTitle>
            <ul className="mt-4 space-y-2">
              {(awards ?? []).map((award, i) => (
                <li
                  key={`${award.title}-${i}`}
                  className="flex items-baseline gap-2 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-slate-200"
                >
                  <span className="text-emerald-400">•</span>
                  <span>{award.title}</span>
                  {award.year_optional && (
                    <span className="text-sm text-slate-500">
                      ({award.year_optional})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {hasContact && (
          <section className="mt-10">
            <SectionTitle>Contact</SectionTitle>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profile.contact_email && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Email
                  </p>
                  <p className="mt-2 break-all text-lg font-medium text-white">
                    {profile.contact_email}
                  </p>
                </div>
              )}
              {profile.contact_phone && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Phone
                  </p>
                  <p className="mt-2 text-lg font-medium text-white">
                    {profile.contact_phone}
                  </p>
                </div>
              )}
              {profile.parent_email_optional && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Parent / guardian email
                  </p>
                  <p className="mt-2 break-all text-lg font-medium text-white">
                    {profile.parent_email_optional}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {(external?.ncsa_url || external?.perfect_game_url) && (
          <section className="mt-10">
            <SectionTitle>Also on</SectionTitle>
            <div className="mt-4 flex flex-wrap gap-3">
              {external.ncsa_url && (
                <a
                  href={external.ncsa_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
                >
                  NCSA profile →
                </a>
              )}
              {external.perfect_game_url && (
                <a
                  href={external.perfect_game_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
                >
                  Perfect Game profile →
                </a>
              )}
            </div>
          </section>
        )}

        {Object.values(social).some(Boolean) && (
          <section className="mt-10">
            <SectionTitle>Social</SectionTitle>
            <div className="mt-4 flex flex-wrap gap-3">
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
                >
                  Instagram
                </a>
              )}
              {social.twitter && (
                <a
                  href={social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
                >
                  X / Twitter
                </a>
              )}
              {social.youtube && (
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
                >
                  YouTube
                </a>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-800/80 py-6 text-center text-sm text-slate-500">
        Recruit Help · Built for athletes, by athletes
      </footer>
    </div>
  );
}
