import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Lock, Play, Check, LogOut } from "lucide-react";
import { LEVELS, TRACKED_LEVELS, formatDuration } from "@/lib/levels";
import { useJourneyState } from "@/lib/useJourneyState";
import ecoherbLogo from "@/assets/ecoherb.png";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { completed, currentLevelId, stateOf, progressPct } = useJourneyState();
  const [durations, setDurations] = useState<Record<number, string>>({});

  function openLevel(id: number) {
    navigate({ to: "/watch/$id", params: { id: String(id) } });
  }

  function handleLoadedMetadata(id: number, e: any) {
    try {
      const seconds = Math.floor((e.currentTarget?.duration || 0) as number);
      if (!Number.isFinite(seconds)) return;
      setDurations((prev) => ({ ...prev, [id]: formatDuration(seconds) }));
    } catch (err) {
      // ignore
    }
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
          onContinue={() => openLevel(currentLevelId <= TRACKED_LEVELS ? currentLevelId : LEVELS[LEVELS.length - 1].id)}
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
                  if (!isLocked) openLevel(lvl.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
                    e.preventDefault();
                    if (!isLocked) openLevel(lvl.id);
                  }
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    onClick={(e) => {
                      // prevent the row click from firing twice
                      e.stopPropagation();
                      if (!isLocked) openLevel(lvl.id);
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
                        if (!isLocked) openLevel(lvl.id);
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
                      onClick={!isLocked ? () => openLevel(lvl.id) : undefined}
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
                      onClick={() => openLevel(lvl.id)}
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

    </main>
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
