"use server";

import { createClient } from "@/lib/supabase/server";
import type { Sport, StatsJson, SocialLinks } from "@/lib/profile/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ProfileFormState = {
  ok: boolean;
  message: string;
};

function emptyToNull(v: string): string | null {
  const t = v.trim();
  return t === "" ? null : t;
}

export async function saveProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { ok: false, message: "Profile not found." };
  }

  const stats: StatsJson = {
    batting_avg: emptyToNull(formData.get("batting_avg") as string) ?? undefined,
    obp: emptyToNull(formData.get("obp") as string) ?? undefined,
    era: emptyToNull(formData.get("era") as string) ?? undefined,
    fb_velo: emptyToNull(formData.get("fb_velo") as string) ?? undefined,
    exit_velo: emptyToNull(formData.get("exit_velo") as string) ?? undefined,
    sixty_time: emptyToNull(formData.get("sixty_time") as string) ?? undefined,
  };

  const social: SocialLinks = {
    instagram: emptyToNull(formData.get("instagram") as string) ?? undefined,
    twitter: emptyToNull(formData.get("twitter") as string) ?? undefined,
    youtube: emptyToNull(formData.get("youtube") as string) ?? undefined,
  };

  const gradRaw = (formData.get("grad_year") as string)?.trim();
  const gpaRaw = (formData.get("gpa_optional") as string)?.trim();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: (formData.get("full_name") as string).trim(),
      sport: formData.get("sport") as Sport,
      grad_year: gradRaw ? parseInt(gradRaw, 10) : null,
      position_primary: emptyToNull(formData.get("position_primary") as string),
      position_secondary: emptyToNull(
        formData.get("position_secondary") as string,
      ),
      height: emptyToNull(formData.get("height") as string),
      weight: emptyToNull(formData.get("weight") as string),
      throws: emptyToNull(formData.get("throws") as string),
      bats: emptyToNull(formData.get("bats") as string),
      school: emptyToNull(formData.get("school") as string),
      city: emptyToNull(formData.get("city") as string),
      state: emptyToNull(formData.get("state") as string),
      gpa_optional: gpaRaw ? parseFloat(gpaRaw) : null,
      academic_interests: emptyToNull(
        formData.get("academic_interests") as string,
      ),
      recruiting_goals: emptyToNull(formData.get("recruiting_goals") as string),
      stats_json: stats,
      bio: emptyToNull(formData.get("bio") as string),
      contact_email: emptyToNull(formData.get("contact_email") as string),
      contact_phone: emptyToNull(formData.get("contact_phone") as string),
      parent_email_optional: emptyToNull(
        formData.get("parent_email_optional") as string,
      ),
      social_links: social,
      headshot_path: emptyToNull(formData.get("headshot_path") as string),
      is_public: formData.get("is_public") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id);

  if (profileError) {
    return { ok: false, message: profileError.message };
  }

  const { data: updated } = await supabase
    .from("profiles")
    .select("slug")
    .eq("id", profile.id)
    .single();

  const { error: extError } = await supabase
    .from("external_profiles")
    .update({
      ncsa_url: emptyToNull(formData.get("ncsa_url") as string),
      perfect_game_url: emptyToNull(formData.get("perfect_game_url") as string),
    })
    .eq("profile_id", profile.id);

  if (extError) {
    return { ok: false, message: extError.message };
  }

  const awardTitles = formData.getAll("award_title") as string[];
  const awardYears = formData.getAll("award_year") as string[];

  await supabase.from("awards").delete().eq("profile_id", profile.id);

  const awardsToInsert = awardTitles
    .map((title, i) => ({
      profile_id: profile.id,
      title: title.trim(),
      year_optional: awardYears[i]?.trim() || null,
      sort_order: i,
    }))
    .filter((a) => a.title.length > 0);

  if (awardsToInsert.length > 0) {
    const { error: awardsError } = await supabase
      .from("awards")
      .insert(awardsToInsert);
    if (awardsError) {
      return {
        ok: false,
        message: `Profile saved but awards failed: ${awardsError.message}. Run supabase/m2-awards-storage.sql`,
      };
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile/edit");
  if (updated?.slug) {
    revalidatePath(`/p/${updated.slug}`);
  }
  return { ok: true, message: "Profile saved." };
}
