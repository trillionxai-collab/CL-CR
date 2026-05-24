// Client-side wrappers around /api/journey/progress.

export type JourneyProgress = {
  completedLevelIds: number[];
  current_level: number;
  completion_percentage: number;
  total_watch_time: number;
};

export async function getJourneyProgress(): Promise<JourneyProgress> {
  const res = await fetch("/api/journey/progress", { credentials: "same-origin" });
  if (!res.ok) throw new Error("Could not load your journey progress.");
  return res.json() as Promise<JourneyProgress>;
}

export async function saveJourneyProgress(data: {
  completedLevelIds: number[];
}): Promise<{ ok: true; current_level: number; completion_percentage: number }> {
  const res = await fetch("/api/journey/progress", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Could not save your journey progress.");
  return res.json();
}
