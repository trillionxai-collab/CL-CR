import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import tnImage from "@/assets/TN1.webp";
import { LEVELS, TRACKED_LEVELS } from "@/lib/levels";
import { useJourneyState } from "@/lib/useJourneyState";
import { useVideoWatchTracking } from "@/hooks/useVideoWatchTracking";
import { saveJourneyProgress } from "@/lib/journey.functions";

export const Route = createFileRoute("/watch/$id")({
  component: WatchPage,
});

function WatchPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const levelId = Number(id);
  const level = LEVELS.find((l) => l.id === levelId);

  const { completed, stateOf, markComplete } = useJourneyState();

  const { videoRef, videoHandlers } = useVideoWatchTracking({
    videoId: levelId,
    onWatchDelta: async (watchedSecondsDelta) => {
      if (watchedSecondsDelta <= 0) return;
      try {
        await saveJourneyProgress({ watchedSecondsDelta, levelId });
      } catch (error) {
        console.error(error);
      }
    },
    onComplete: () => {
      void markComplete(levelId);
    },
  });

  if (!level) {
    return (
      <main className="min-h-screen bg-background text-foreground grid place-items-center px-6">
        <div className="text-center max-w-md">
          <p className="text-[11px] uppercase tracking-[0.32em] text-foreground/55">Level {id}</p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight">This chapter is being prepared.</h1>
        </div>
      </main>
    );
  }

  const nextLevel = LEVELS.find((l) => l.id === level.id + 1);
  const isCompleted = completed.has(level.id);

  return (
    <main className="min-h-screen bg-background text-foreground pb-10">
      {/* Video player — 100% width, ~16:9 */}
      <div className="relative w-full aspect-video bg-black">
        <button
          type="button"
          onClick={() => navigate({ to: "/dashboard" })}
          aria-label="Back to dashboard"
          className="absolute left-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <video
          ref={videoRef}
          key={level.id}
          src={level.url}
          controls
          controlsList="nodownload"
          autoPlay
          playsInline
          {...videoHandlers}
          className="h-full w-full object-contain bg-black"
        />
      </div>

      {/* Level info */}
      <section className="px-5 py-4">
        <p className="text-[11px] uppercase tracking-[0.28em] text-foreground/55">
          Level {level.id} of {TRACKED_LEVELS}
        </p>
        <h1 className="mt-2 font-serif text-2xl leading-tight tracking-tight text-foreground">
          {level.title}
        </h1>
        <p className="mt-2.5 text-sm text-foreground/65">{level.subtitle}</p>
        <p className="mt-3 text-xs text-foreground/50">
          {level.duration ?? "00:00"} · {isCompleted ? "Completed" : "In progress"}
        </p>
      </section>

      {/* Progress indicator — 7 segments */}
      <section className="px-5">
        <div className="flex w-full gap-1.5">
          {LEVELS.map((lvl) => {
            const segState = stateOf(lvl.id);
            const isSegCompleted = segState === "completed";
            const isSegCurrent = lvl.id === level.id;
            return (
              <div
                key={lvl.id}
                className={`h-[3px] flex-1 rounded-full ${
                  isSegCompleted
                    ? "bg-[#3aa87a]"
                    : isSegCurrent
                      ? "bg-[#3aa87a]/60"
                      : "bg-border/50"
                }`}
              />
            );
          })}
        </div>
      </section>

      {/* Up Next */}
      {nextLevel && (
        <section className="mt-6 px-5">
          <h2 className="text-sm font-medium text-foreground/80 mb-3">Up Next</h2>
          <button
            type="button"
            onClick={() => navigate({ to: "/watch/$id", params: { id: String(nextLevel.id) } })}
            className="flex w-full items-center gap-3 rounded-2xl border border-border/40 bg-background p-2.5 text-left"
          >
            <div className="w-[42%] aspect-video flex-shrink-0 overflow-hidden rounded-lg bg-black">
              <video
                src={nextLevel.url}
                muted
                loop
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.24em] text-foreground/50">
                Level {nextLevel.id}
              </p>
              <p className="truncate font-medium text-foreground">{nextLevel.title}</p>
              <p className="truncate text-xs text-foreground/55">{nextLevel.subtitle}</p>
            </div>
            <ChevronRight className="h-5 w-5 flex-shrink-0 text-foreground/40" />
          </button>
        </section>
      )}

      {/* Your Journey */}
      <section className="mt-6 px-5">
        <h2 className="text-sm font-medium text-foreground/80 mb-3">Your Journey</h2>
        <div className="flex items-center justify-between">
          <p className="text-sm text-foreground/60">
            {completed.size} / {TRACKED_LEVELS} Completed
          </p>
          <div className="flex items-center gap-1.5">
            {LEVELS.map((lvl) => {
              const isDone = completed.has(lvl.id);
              return (
                <span
                  key={lvl.id}
                  className={`grid h-3.5 w-3.5 place-items-center rounded-full border ${
                    isDone
                      ? "border-[#3aa87a] bg-[#3aa87a] text-white"
                      : "border-border/60 bg-transparent"
                  }`}
                >
                  {isDone && <Check className="h-2 w-2" />}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      {/* Personal Guidance */}
      <section className="mt-7 px-5">
        <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-surface/60 p-3 min-h-[190px] sm:min-h-[200px]">
          <div className="w-[28%] flex-shrink-0 self-stretch rounded-xl overflow-hidden">
            <img src={tnImage} alt="Ayurveda expert" className="h-full w-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] uppercase tracking-[0.24em] text-[#3aa87a] font-medium">Online Consultation</p>
            <p className="mt-1.5 font-serif text-base leading-snug text-foreground">
              Awaken Your Life with the Magic of Cannabis
            </p>
            <p className="mt-1.5 text-xs text-foreground/55">
              A one-on-one session with our ayurvedic expert Sree Thampi Nagarjuna to guide your path of healing.
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="rounded px-1.5 py-0.5 text-[9px] font-medium bg-[#3aa87a]/15 text-[#3aa87a] uppercase tracking-wide">Malayalam</span>
              <span className="rounded px-1.5 py-0.5 text-[9px] font-medium bg-[#3aa87a]/15 text-[#3aa87a] uppercase tracking-wide">English</span>
            </div>
          </div>
          <div className="w-[22%] flex-shrink-0 flex flex-col items-end justify-center gap-2">
            <a
              href="https://rzp.io/rzp/5YGdwxZ"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#3aa87a] px-3 py-1.5 text-xs font-medium text-white whitespace-nowrap"
            >
              Book Now
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
