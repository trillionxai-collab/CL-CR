// GET  /api/journey/progress — returns the user's current journey progress
// POST /api/journey/progress — saves completed level IDs
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { getAdminClient } from "../_lib/supabase";
import { getSessionUser } from "../_lib/session";

const TRACKED_LEVELS = 5;

const SaveSchema = z.object({
  completedLevelIds: z.array(z.number().int().min(1).max(TRACKED_LEVELS)),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sessionUser = await getSessionUser(req);
  if (!sessionUser)
    return res.status(401).json({ error: "Session expired. Please sign in again." });

  const supabase = getAdminClient();

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("journey_progress")
      .select("current_level, completion_percentage, total_watch_time")
      .eq("user_id", sessionUser.id)
      .maybeSingle();

    if (error) return res.status(500).json({ error: "Could not load your journey progress." });

    const currentLevel = Math.max(0, Math.min(data?.current_level ?? 0, TRACKED_LEVELS));
    return res.json({
      completedLevelIds: Array.from({ length: currentLevel }, (_, i) => i + 1),
      current_level: currentLevel,
      completion_percentage: Number(data?.completion_percentage ?? 0),
      total_watch_time: data?.total_watch_time ?? 0,
    });
  }

  if (req.method === "POST") {
    const parsed = SaveSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const ids = Array.from(
      new Set(
        parsed.data.completedLevelIds
          .filter((id) => Number.isInteger(id) && id >= 1 && id <= TRACKED_LEVELS)
          .sort((a, b) => a - b),
      ),
    );
    const currentLevel = ids.length;
    const completionPercentage = Math.round((currentLevel / TRACKED_LEVELS) * 10000) / 100;

    const { error } = await supabase.from("journey_progress").upsert(
      {
        user_id: sessionUser.id,
        current_level: currentLevel,
        completion_percentage: completionPercentage,
      },
      { onConflict: "user_id" },
    );

    if (error) return res.status(500).json({ error: "Could not save your journey progress." });

    return res.json({ ok: true, current_level: currentLevel, completion_percentage: completionPercentage });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
