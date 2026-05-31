// GET  /api/journey/progress — returns the user's current journey progress
// POST /api/journey/progress — saves completed level IDs
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { getAdminClient } from "../_lib/supabase.js";
import { getSessionUser } from "../_lib/session.js";

const TRACKED_LEVELS = 6;

const SaveSchema = z.object({
  completedLevelIds: z.array(z.number().int().min(1).max(TRACKED_LEVELS)).optional(),
  watchedSecondsDelta: z.number().int().min(0).max(60 * 60 * 12).optional(),
  levelId: z.number().int().min(1).max(TRACKED_LEVELS).optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sessionUser = await getSessionUser(req);
  if (!sessionUser)
    return res.status(401).json({ error: "Session expired. Please sign in again." });

  const supabase = getAdminClient();

  if (req.method === "GET") {
    // Try to include per-level watch columns if they exist (e.g. level1_watchtime)
    const perLevelCols = Array.from({ length: TRACKED_LEVELS }, (_, i) => `level${i + 1}_watchtime`);
    let selectCols = ["current_level", "completion_percentage", "total_watch_time", ...perLevelCols];

    let data: any = null;
    let error: any = null;

    // Attempt to select per-level columns; if the DB doesn't have them, fall back.
    ({ data, error } = await supabase.from("journey_progress").select(selectCols.join(",")).eq("user_id", sessionUser.id).maybeSingle());
    if (error) {
      // Fallback to the minimal set if the per-level columns are not present.
      selectCols = ["current_level", "completion_percentage", "total_watch_time"];
      const r = await supabase.from("journey_progress").select(selectCols.join(",")).eq("user_id", sessionUser.id).maybeSingle();
      data = r.data;
      error = r.error;
    }

    if (error) return res.status(500).json({ error: "Could not load your journey progress." });

    const currentLevel = Math.max(0, Math.min(data?.current_level ?? 0, TRACKED_LEVELS));
    const levelWatchTimes: number[] = [];
    for (let i = 0; i < TRACKED_LEVELS; i++) {
      const col = `level${i + 1}_watchtime`;
      levelWatchTimes.push(Number(data?.[col] ?? 0));
    }

    return res.json({
      completedLevelIds: Array.from({ length: currentLevel }, (_, i) => i + 1),
      current_level: currentLevel,
      completion_percentage: Number(data?.completion_percentage ?? 0),
      total_watch_time: data?.total_watch_time ?? 0,
      level_watch_times: levelWatchTimes,
    });
  }

  if (req.method === "POST") {
    const parsed = SaveSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const hasCompletedIds = Array.isArray(parsed.data.completedLevelIds);
    const hasWatchDelta = Number.isInteger(parsed.data.watchedSecondsDelta);
    if (!hasCompletedIds && !hasWatchDelta) {
      return res.status(400).json({ error: "Nothing to update." });
    }

    const incomingIds = parsed.data.completedLevelIds ?? [];
    const watchedSecondsDelta = parsed.data.watchedSecondsDelta ?? 0;

    const ids = Array.from(
      new Set(
        incomingIds
          .filter((id) => Number.isInteger(id) && id >= 1 && id <= TRACKED_LEVELS)
          .sort((a, b) => a - b),
      ),
    );

    // Try fetching per-level columns; fall back if they don't exist.
    const perLevelCols = Array.from({ length: TRACKED_LEVELS }, (_, i) => `level${i + 1}_watchtime`);
    let selectCols = ["current_level", "completion_percentage", "total_watch_time", ...perLevelCols];

    let existing: any = null;
    let existingErr: any = null;

    ({ data: existing, error: existingErr } = await supabase
      .from("journey_progress")
      .select(selectCols.join(","))
      .eq("user_id", sessionUser.id)
      .maybeSingle());

    let perLevelColumnsAvailable = true;
    if (existingErr) {
      // If the DB doesn't have those columns, fall back to minimal select.
      selectCols = ["current_level", "completion_percentage", "total_watch_time"];
      const r = await supabase.from("journey_progress").select(selectCols.join(",")).eq("user_id", sessionUser.id).maybeSingle();
      existing = r.data;
      existingErr = r.error;
      perLevelColumnsAvailable = false;
    }

    if (existingErr) return res.status(500).json({ error: "Could not save your journey progress." });

    const currentLevel = hasCompletedIds
      ? ids.length
      : Math.max(0, Math.min(existing?.current_level ?? 0, TRACKED_LEVELS));
    const completionPercentage = hasCompletedIds
      ? Math.round((currentLevel / TRACKED_LEVELS) * 10000) / 100
      : Number(existing?.completion_percentage ?? 0);
    const totalWatchTime = Math.max(0, Number(existing?.total_watch_time ?? 0) + watchedSecondsDelta);

    // Prepare the upsert object. If per-level columns exist and a levelId was provided,
    // increment that specific level's watchtime as well.
    const upsertObj: Record<string, any> = {
      user_id: sessionUser.id,
      current_level: currentLevel,
      completion_percentage: completionPercentage,
      total_watch_time: totalWatchTime,
    };

    const levelId = parsed.data.levelId ?? null;
    if (perLevelColumnsAvailable && levelId && watchedSecondsDelta > 0) {
      const col = `level${levelId}_watchtime`;
      const prev = Number(existing?.[col] ?? 0);
      upsertObj[col] = Math.max(0, prev + watchedSecondsDelta);
    }

    const { error } = await supabase.from("journey_progress").upsert(upsertObj, { onConflict: "user_id" });

    if (error) return res.status(500).json({ error: "Could not save your journey progress." });

    return res.json({
      ok: true,
      current_level: currentLevel,
      completion_percentage: completionPercentage,
      total_watch_time: totalWatchTime,
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
