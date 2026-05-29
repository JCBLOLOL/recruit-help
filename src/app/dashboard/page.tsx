import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

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

  return (
    <div className="min-h-full bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-medium text-emerald-400">
            Recruit Help
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm text-slate-400 hover:text-white"
            >
              Log out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-sm uppercase tracking-widest text-emerald-400">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold">Hi, {displayName}</h1>
        <p className="mt-2 text-slate-400">
          You&apos;re logged in. Milestone M1 is working.
        </p>

        <div className="mt-10 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="font-semibold">Profile status</h2>
          {profile ? (
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>
                Sport: <span className="text-white">{profile.sport}</span>
              </li>
              <li>
                Profile link slug:{" "}
                <span className="font-mono text-white">{profile.slug}</span>
              </li>
              <li>
                Public:{" "}
                <span className="text-white">
                  {profile.is_public ? "Yes" : "No (coming in M3)"}
                </span>
              </li>
            </ul>
          ) : (
            <p className="mt-4 text-sm text-amber-300">
              No profile row found. Run the SQL in{" "}
              <code className="rounded bg-slate-800 px-1">supabase/schema.sql</code>{" "}
              and sign up again, or ask for help.
            </p>
          )}
        </div>

        <p className="mt-8 text-sm text-slate-500">
          Next up (M2): edit your full athlete profile.
        </p>
      </main>
    </div>
  );
}
