import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function PublicProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (error || !profile) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="rounded-xl border border-slate-700 p-6">
        <h1 className="text-3xl font-bold">{profile.full_name}</h1>

        <p className="mt-2 text-slate-400">
          {profile.position_primary} • Class of {profile.grad_year}
        </p>

        <div className="mt-6 space-y-2">
          <p>
            <strong>School:</strong> {profile.school}
          </p>

          <p>
            <strong>Height:</strong> {profile.height}
          </p>

          <p>
            <strong>Weight:</strong> {profile.weight}
          </p>
        </div>
      </div>
    </main>
  );
}