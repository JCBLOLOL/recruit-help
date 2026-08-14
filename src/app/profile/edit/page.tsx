import { AppShell } from "@/components/app-shell";
import { ProfileEditor } from "@/components/profile-editor";
import type {
  AwardRow,
  ExternalProfileRow,
  ProfileRow,
} from "@/lib/profile/types";
import { createClient } from "@/lib/supabase/server";
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit profile</h1>
        <p className="mt-2 text-slate-400">
          All fields are optional except name. Save anytime.
        </p>
      </div>
      <ProfileEditor
        profile={profile as ProfileRow}
        external={(external ?? {}) as ExternalProfileRow}
        awards={(awards ?? []) as AwardRow[]}
        userId={user.id}
      />
    </AppShell>
  );
}
