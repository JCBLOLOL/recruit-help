"use client";

import { createClient } from "@/lib/supabase/client";
import type {
  AwardRow,
  ExternalProfileRow,
  ProfileRow,
  StatsJson,
} from "@/lib/profile/types";
import { useActionState, useState } from "react";
import { saveProfile, type ProfileFormState } from "@/app/profile/edit/actions";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none ring-emerald-500 focus:ring-2";
const labelClass = "block text-sm font-medium text-slate-300";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function ProfileEditor({
  profile,
  external,
  awards,
  userId,
}: {
  profile: ProfileRow;
  external: ExternalProfileRow;
  awards: AwardRow[];
  userId: string;
}) {
  const [state, formAction, pending] = useActionState<
    ProfileFormState,
    FormData
  >(saveProfile, { ok: false, message: "" });

  const stats = (profile.stats_json ?? {}) as StatsJson;
  const social = profile.social_links ?? {};

  const [awardRows, setAwardRows] = useState<AwardRow[]>(
    awards.length > 0
      ? awards
      : [{ id: "new-0", title: "", year_optional: "", sort_order: 0 }],
  );
  const [headshotPath, setHeadshotPath] = useState(profile.headshot_path ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleHeadshot(file: File | null) {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/headshot.${ext}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    setUploading(false);
    if (error) {
      setUploadError(error.message);
      return;
    }
    setHeadshotPath(path);
  }

  const headshotUrl = headshotPath
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${headshotPath}`
    : null;

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="headshot_path" value={headshotPath} />

      {state.message && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            state.ok
              ? "bg-emerald-950/50 text-emerald-300"
              : "bg-red-950/50 text-red-300"
          }`}
        >
          {state.message}
        </p>
      )}

      <Section title="Basics">
        <p className="text-sm text-slate-500">
          Profile link slug:{" "}
          <span className="font-mono text-slate-300">{profile.slug}</span>
        </p>
        <div>
          <label htmlFor="full_name" className={labelClass}>
            Full name
          </label>
          <input
            id="full_name"
            name="full_name"
            required
            defaultValue={profile.full_name}
            className={inputClass}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sport" className={labelClass}>
              Sport
            </label>
            <select
              id="sport"
              name="sport"
              defaultValue={profile.sport}
              className={inputClass}
            >
              <option value="baseball">Baseball</option>
              <option value="softball">Softball</option>
            </select>
          </div>
          <div>
            <label htmlFor="grad_year" className={labelClass}>
              Graduation year
            </label>
            <input
              id="grad_year"
              name="grad_year"
              type="number"
              min={2024}
              max={2035}
              defaultValue={profile.grad_year ?? ""}
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="position_primary" className={labelClass}>
              Primary position
            </label>
            <input
              id="position_primary"
              name="position_primary"
              placeholder="e.g. SS, P, C"
              defaultValue={profile.position_primary ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="position_secondary" className={labelClass}>
              Secondary position
            </label>
            <input
              id="position_secondary"
              name="position_secondary"
              defaultValue={profile.position_secondary ?? ""}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label htmlFor="bio" className={labelClass}>
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            defaultValue={profile.bio ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Headshot</label>
          {headshotUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={headshotUrl}
              alt="Headshot"
              className="mt-2 h-24 w-24 rounded-full object-cover"
            />
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-2 block text-sm text-slate-400"
            onChange={(e) => handleHeadshot(e.target.files?.[0] ?? null)}
          />
          {uploading && (
            <p className="mt-1 text-sm text-slate-400">Uploading…</p>
          )}
          {uploadError && (
            <p className="mt-1 text-sm text-red-300">{uploadError}</p>
          )}
        </div>
      </Section>

      <Section title="Measurables">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="height" className={labelClass}>
              Height
            </label>
            <input
              id="height"
              name="height"
              placeholder={`5'11"`}
              defaultValue={profile.height ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="weight" className={labelClass}>
              Weight (lbs)
            </label>
            <input
              id="weight"
              name="weight"
              defaultValue={profile.weight ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="throws" className={labelClass}>
              Throws
            </label>
            <select
              id="throws"
              name="throws"
              defaultValue={profile.throws ?? ""}
              className={inputClass}
            >
              <option value="">—</option>
              <option value="R">Right</option>
              <option value="L">Left</option>
            </select>
          </div>
          <div>
            <label htmlFor="bats" className={labelClass}>
              Bats
            </label>
            <select
              id="bats"
              name="bats"
              defaultValue={profile.bats ?? ""}
              className={inputClass}
            >
              <option value="">—</option>
              <option value="R">Right</option>
              <option value="L">Left</option>
              <option value="S">Switch</option>
            </select>
          </div>
        </div>
      </Section>

      <Section title="School">
        <div>
          <label htmlFor="school" className={labelClass}>
            High school
          </label>
          <input
            id="school"
            name="school"
            defaultValue={profile.school ?? ""}
            className={inputClass}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="city" className={labelClass}>
              City
            </label>
            <input
              id="city"
              name="city"
              defaultValue={profile.city ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="state" className={labelClass}>
              State
            </label>
            <input
              id="state"
              name="state"
              placeholder="TX"
              maxLength={2}
              defaultValue={profile.state ?? ""}
              className={inputClass}
            />
          </div>
        </div>
      </Section>

      <Section title="Stats">
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["batting_avg", "Batting avg"],
              ["obp", "OBP"],
              ["era", "ERA"],
              ["fb_velo", "FB velo"],
              ["exit_velo", "Exit velo"],
              ["sixty_time", "60-yard (sec)"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label htmlFor={key} className={labelClass}>
                {label}
              </label>
              <input
                id={key}
                name={key}
                defaultValue={stats[key] ?? ""}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Awards">
        {awardRows.map((row, i) => (
          <div key={row.id} className="flex flex-wrap gap-2">
            <input
              name="award_title"
              placeholder="Award name"
              defaultValue={row.title}
              className={`${inputClass} mt-0 flex-1 min-w-[200px]`}
            />
            <input
              name="award_year"
              placeholder="Year"
              defaultValue={row.year_optional ?? ""}
              className={`${inputClass} mt-0 w-24`}
            />
            {awardRows.length > 1 && (
              <button
                type="button"
                className="rounded-lg px-3 text-sm text-red-400 hover:bg-red-950/30"
                onClick={() =>
                  setAwardRows((rows) => rows.filter((_, j) => j !== i))
                }
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="text-sm text-emerald-400 hover:underline"
          onClick={() =>
            setAwardRows((rows) => [
              ...rows,
              {
                id: `new-${rows.length}`,
                title: "",
                year_optional: "",
                sort_order: rows.length,
              },
            ])
          }
        >
          + Add award
        </button>
      </Section>

      <Section title="Academics & goals">
        <div>
          <label htmlFor="gpa_optional" className={labelClass}>
            GPA (optional)
          </label>
          <input
            id="gpa_optional"
            name="gpa_optional"
            step="0.01"
            min={0}
            max={5}
            defaultValue={profile.gpa_optional ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="academic_interests" className={labelClass}>
            Academic interests
          </label>
          <textarea
            id="academic_interests"
            name="academic_interests"
            rows={2}
            defaultValue={profile.academic_interests ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="recruiting_goals" className={labelClass}>
            Recruiting goals
          </label>
          <textarea
            id="recruiting_goals"
            name="recruiting_goals"
            rows={2}
            defaultValue={profile.recruiting_goals ?? ""}
            className={inputClass}
          />
        </div>
      </Section>

      <Section title="Contact">
        <div>
          <label htmlFor="contact_email" className={labelClass}>
            Email
          </label>
          <input
            id="contact_email"
            name="contact_email"
            type="email"
            defaultValue={profile.contact_email ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="contact_phone" className={labelClass}>
            Phone
          </label>
          <input
            id="contact_phone"
            name="contact_phone"
            type="tel"
            defaultValue={profile.contact_phone ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="parent_email_optional" className={labelClass}>
            Parent/guardian email
          </label>
          <input
            id="parent_email_optional"
            name="parent_email_optional"
            type="email"
            defaultValue={profile.parent_email_optional ?? ""}
            className={inputClass}
          />
        </div>
      </Section>

      <Section title="Social links">
        {(
          [
            ["instagram", "Instagram URL"],
            ["twitter", "X / Twitter URL"],
            ["youtube", "YouTube URL"],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <label htmlFor={key} className={labelClass}>
              {label}
            </label>
            <input
              id={key}
              name={key}
              type="url"
              defaultValue={social[key] ?? ""}
              className={inputClass}
            />
          </div>
        ))}
      </Section>

      <Section title="External profiles">
        <p className="text-sm text-slate-500">
          Link only — we don&apos;t import data from NCSA or Perfect Game.
        </p>
        <div>
          <label htmlFor="ncsa_url" className={labelClass}>
            NCSA profile URL
          </label>
          <input
            id="ncsa_url"
            name="ncsa_url"
            type="url"
            placeholder="https://www.ncsasports.org/..."
            defaultValue={external.ncsa_url ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="perfect_game_url" className={labelClass}>
            Perfect Game profile URL
          </label>
          <input
            id="perfect_game_url"
            name="perfect_game_url"
            type="url"
            placeholder="https://www.perfectgame.org/..."
            defaultValue={external.perfect_game_url ?? ""}
            className={inputClass}
          />
        </div>
      </Section>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-emerald-500 py-3 font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-50 sm:w-auto sm:px-8"
      >
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
