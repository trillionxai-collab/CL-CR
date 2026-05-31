import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Lock, Play, Check, Sparkles, X, LogOut } from "lucide-react";
import { getJourneyProgress, saveJourneyProgress } from "@/lib/journey.functions";

type Level = {
  id: number;
  title: string;
  subtitle: string;
  url: string;
};

const LEVELS: Level[] = [
  {
    id: 1,
    title: "A Better Way to Feel",
    subtitle: "The opening breath.",
    url: "https://res.cloudinary.com/dzboz4mwb/video/upload/v1779300554/LEVEL_-_1_A_Better_Way_to_Feel_mjjgis.mp4",
  },
  {
    id: 2,
    title: "Is Everything Okay?",
    subtitle: "A quiet inquiry inward.",
    url: "https://res.cloudinary.com/dzboz4mwb/video/upload/v1779300561/LEVEL_-_2_Is_Everything_Okay__lbuja7.mp4",
  },
  {
    id: 3,
    title: "The World Has Changed",
    subtitle: "Witnessing the shift.",
    url: "https://res.cloudinary.com/dzboz4mwb/video/upload/v1779300566/LEVEL_-_3_The_world_has_changed_qun1nj.mp4",
  },
  {
    id: 4,
    title: "The Hidden Damage",
    subtitle: "What lives beneath the surface.",
    url: "https://res.cloudinary.com/dzboz4mwb/video/upload/v1779300551/LEVEL_-_4_The_Hidden_Damage_yszd35.mp4",
  },
  {
    id: 5,
    title: "The Healing System",
    subtitle: "The medicine within.",
    url: "https://res.cloudinary.com/dzboz4mwb/video/upload/v1779300572/LEVEL_-_5_The_Healing_System_u7cnw8.mp4",
  },
  {
    id: 6,
    title: "The Reconnection",
    subtitle: "Reuniting with your core.",
    url: "https://res.cloudinary.com/dzboz4mwb/video/upload/v1780222780/LEVEL_6_-_The_Reconnection_bu1wcj.mp4",
  },
];

const STORAGE_KEY = "hrj_completed_levels_v1";
const TRACKED_LEVELS = LEVELS.length;

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();

  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [active, setActive] = useState<Level | null>(null);

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

  function stateOf(id: number): "completed" | "current" | "unlocked" | "locked" {
    if (completed.has(id)) return "completed";
    if (id === currentLevelId) return "current";
    if (id < currentLevelId) return "unlocked";
    return "locked";
  }

  function handleGoHome() {
    navigate({ to: "/" });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <CinematicBackdrop />

      {/* top bar */}
      <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-6 sm:pt-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-surface-elevated/80 px-3 py-1 text-[10px] uppercase tracking-[0.32em] text-foreground/80 shadow-soft backdrop-blur">
          <Sparkles className="h-3 w-3 text-warm" /> The Reconnection
        </span>
        <button
          onClick={handleGoHome}
          aria-label="Go to homepage"
          className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-surface-elevated/80 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.22em] text-foreground/80 shadow-soft backdrop-blur transition hover:text-foreground hover:border-primary/20"
        >
          <LogOut className="h-3 w-3" />
          <span className="hidden sm:inline">Home</span>
        </button>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto w-full max-w-3xl px-5 pt-12 sm:pt-20 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="text-[11px] uppercase tracking-[0.36em] text-foreground/70"
        >
          {greeting()} · {firstName(user)}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="mt-5 font-serif text-4xl sm:text-6xl leading-[1.02] tracking-tight"
        >
          Welcome back,{" "}
          <span className="text-[#038a75]">{firstName(user)}.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, delay: 0.3 }}
          className="mx-auto mt-5 max-w-xl text-[15px] sm:text-base leading-relaxed text-foreground/78"
        >
          Your journey toward reconnection continues. Breathe in — the next
          threshold is ready when you are.
        </motion.p>
      </section>

      {/* Analytics */}
      <section className="relative z-10 mx-auto mt-12 sm:mt-16 grid w-full max-w-3xl grid-cols-1 gap-3 px-5 sm:grid-cols-2 sm:gap-5">
        <AnalyticsCard
          label="Journey Progress"
          value={`${progressPct}%`}
          accent={
            <div className="relative mt-4 h-[3px] w-full overflow-hidden rounded-full bg-primary/10">
              <motion.span
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-warm/70 via-warm to-warm/70 shadow-[0_0_20px_rgba(255,200,140,0.7)]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          }
          delay={0.1}
        />
        <AnalyticsCard
          label="Levels Completed"
          value={`${completed.size}/${TRACKED_LEVELS}`}
          accent={
            <div className="mt-4 flex gap-1.5">
              {Array.from({ length: TRACKED_LEVELS }).map((_, i) => {
                const done = i < completed.size;
                return (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.06 }}
                    className={`h-1.5 flex-1 rounded-full ${
                      done
                        ? "bg-warm shadow-[0_0_12px_rgba(255,200,140,0.7)]"
                        : "bg-primary/12"
                    }`}
                  />
                );
              })}
            </div>
          }
          delay={0.2}
        />
      </section>

      {/* Journey */}
      <section className="relative z-10 mx-auto mt-20 sm:mt-28 w-full max-w-3xl px-5 pb-32">
        <div className="mb-9 flex items-baseline gap-3">
          <span className="font-serif text-[11px] uppercase tracking-[0.32em] text-warm/85">
            The Journey
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
        </div>

        <ol className="space-y-5 sm:space-y-6">
          {LEVELS.map((lvl, i) => {
            const state = stateOf(lvl.id);
            return (
              <LevelCard
                key={lvl.id}
                level={lvl}
                state={state}
                index={i}
                onOpen={() => setActive(lvl)}
              />
            );
          })}
        </ol>
      </section>

      <AnimatePresence>
        {active && (
          <VideoPlayer
            level={active}
            completed={completed.has(active.id)}
            onClose={() => setActive(null)}
            onWatchDelta={async (watchedSecondsDelta) => {
              if (watchedSecondsDelta <= 0) return;
              try {
                await saveJourneyProgress({ watchedSecondsDelta });
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

/* ───────── pieces ───────── */

function firstName(u: { first_name?: string | null } | undefined) {
  return (u?.first_name || "Friend").split(" ")[0];
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "A quiet night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "A quiet night";
}

function AnalyticsCard({
  label,
  value,
  accent,
  delay = 0,
}: {
  label: string;
  value: string;
  accent?: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay }}
      className="relative overflow-hidden rounded-3xl border border-primary/10 bg-surface-elevated/80 p-6 sm:p-7 shadow-soft backdrop-blur-2xl"
    >
      <div className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full bg-warm/10 blur-3xl" />
      <p className="text-[10px] uppercase tracking-[0.32em] text-foreground/68">
        {label}
      </p>
      <p className="mt-3 font-serif text-5xl sm:text-6xl leading-none tracking-tight text-[#038a75]">
        {value}
      </p>
      {accent}
    </motion.div>
  );
}

function LevelCard({
  level,
  state,
  index,
  onOpen,
}: {
  level: Level;
  state: "completed" | "current" | "unlocked" | "locked";
  index: number;
  onOpen: () => void;
}) {
  const locked = state === "locked";
  const current = state === "current";
  const completed = state === "completed";

  return (
    <motion.li
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
    >
      <button
        type="button"
        onClick={locked ? undefined : onOpen}
        disabled={locked}
        className={`group relative block w-full overflow-hidden rounded-[28px] border text-left transition-all duration-700 ${
          current
            ? "border-warm/45 bg-surface-elevated/85 shadow-[0_0_0_1px_rgba(255,200,140,0.18),0_40px_120px_-30px_rgba(255,200,140,0.25)]"
            : completed
              ? "border-primary/10 bg-surface-elevated/78 shadow-soft"
              : locked
                ? "border-border/70 bg-surface/60 cursor-not-allowed"
                : "border-primary/10 bg-surface-elevated/74 shadow-soft hover:border-primary/20 hover:bg-surface-elevated/92"
        }`}
      >
        {current && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-[28px] bg-gradient-to-br from-warm/25 via-transparent to-transparent"
            animate={{ opacity: [0.4, 0.85, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <div className="relative flex flex-col gap-0 sm:flex-row">
          {/* Thumbnail */}
          <div className="relative aspect-video w-full overflow-hidden sm:aspect-auto sm:h-auto sm:w-[42%] sm:min-h-[180px]">
            <video
              src={level.url}
              muted
              playsInline
              preload="metadata"
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
                locked ? "blur-md opacity-40 scale-110" : "opacity-90 group-hover:scale-[1.04]"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-deep/85 via-primary-deep/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/80 via-transparent to-transparent" />

            {/* state badge over thumbnail */}
            <div className="absolute inset-0 grid place-items-center">
              <ThumbnailBadge state={state} />
            </div>

            <span className="absolute left-4 top-4 font-serif text-[11px] uppercase tracking-[0.32em] text-warm/85">
              Level 0{level.id}
            </span>
          </div>

          {/* Text */}
          <div className="flex flex-1 flex-col justify-center gap-2 p-5 sm:p-7">
            <div className="flex items-center gap-2">
              <StateChip state={state} />
            </div>
            <h3
              className={`font-serif text-2xl sm:text-3xl leading-[1.1] tracking-tight ${
                locked ? "text-foreground/58" : "text-foreground"
              }`}
            >
              {level.title}
            </h3>
            <p
              className={`text-[13.5px] leading-relaxed ${
                locked ? "text-foreground/48" : "text-foreground/74"
              }`}
            >
              {level.subtitle}
            </p>

            {!locked && (
              <div className="mt-3 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.24em] text-warm/85">
                {completed ? "Watch again" : current ? "Enter the chapter" : "Open chapter"}
                <span className="inline-block h-px w-6 bg-warm/60 transition-all group-hover:w-10" />
              </div>
            )}
          </div>
        </div>
      </button>
    </motion.li>
  );
}

function ThumbnailBadge({
  state,
}: {
  state: "completed" | "current" | "unlocked" | "locked";
}) {
  if (state === "locked") {
    return (
      <span className="grid h-14 w-14 place-items-center rounded-full border border-primary/10 bg-surface-elevated/85 shadow-soft backdrop-blur">
        <Lock className="h-5 w-5 text-foreground/70" strokeWidth={1.6} />
      </span>
    );
  }
  if (state === "completed") {
    return (
      <span className="grid h-14 w-14 place-items-center rounded-full border border-warm/30 bg-warm/15 text-warm backdrop-blur">
        <Check className="h-6 w-6" strokeWidth={2} />
      </span>
    );
  }
  return (
    <span className="relative grid h-16 w-16 place-items-center rounded-full border border-warm/40 bg-warm/15 text-warm backdrop-blur transition-transform duration-500 group-hover:scale-105">
      <motion.span
        className="absolute inset-0 rounded-full bg-warm/30 blur-xl"
        animate={{ opacity: [0.4, 0.85, 0.4], scale: [1, 1.15, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <Play className="relative h-6 w-6 translate-x-0.5" fill="currentColor" strokeWidth={0} />
    </span>
  );
}

function StateChip({
  state,
}: {
  state: "completed" | "current" | "unlocked" | "locked";
}) {
  const map = {
    completed: { label: "Completed", cls: "text-warm/90 border-warm/25 bg-warm/10" },
    current: { label: "In motion", cls: "text-warm border-warm/35 bg-warm/15" },
    unlocked: { label: "Unlocked", cls: "text-foreground/82 border-primary/10 bg-surface-elevated/85" },
    locked: { label: "Locked", cls: "text-foreground/58 border-border/70 bg-surface/70" },
  } as const;
  const { label, cls } = map[state];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.24em] backdrop-blur ${cls}`}
    >
      {label}
    </span>
  );
}

/* ───────── Video player modal ───────── */

function VideoPlayer({
  level,
  completed,
  onClose,
  onWatchDelta,
  onComplete,
}: {
  level: Level;
  completed: boolean;
  onClose: () => void;
  onWatchDelta: (watchedSecondsDelta: number) => Promise<void>;
  onComplete: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pendingWatchSecondsRef = useRef(0);
  const lastObservedVideoTimeRef = useRef<number | null>(null);
  const isSeekingRef = useRef(false);
  const isFlushingRef = useRef(false);

  const collectPlayedVideoSeconds = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const currentVideoTime = Number(video.currentTime || 0);
    const previousVideoTime = lastObservedVideoTimeRef.current;

    if (
      previousVideoTime != null &&
      !video.paused &&
      !video.ended &&
      !isSeekingRef.current
    ) {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary-deep/85 backdrop-blur-2xl"
      onClick={closeWithFlush}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl px-4 sm:px-6"
      >
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-warm/85">
              Level 0{level.id}
            </p>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl leading-tight tracking-tight text-foreground">
              {level.title}
            </h2>
          </div>
          <button
            onClick={closeWithFlush}
            aria-label="Close"
            className="grid h-10 w-10 place-items-center rounded-full border border-primary/10 bg-surface-elevated/80 text-foreground/80 shadow-soft backdrop-blur transition hover:text-foreground hover:border-primary/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_50px_140px_-30px_rgba(0,0,0,0.7)]">
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
            className="aspect-video w-full bg-black"
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-foreground/72">
          <span>{completed ? "Already completed" : "Marks as complete when finished"}</span>
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
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ───────── backdrop ───────── */

function CinematicBackdrop() {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,210,160,0.10),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(120,180,200,0.10),transparent_60%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary-deep/40" />
      <motion.div
        aria-hidden
        className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-warm/20 blur-[120px]"
        animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.08, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute bottom-[-160px] right-[-80px] h-[460px] w-[460px] rounded-full bg-primary/30 blur-[140px]"
        animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.12, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
      <motion.div
        aria-hidden
        className="absolute top-1/3 left-[-120px] h-[360px] w-[360px] rounded-full bg-secondary/20 blur-[120px]"
        animate={{ opacity: [0.2, 0.45, 0.2] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.9' /></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />
    </>
  );
}
