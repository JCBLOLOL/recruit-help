"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function setProfilePublic(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const makePublic = formData.get("make_public") === "true";

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({
      is_public: makePublic,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .select("slug")
    .single();

  if (error) {
    console.error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile/edit");
  if (profile?.slug) {
    revalidatePath(`/p/${profile.slug}`);
  }
}
