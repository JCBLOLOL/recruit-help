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

  return (
    <main className="mx-auto min-h-full max-w-3xl bg-slate-950 px-6 py-12 text-slate-50">
      <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
        Recruit Help
      </p>

      <div className="mt-6 flex flex-wrap items-start gap-6">
        {headshotUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={headshotUrl}
            alt={profile.full_name}
            className="h-24 w-24 rounded-full object-cover"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold">{profile.full_name}</h1>
          <p className="mt-2 text-slate-400">
            {[profile.position_primary, profile.grad_year && `Class of ${profile.grad_year}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {(profile.school || profile.city || profile.state) && (
            <p className="mt-1 text-slate-400">
              {[profile.school, [profile.city, profile.state].filter(Boolean).join(", ")]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-3 rounded-xl border border-slate-800 bg-slate-900 p-6 sm:grid-cols-2">
        {profile.height && (
          <p>
            <span className="text-slate-400">Height:</span> {profile.height}
          </p>
        )}
        {profile.weight && (
          <p>
            <span className="text-slate-400">Weight:</span> {profile.weight}
          </p>
        )}
        {profile.throws && (
          <p>
            <span className="text-slate-400">Throws:</span> {profile.throws}
          </p>
        )}
        {profile.bats && (
          <p>
            <span className="text-slate-400">Bats:</span> {profile.bats}
          </p>
        )}
        {profile.sport && (
          <p>
            <span className="text-slate-400">Sport:</span> {profile.sport}
          </p>
        )}
      </div>

      {profile.bio && (
        <p className="mt-6 leading-relaxed text-slate-300">{profile.bio}</p>
      )}
    </main>
  );
}
