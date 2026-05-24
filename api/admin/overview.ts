// GET /api/admin/overview
// Returns all users with progress and session stats for the admin dashboard.
// No additional auth beyond the service role key in SUPABASE_SERVICE_ROLE_KEY.
// Add an ADMIN_SECRET env var + header check here if you want to restrict access.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminClient } from "../_lib/supabase";

const TRACKED_LEVELS = 5;

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const supabase = getAdminClient();
  const since = startOfToday();

  const [usersRes, progressRes, sessionsRes] = await Promise.all([
    supabase
      .from("journey_users")
      .select(
        "id, first_name, last_name, phone_number, gender, lifestyle, date_of_birth, open_mind_consent, onboarding_completed, created_at, last_login_at",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("journey_progress")
      .select("user_id, current_level, completion_percentage, total_watch_time, updated_at"),
    supabase.from("user_sessions").select("user_id, last_active_at"),
  ]);

  if (usersRes.error) return res.status(500).json({ error: usersRes.error.message });

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

  const users = (usersRes.data ?? []).map((u) => {
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
      (progressByUser.get(u.id)?.updated_at ?? "") >= since,
  );

  return res.json({
    users,
    stats: {
      newToday: newToday.map((u) => u.id),
      completionsToday: completionsToday.map((u) => u.id),
      totalUsers: users.length,
    },
  });
}
