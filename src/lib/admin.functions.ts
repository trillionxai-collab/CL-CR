import { createServerFn } from "@tanstack/react-start";
import { mySupabase } from "@/integrations/my-supabase/admin.server";

const TRACKED_LEVELS = 5;

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
  last_active_at: string | null;
};

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export const getAdminOverview = createServerFn({ method: "GET" }).handler(async () => {
  const since = startOfToday();

  const [usersRes, progressRes, sessionsRes] = await Promise.all([
    mySupabase
      .from("journey_users")
      .select(
        "id, first_name, last_name, phone_number, gender, lifestyle, date_of_birth, open_mind_consent, onboarding_completed, created_at, last_login_at",
      )
      .order("created_at", { ascending: false }),
    mySupabase
      .from("journey_progress")
      .select("user_id, current_level, completion_percentage, total_watch_time, updated_at"),
    mySupabase.from("user_sessions").select("user_id, last_active_at"),
  ]);

  if (usersRes.error) throw new Error(usersRes.error.message);

  const progressByUser = new Map<
    string,
    { current_level: number; completion_percentage: number; total_watch_time: number; updated_at: string }
  >();
  (progressRes.data ?? []).forEach((p) => {
    progressByUser.set(p.user_id, {
      current_level: p.current_level ?? 0,
      completion_percentage: Number(p.completion_percentage ?? 0),
      total_watch_time: p.total_watch_time ?? 0,
      updated_at: p.updated_at,
    });
  });

  const lastActiveByUser = new Map<string, string>();
  (sessionsRes.data ?? []).forEach((s) => {
    const prev = lastActiveByUser.get(s.user_id);
    if (!prev || new Date(s.last_active_at).getTime() > new Date(prev).getTime()) {
      lastActiveByUser.set(s.user_id, s.last_active_at);
    }
  });

  const users: AdminUserRow[] = (usersRes.data ?? []).map((u) => {
    const p = progressByUser.get(u.id);
    return {
      ...u,
      current_level: Math.max(0, Math.min(p?.current_level ?? 0, TRACKED_LEVELS)),
      completion_percentage: p?.completion_percentage ?? 0,
      total_watch_time: p?.total_watch_time ?? 0,
      last_active_at: lastActiveByUser.get(u.id) ?? u.last_login_at ?? null,
    };
  });

  const newToday = users.filter((u) => u.created_at >= since);
  const completionsToday = users.filter(
    (u) =>
      (u.completion_percentage >= 100 || u.current_level >= TRACKED_LEVELS) &&
      progressByUser.get(u.id) &&
      progressByUser.get(u.id)!.updated_at >= since,
  );

  return {
    users,
    stats: {
      newToday: newToday.map((u) => u.id),
      completionsToday: completionsToday.map((u) => u.id),
      totalUsers: users.length,
    },
  };
});
