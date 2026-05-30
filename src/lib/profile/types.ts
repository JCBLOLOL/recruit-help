export type Sport = "baseball" | "softball";

export type StatsJson = {
  batting_avg?: string;
  obp?: string;
  era?: string;
  fb_velo?: string;
  exit_velo?: string;
  sixty_time?: string;
};

export type SocialLinks = {
  instagram?: string;
  twitter?: string;
  youtube?: string;
};

export type ProfileRow = {
  id: string;
  slug: string;
  full_name: string;
  sport: Sport;
  grad_year: number | null;
  position_primary: string | null;
  position_secondary: string | null;
  height: string | null;
  weight: string | null;
  throws: string | null;
  bats: string | null;
  school: string | null;
  city: string | null;
  state: string | null;
  gpa_optional: number | null;
  academic_interests: string | null;
  recruiting_goals: string | null;
  stats_json: StatsJson;
  bio: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  parent_email_optional: string | null;
  social_links: SocialLinks;
  headshot_path: string | null;
};

export type ExternalProfileRow = {
  ncsa_url: string | null;
  perfect_game_url: string | null;
};

export type AwardRow = {
  id: string;
  title: string;
  year_optional: string | null;
  sort_order: number;
};
