// Client-side wrappers around /api/journey/progress.

export type JourneyProgress = {
  completedLevelIds: number[];
  current_level: number;
  completion_percentage: number;
  total_watch_time: number;
  level_watch_times?: number[];
};

const EMPTY_PROGRESS: JourneyProgress = {
  completedLevelIds: [],
  current_level: 1,
  completion_percentage: 0,
  total_watch_time: 0,
};

export async function getJourneyProgress(): Promise<JourneyProgress> {
  const res = await fetch("/api/journey/progress", { credentials: "same-origin" });
  if (!res.ok) return EMPTY_PROGRESS;
  try {
    return (await res.json()) as JourneyProgress;
  } catch {
    // Non-JSON response (e.g. running `vite dev` without the API functions).
    return EMPTY_PROGRESS;
  }
}

export async function saveJourneyProgress(data: {
  completedLevelIds?: number[];
  watchedSecondsDelta?: number;
  levelId?: number;
}): Promise<{
  ok: true;
  current_level: number;
  completion_percentage: number;
  total_watch_time: number;
}> {
  const res = await fetch("/api/journey/progress", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Could not save your journey progress.");
  return res.json();
}
