import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  const headshotUrl = profile.headshot_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.headshot_path}`
    : null;

  const stats = (profile.stats_json ?? {}) as Record<string, string>;
  const statEntries = Object.entries(stats).filter(([, v]) => Boolean(v));

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800/80">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <div className="flex items-center gap-3 sm:gap-5">
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
          </div>
          {profile.contact_email && (
            <a
              href={`mailto:${profile.contact_email}`}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400"
            >
              Contact
            </a>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8 sm:py-14">
        <section className="flex flex-col gap-8 border-b border-slate-800 pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-center gap-6">
            {headshotUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={headshotUrl}
                alt={profile.full_name}
                className="h-28 w-28 rounded-2xl object-cover ring-1 ring-slate-700"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-slate-900 text-2xl font-bold text-emerald-400 ring-1 ring-slate-700">
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
                  profile.grad_year && `Class of ${profile.grad_year}`,
                  profile.sport &&
                    String(profile.sport).charAt(0).toUpperCase() +
                      String(profile.sport).slice(1),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {(profile.school || profile.city || profile.state) && (
                <p className="mt-1 text-slate-400">
                  {[
                    profile.school,
                    [profile.city, profile.state].filter(Boolean).join(", "),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Height", profile.height],
            ["Weight", profile.weight],
            ["Throws", profile.throws],
            ["Bats", profile.bats],
            ["GPA", profile.gpa_optional],
          ]
            .filter(([, v]) => v != null && v !== "")
            .map(([label, value]) => (
              <div
                key={String(label)}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-4"
              >
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {label}
                </p>
                <p className="mt-2 text-xl font-semibold text-white">{value}</p>
              </div>
            ))}
        </section>

        {statEntries.length > 0 && (
          <section className="mt-10">
            <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
              Stats
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {statEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-4"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {key.replaceAll("_", " ")}
                  </p>
                  <p className="mt-2 text-lg font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.bio && (
          <section className="mt-10 max-w-3xl">
            <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
              About
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-300">
              {profile.bio}
            </p>
          </section>
        )}

        {(profile.recruiting_goals || profile.academic_interests) && (
          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            {profile.recruiting_goals && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
                <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
                  Recruiting goals
                </h2>
                <p className="mt-3 leading-relaxed text-slate-300">
                  {profile.recruiting_goals}
                </p>
              </div>
            )}
            {profile.academic_interests && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
                <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
                  Academics
                </h2>
                <p className="mt-3 leading-relaxed text-slate-300">
                  {profile.academic_interests}
                </p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
