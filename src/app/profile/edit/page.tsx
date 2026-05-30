import { ProfileEditor } from "@/components/profile-editor";
import type {
  AwardRow,
  ExternalProfileRow,
  ProfileRow,
} from "@/lib/profile/types";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/dashboard");

  const { data: external } = await supabase
    .from("external_profiles")
    .select("ncsa_url, perfect_game_url")
    .eq("profile_id", profile.id)
    .maybeSingle();

  const { data: awards } = await supabase
    .from("awards")
    .select("id, title, year_optional, sort_order")
    .eq("profile_id", profile.id)
    .order("sort_order");

  return (
    <div className="min-h-full bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-sm text-emerald-400">
            ← Dashboard
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

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold">Edit profile</h1>
        <p className="mt-1 text-sm text-slate-400">
          All fields are optional except name. Save anytime.
        </p>
        <div className="mt-8">
          <ProfileEditor
            profile={profile as ProfileRow}
            external={(external ?? {}) as ExternalProfileRow}
            awards={(awards ?? []) as AwardRow[]}
            userId={user.id}
          />
        </div>
      </main>
    </div>
  );
}
