import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { setProfilePublic } from "./actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, slug, sport, is_public")
    .eq("user_id", user.id)
    .maybeSingle();

  const displayName =
    profile?.full_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    user.email;

  const publicUrl = profile
    ? `https://recruit-help.vercel.app/p/${profile.slug}`
    : null;

  return (
    <AppShell
      wide
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
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Hi, {displayName}
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/profile/edit"
            className="rounded-lg bg-emerald-500 px-6 py-2.5 font-medium text-slate-950 hover:bg-emerald-400"
          >
            Edit profile
          </Link>
          {profile?.is_public && (
            <Link
              href={`/p/${profile.slug}`}
              className="rounded-lg border border-slate-600 px-6 py-2.5 font-medium text-slate-200 hover:border-slate-400"
            >
              View public page
            </Link>
          )}
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {profile && (
          <div className="rounded-2xl border border-emerald-800/40 bg-emerald-950/25 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-emerald-300">
              Share with coaches
            </h2>
            {profile.is_public ? (
              <>
                <p className="mt-2 text-sm text-slate-300">
                  Your profile is <strong className="text-white">public</strong>.
                </p>
                <p className="mt-4 break-all rounded-xl bg-slate-950/80 px-4 py-3 font-mono text-sm text-emerald-400">
                  {publicUrl}
                </p>
                <form action={setProfilePublic} className="mt-5">
                  <input type="hidden" name="make_public" value="false" />
                  <button
                    type="submit"
                    className="text-sm text-slate-400 underline hover:text-white"
                  >
                    Make private
                  </button>
                </form>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm text-slate-300">
                  Profile is private. Coaches can&apos;t see it yet.
                </p>
                <form action={setProfilePublic} className="mt-5">
                  <input type="hidden" name="make_public" value="true" />
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-500 px-6 py-2.5 font-medium text-slate-950 hover:bg-emerald-400"
                  >
                    Make public
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Profile status</h2>
          {profile ? (
            <dl className="mt-5 grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Sport
                </dt>
                <dd className="mt-1 capitalize text-white">{profile.sport}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Slug
                </dt>
                <dd className="mt-1 font-mono text-sm text-white">
                  {profile.slug}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Public
                </dt>
                <dd className="mt-1 text-white">
                  {profile.is_public ? "Yes" : "No"}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-amber-300">
              No profile — run supabase/schema.sql
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
