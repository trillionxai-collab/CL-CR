// Client-side wrapper around /api/admin/overview.

export type AdminUserRow = {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  gender: string | null;
  lifestyle: string | null;
  date_of_birth: string | null;
  open_mind_consent: boolean;
  onboarding_completed: boolean;
  created_at: string;
  last_login_at: string | null;
  current_level: number;
  completion_percentage: number;
  total_watch_time: number;
  level_watch_times?: number[];
  last_active_at: string | null;
};

export type AdminOverview = {
  users: AdminUserRow[];
  stats: {
    newToday: string[];
    completionsToday: string[];
    totalUsers: number;
  };
};

export async function getAdminOverview(): Promise<AdminOverview> {
  const res = await fetch("/api/admin/overview", { credentials: "same-origin" });
  if (!res.ok) throw new Error("Failed to load admin data.");
  return res.json() as Promise<AdminOverview>;
}
