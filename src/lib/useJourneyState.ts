import { useEffect, useMemo, useState } from "react";
import { getJourneyProgress, saveJourneyProgress } from "@/lib/journey.functions";
import { LEVELS, STORAGE_KEY, TRACKED_LEVELS } from "@/lib/levels";

export type LevelState = "completed" | "current" | "unlocked" | "locked";

export function useJourneyState() {
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const syncProgress = async () => {
      let legacyIds: number[] = [];
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          legacyIds = JSON.parse(raw);
        }
      } catch {
        legacyIds = [];
      }

      const serverProgress = await getJourneyProgress().catch(() => ({ completedLevelIds: legacyIds }));
      const mergedIds = Array.from(
        new Set([...(serverProgress.completedLevelIds ?? []), ...legacyIds]),
      )
        .filter((id) => Number.isInteger(id) && id >= 1 && id <= TRACKED_LEVELS)
        .sort((left, right) => left - right);

      if (!cancelled) {
        setCompleted(new Set(mergedIds));
        setLoaded(true);
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedIds));
      } catch {}

      const serverIds = (serverProgress.completedLevelIds ?? []).join(",");
      const mergedKey = mergedIds.join(",");
      if (mergedKey !== serverIds) {
        try {
          await saveJourneyProgress({ completedLevelIds: mergedIds });
        } catch (error) {
          console.error(error);
        }
      }
    };

    void syncProgress();

    return () => {
      cancelled = true;
    };
  }, []);

  async function markComplete(id: number) {
    const next = new Set(completed);
    next.add(id);
    const nextIds = Array.from(next).sort((left, right) => left - right);

    setCompleted(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextIds));
    } catch {}

    try {
      await saveJourneyProgress({ completedLevelIds: nextIds });
    } catch (error) {
      console.error(error);
    }
  }

  const currentLevelId = useMemo(() => {
    for (const l of LEVELS) if (!completed.has(l.id)) return l.id;
    return LEVELS.length + 1;
  }, [completed]);

  function stateOf(id: number): LevelState {
    if (completed.has(id)) return "completed";
    if (id === currentLevelId) return "current";
    return "unlocked";
  }

  const progressPct = Math.round((completed.size / TRACKED_LEVELS) * 100);

  return { completed, loaded, currentLevelId, stateOf, markComplete, progressPct };
}
