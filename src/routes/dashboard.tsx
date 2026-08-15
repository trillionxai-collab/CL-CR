import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Lock, Play, Check, X, LogOut } from "lucide-react";
import { getJourneyProgress, saveJourneyProgress } from "@/lib/journey.functions";
import ecoherbLogo from "@/assets/ecoherb.png";

type Level = {
  id: number;
  title: string;
  subtitle: string;
  url: string;
  duration?: string;
};

const LEVELS: Level[] = [
  {
    id: 1,
    title: "A Better Way to Feel",
    subtitle: "The opening breath.",
    url: "https://res.cloudinary.com/dzboz4mwb/video/upload/q_auto/f_auto/v1779300554/LEVEL_-_1_A_Better_Way_to_Feel_mjjgis.mp4",
    duration: "01:30",
  },
  {
    id: 2,
    title: "Is Everything Okay?",
    subtitle: "A quiet inquiry inward.",
    url: "https://res.cloudinary.com/dzboz4mwb/video/upload/q_auto/f_auto/v1780430012/LEVEL_-_2_Is_Everything_Okay_xahmxh.mp4",
    duration: "02:00",
  },
  {
    id: 3,
    title: "The World Has Changed",
    subtitle: "Witnessing the shift.",
    url: "https://res.cloudinary.com/dzboz4mwb/video/upload/q_auto/f_auto/v1779300566/LEVEL_-_3_The_world_has_changed_qun1nj.mp4",
    duration: "02:38",
  },
  {
    id: 4,
    title: "The Hidden Damage",
    subtitle: "What lives beneath the surface.",
    url: "https://res.cloudinary.com/dzboz4mwb/video/upload/q_auto/f_auto/v1779300551/LEVEL_-_4_The_Hidden_Damage_yszd35.mp4",
    duration: "02:13",
  },
  {
    id: 5,
    title: "The Healing System",
    subtitle: "The medicine within.",
    url: "https://res.cloudinary.com/dzboz4mwb/video/upload/q_auto/f_auto/v1779300572/LEVEL_-_5_The_Healing_System_u7cnw8.mp4",
    duration: "03:03",
  },
  {
    id: 6,
    title: "The Reconnection",
    subtitle: "Reuniting with your core.",
    url: "https://res.cloudinary.com/dzboz4mwb/video/upload/q_auto/f_auto/v1780262992/LEVEL_6_-_THE_RECONNECTION_1_mrxd4e.mp4",
    duration: "02:54",
  },
  {
    id: 7,
    title: "The Conscious Living",
    subtitle: "Practice and integration.",
    url: "https://res.cloudinary.com/dzboz4mwb/video/upload/q_auto/f_auto/v1780424932/Level_7_-_The_Conscious_Living_ht2hqm.mp4",
    duration: "02:18",
  },
];

function formatDuration(seconds: number) {
  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mm}:${ss}`;
}

const STORAGE_KEY = "hrj_completed_levels_v1";
const TRACKED_LEVELS = LEVELS.length;

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();

  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [active, setActive] = useState<Level | null>(null);
  const [durations, setDurations] = useState<Record<number, string>>({});

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

      const serverProgress = await getJourneyProgress();
      const mergedIds = Array.from(
        new Set([...(serverProgress.completedLevelIds ?? []), ...legacyIds]),
      )
        .filter((id) => Number.isInteger(id) && id >= 1 && id <= TRACKED_LEVELS)
        .sort((left, right) => left - right);

      if (!cancelled) {
        setCompleted(new Set(mergedIds));
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedIds));
      } catch {}

      const serverIds = (serverProgress.completedLevelIds ?? []).join(",");
      const mergedKey = mergedIds.join(",");
      if (mergedKey !== serverIds) {
        await saveJourneyProgress({ completedLevelIds: mergedIds });
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

  const progressPct = Math.round((completed.size / TRACKED_LEVELS) * 100);
  const activeIndex = active ? LEVELS.findIndex((lvl) => lvl.id === active.id) : -1;

  function handleLoadedMetadata(id: number, e: any) {
    try {
      const seconds = Math.floor((e.currentTarget?.duration || 0) as number);
      if (!Number.isFinite(seconds)) return;
      setDurations((prev) => ({ ...prev, [id]: formatDuration(seconds) }));
    } catch (err) {
      // ignore
    }
  }

  function stateOf(id: number): "completed" | "current" | "unlocked" | "locked" {
    if (completed.has(id)) return "completed";
    if (id === currentLevelId) return "current";
    return "unlocked";
  }

  function handleGoHome() {
    navigate({ to: "/" });
  }

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* top bar */}
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 pt-5 pb-2">
        <div className="flex items-center gap-3">
          <img src={ecoherbLogo} alt="Ecoherb Health and Ayur" className="h-10 w-10 object-contain" />
          <h1 className="font-serif text-lg tracking-tight text-foreground">Ecoherb Health and Ayur</h1>
        </div>
        <button
          onClick={handleGoHome}
          aria-label="Go to homepage"
          className="inline-flex items-center gap-2 rounded-full border border-border/50 px-3 py-1.5 text-[11px] text-foreground/60 transition hover:text-foreground"
        >
          <LogOut className="h-3 w-3" />
          <span className="hidden sm:inline">Home</span>
        </button>
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-3xl px-5 pt-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-foreground/60">A guided video journey from Ecoherb Health and Ayur, supporting your wellbeing through reflection, healing, and reconnection.</p>
          <ProgressRing percent={progressPct} size={56} stroke={5} />
        </div>
      </section>

      {/* Continue Journey hero */}
      <section className="mx-auto mt-4 w-full max-w-3xl px-5">
        <ContinueHero
          completedCount={completed.size}
          currentTitle={LEVELS[currentLevelId - 1]?.title}
          onContinue={() => {
            const next = LEVELS.find((l) => l.id === currentLevelId);
            if (next) setActive(next);
          }}
        />
      </section>

      {/* Today's reflection removed */}

      {/* Course list */}
      <section className="mx-auto mt-6 w-full max-w-3xl px-5 pb-16">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-lg tracking-tight">Course Levels</h3>
          <div className="text-sm text-foreground/60">
            {completed.size}/{TRACKED_LEVELS} completed
          </div>
        </div>

        <div className="space-y-3">
          {LEVELS.map((lvl, i) => {
            const state = stateOf(lvl.id);
            const isCurrent = state === "current";
            const isCompleted = state === "completed";
            const isLocked = state === "locked";
            return (
              <motion.li
                key={lvl.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.04 }}
                className={`flex items-center justify-between gap-3 p-3 rounded-2xl border bg-background ${isCurrent ? "border-[#3aa87a]/30 ring-1 ring-[#3aa87a]/15" : "border-border/40"}`}
                role="button"
                tabIndex={0}
                aria-disabled={isLocked}
                onClick={() => {
                  if (!isLocked) setActive(lvl);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
                    e.preventDefault();
                    if (!isLocked) setActive(lvl);
                  }
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    onClick={(e) => {
                      // prevent the row click from firing twice
                      e.stopPropagation();
                      if (!isLocked) setActive(lvl);
                    }}
                    className={`w-28 h-16 rounded overflow-hidden bg-black flex-shrink-0 relative ${isCurrent ? "scale-[1.02] shadow-[0_18px_60px_-24px_rgba(255,180,120,0.22)]" : ""} ${isLocked ? "" : "cursor-pointer"}`}
                  >
                    <video
                      src={lvl.url}
                      muted
                      playsInline
                      loop
                      preload="metadata"
                      onLoadedMetadata={(e) => handleLoadedMetadata(lvl.id, e)}
                      className={`w-full h-full object-cover ${isLocked ? "pointer-events-none" : ""}`}
                      onClick={(e) => {
                        // open the player instead of toggling inline playback
                        e.preventDefault();
                        e.stopPropagation();
                        if (!isLocked) setActive(lvl);
                      }}
                    />
                    <div className="absolute left-2 bottom-1 rounded px-1.5 py-0.5 text-xs font-medium bg-black/60 text-white">
                      {durations[lvl.id] ?? lvl.duration ?? "00:00"}
                    </div>
                    {isCompleted && (
                      <span className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-warm/20 text-warm backdrop-blur">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={!isLocked ? () => setActive(lvl) : undefined}
                      disabled={isLocked}
                      aria-disabled={isLocked}
                      className="text-left w-full"
                    >
                      <div className="text-[11px] uppercase tracking-[0.24em] text-foreground/60">
                        Level {lvl.id}
                      </div>
                      <div className="truncate font-medium text-foreground flex items-center gap-2">
                        {lvl.title}
                      </div>
                      <div className="truncate text-[13px] text-foreground/60">{lvl.subtitle}</div>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {state === "locked" ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/60 px-3 py-1 text-sm text-foreground/60">
                      <Lock className="h-4 w-4" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActive(lvl)}
                      aria-label={isCompleted ? "Watch again" : isCurrent ? "Resume" : "Open"}
                      className={`grid h-9 w-9 place-items-center rounded-full border ${isCurrent ? "border-[#3aa87a] bg-[#3aa87a] text-white" : isCompleted ? "border-[#3aa87a]/30 bg-[#3aa87a]/12 text-[#0f2b20]" : "border-primary/10 bg-white/[0.04] text-foreground/90"}`}
                    >
                      <Play className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.li>
            );
          })}
        </div>
      </section>

      <AnimatePresence>
        {active && (
          <VideoPlayer
            level={active}
            completed={completed.has(active.id)}
            onClose={() => setActive(null)}
            onPrev={activeIndex > 0 ? () => setActive(LEVELS[activeIndex - 1]) : undefined}
            onNext={
              activeIndex >= 0 && activeIndex < LEVELS.length - 1
                ? () => setActive(LEVELS[activeIndex + 1])
                : undefined
            }
            onWatchDelta={async (watchedSecondsDelta) => {
              if (watchedSecondsDelta <= 0) return;
              try {
                await saveJourneyProgress({ watchedSecondsDelta, levelId: active.id });
              } catch (error) {
                console.error(error);
              }
            }}
            onComplete={() => {
              void markComplete(active.id);
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

/* ───────── Video player modal ───────── */

function VideoPlayer({
  level,
  completed,
  onClose,
  onPrev,
  onNext,
  onWatchDelta,
  onComplete,
}: {
  level: Level;
  completed: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onWatchDelta: (watchedSecondsDelta: number) => Promise<void>;
  onComplete: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pendingWatchSecondsRef = useRef(0);
  const lastObservedVideoTimeRef = useRef<number | null>(null);
  const isSeekingRef = useRef(false);
  const isFlushingRef = useRef(false);
  const [isWatchThresholdMet, setIsWatchThresholdMet] = useState(false);

  useEffect(() => {
    setIsWatchThresholdMet(false);
  }, [level.id]);

  const collectPlayedVideoSeconds = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const currentVideoTime = Number(video.currentTime || 0);
    const previousVideoTime = lastObservedVideoTimeRef.current;

    if (video.duration > 0 && currentVideoTime / video.duration >= 0.9) {
      setIsWatchThresholdMet(true);
    }

    if (previousVideoTime != null && !video.paused && !video.ended && !isSeekingRef.current) {
      const delta = currentVideoTime - previousVideoTime;
      if (delta > 0) {
        pendingWatchSecondsRef.current += delta;
      }
    }

    lastObservedVideoTimeRef.current = currentVideoTime;
  }, []);

  const flushWatchTime = useCallback(
    async (force: boolean) => {
      if (isFlushingRef.current) return;

      const roundedSeconds = Math.floor(pendingWatchSecondsRef.current);
      const minimumFlushSeconds = force ? 1 : 10;
      if (roundedSeconds < minimumFlushSeconds) return;

      isFlushingRef.current = true;
      pendingWatchSecondsRef.current -= roundedSeconds;
      try {
        await onWatchDelta(roundedSeconds);
      } catch {
        // Restore pending seconds so a later flush can retry.
        pendingWatchSecondsRef.current += roundedSeconds;
      } finally {
        isFlushingRef.current = false;
      }
    },
    [onWatchDelta],
  );

  const pauseTracking = useCallback(() => {
    collectPlayedVideoSeconds();
    lastObservedVideoTimeRef.current = videoRef.current?.currentTime ?? null;
  }, [collectPlayedVideoSeconds]);

  const startTracking = useCallback(() => {
    lastObservedVideoTimeRef.current = videoRef.current?.currentTime ?? 0;
  }, []);

  const startSeeking = useCallback(() => {
    pauseTracking();
    isSeekingRef.current = true;
  }, [pauseTracking]);

  const finishSeeking = useCallback(() => {
    isSeekingRef.current = false;
    lastObservedVideoTimeRef.current = videoRef.current?.currentTime ?? 0;
  }, []);

  const navigateWithFlush = useCallback(
    async (navigateAction?: () => void) => {
      if (!navigateAction) return;
      pauseTracking();
      await flushWatchTime(true);
      navigateAction();
    },
    [flushWatchTime, pauseTracking],
  );

  const closeWithFlush = useCallback(() => {
    pauseTracking();
    void flushWatchTime(true);
    onClose();
  }, [flushWatchTime, onClose, pauseTracking]);

  const handleEnded = useCallback(() => {
    pauseTracking();
    void flushWatchTime(true);
    onComplete();
  }, [flushWatchTime, onComplete, pauseTracking]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeWithFlush();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    const flushInterval = window.setInterval(() => {
      collectPlayedVideoSeconds();
      void flushWatchTime(false);
    }, 5000);

    return () => {
      pauseTracking();
      void flushWatchTime(true);
      window.clearInterval(flushInterval);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [closeWithFlush, collectPlayedVideoSeconds, flushWatchTime, pauseTracking]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-auto py-6 bg-primary-deep/85 backdrop-blur-2xl"
      onClick={closeWithFlush}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl px-4 sm:px-6 max-h-[calc(100vh-80px)]"
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-warm/90">
              Level 0{level.id}
            </p>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl leading-tight tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
              {level.title}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!onPrev}
              onClick={() => void navigateWithFlush(onPrev)}
              className="inline-flex items-center justify-center rounded-full border px-3 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 disabled:border-warm/30 disabled:bg-warm/10 disabled:text-warm/30 border-warm/40 bg-warm/15 text-warm shadow-soft hover:border-warm/60 hover:bg-warm/20"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!onNext}
              onClick={() => void navigateWithFlush(onNext)}
              className="inline-flex items-center justify-center rounded-full border px-3 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 disabled:border-warm/30 disabled:bg-warm/10 disabled:text-warm/30 border-warm/40 bg-warm/15 text-warm shadow-soft hover:border-warm/60 hover:bg-warm/20"
            >
              Next
            </button>
          </div>
        </div>

        <button
          onClick={closeWithFlush}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-primary/10 bg-surface-elevated/90 text-foreground/90 shadow-soft backdrop-blur transition hover:text-foreground hover:border-primary/20"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_50px_140px_-30px_rgba(0,0,0,0.7)] max-h-[calc(100vh-220px)]">
          <video
            ref={videoRef}
            src={level.url}
            controls
            controlsList="nodownload"
            autoPlay
            playsInline
            onTimeUpdate={collectPlayedVideoSeconds}
            onPlay={startTracking}
            onPause={pauseTracking}
            onWaiting={pauseTracking}
            onSeeking={startSeeking}
            onSeeked={finishSeeking}
            onEnded={handleEnded}
            className="w-full h-full object-contain bg-black"
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-foreground/72">
          <span>
            {completed
              ? "Already completed"
              : isWatchThresholdMet
                ? "Ready to complete"
                : "Marks as complete when finished"}
          </span>
          {(completed || isWatchThresholdMet) && (
            <button
              onClick={() => {
                pauseTracking();
                void flushWatchTime(true);
                onComplete();
                onClose();
              }}
              className="inline-flex items-center gap-2 rounded-full border border-warm/30 bg-warm/10 px-3.5 py-1.5 text-warm transition hover:bg-warm/15"
            >
              <Check className="h-3 w-3" /> Mark complete
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProgressRing({
  percent,
  size = 56,
  stroke = 6,
}: {
  percent: number;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="relative" style={{ width: size, height: size }} aria-hidden>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          stroke="rgba(255,255,255,0.06)"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          stroke="#3aa87a"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={`${offset}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-sm font-semibold text-foreground">
        {clamped}%
      </div>
    </div>
  );
}

function ContinueHero({
  completedCount,
  currentTitle,
  onContinue,
}: {
  completedCount: number;
  currentTitle?: string | undefined;
  onContinue: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        backgroundImage:
          'url("https://res.cloudinary.com/dzboz4mwb/image/upload/q_auto/f_auto/v1780246710/ancient_widdoom_1_piozb5.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="relative overflow-hidden rounded-2xl bg-background p-5"
    >
      <div className="relative inline-block max-w-full rounded-xl bg-white/90 p-4">
        <p className="text-[10px] uppercase tracking-[0.28em] text-foreground/50">Continue Journey</p>
        <h3 className="mt-1.5 font-serif text-xl text-foreground">{currentTitle ?? "Your journey"}</h3>
        <p className="mt-1 text-sm text-foreground/60">Pick up where you left off and keep going.</p>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={onContinue}
            className="inline-flex items-center gap-2 rounded-full border border-[#3aa87a] bg-[#3aa87a] px-3 py-2 text-sm text-white"
          >
            <Play className="h-4 w-4" />
            Continue
          </button>
          <div className="text-sm text-foreground/50">
            {completedCount}/{TRACKED_LEVELS} completed
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ReflectionCard removed per user request.
