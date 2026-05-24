import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { mySupabase } from "@/integrations/my-supabase/admin.server";
import { getSessionUser } from "@/lib/session.server";

const TRACKED_LEVELS = 5;

function normalizeCompletedLevelIds(ids: number[]) {
  return Array.from(
    new Set(
      ids
        .filter((id) => Number.isInteger(id) && id >= 1 && id <= TRACKED_LEVELS)
        .sort((left, right) => left - right),
    ),
  );
}

export const getJourneyProgress = createServerFn({ method: "GET" }).handler(async () => {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const { data, error } = await mySupabase
    .from("journey_progress")
    .select("current_level, completion_percentage, total_watch_time")
    .eq("user_id", sessionUser.id)
    .maybeSingle();

  if (error) {
    throw new Error("Could not load your journey progress.");
  }

  const currentLevel = Math.max(0, Math.min(data?.current_level ?? 0, TRACKED_LEVELS));

  return {
    completedLevelIds: Array.from({ length: currentLevel }, (_, index) => index + 1),
    current_level: currentLevel,
    completion_percentage: Number(data?.completion_percentage ?? 0),
    total_watch_time: data?.total_watch_time ?? 0,
  };
});

const SaveJourneyProgressSchema = z.object({
  completedLevelIds: z.array(z.number().int().min(1).max(TRACKED_LEVELS)),
});

export const saveJourneyProgress = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => SaveJourneyProgressSchema.parse(data))
  .handler(async ({ data }) => {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new Error("Your session has expired. Please sign in again.");
    }

    const completedLevelIds = normalizeCompletedLevelIds(data.completedLevelIds);
    const currentLevel = completedLevelIds.length;
    const completionPercentage =
      Math.round((currentLevel / TRACKED_LEVELS) * 10000) / 100;

    const { error } = await mySupabase.from("journey_progress").upsert(
      {
        user_id: sessionUser.id,
        current_level: currentLevel,
        completion_percentage: completionPercentage,
      },
      { onConflict: "user_id" },
    );

    if (error) {
      throw new Error("Could not save your journey progress.");
    }

    return {
      ok: true as const,
      current_level: currentLevel,
      completion_percentage: completionPercentage,
    };
  });