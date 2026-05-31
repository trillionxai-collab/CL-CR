import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
  Calendar as CalendarIcon,
  GraduationCap,
  Briefcase,
  Rocket,
  Palette,
  Home,
  Compass,
} from "lucide-react";
import { getCurrentUser, saveOnboarding } from "@/lib/auth.functions";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: async () => {
    const user = await getCurrentUser();
    if (!user) throw redirect({ to: "/auth" });
    if (user.onboarding_completed) throw redirect({ to: "/dashboard" });
  },
  component: OnboardingPage,
});

type Gender = "female" | "male" | "non-binary" | "prefer-not-to-say";
type Lifestyle =
  | "student"
  | "working-professional"
  | "entrepreneur"
  | "creative"
  | "homemaker"
  | "exploring";

const GENDERS: { id: Gender; label: string }[] = [
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
  { id: "non-binary", label: "Non-binary" },
  { id: "prefer-not-to-say", label: "Prefer not to say" },
];

const LIFESTYLES: { id: Lifestyle; label: string; sub: string; Icon: typeof Rocket }[] = [
  { id: "student", label: "Student", sub: "Learning & becoming", Icon: GraduationCap },
  { id: "working-professional", label: "Working professional", sub: "Building a career", Icon: Briefcase },
  { id: "entrepreneur", label: "Entrepreneur", sub: "Creating something new", Icon: Rocket },
  { id: "creative", label: "Creative", sub: "Expressing through craft", Icon: Palette },
  { id: "homemaker", label: "Homemaker", sub: "Nurturing the heart of home", Icon: Home },
  { id: "exploring", label: "Exploring life direction", sub: "In transition, listening inward", Icon: Compass },
];

function OnboardingPage() {
  const navigate = useNavigate();

  const [dob, setDob] = useState(""); // yyyy-mm-dd
  const [gender, setGender] = useState<Gender | null>(null);
  const [lifestyle, setLifestyle] = useState<Lifestyle | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const canSubmit = !!(dob && gender && lifestyle && ready && !loading);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const minDate = "1920-01-01";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      await saveOnboarding({
        dateOfBirth: dob,
        gender: gender!,
        lifestyle: lifestyle!,
        openMindConsent: ready,
      });
      setDone(true);
      setTimeout(() => navigate({ to: "/dashboard" }), 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <CinematicBackdrop />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 28, filter: "blur(14px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <Header done={done} />

          <AnimatePresence mode="wait">
            {!done ? (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:p-9 shadow-[0_30px_120px_-30px_rgba(0,0,0,0.6)] backdrop-blur-2xl space-y-9"
              >
                {/* Lifestyle */}
                <Section
                  index={1}
                  title="Which best describes your current lifestyle?"
                  sub="We'll calibrate the experience around the season you're in."
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    {LIFESTYLES.map((l) => (
                      <LifestyleCard
                        key={l.id}
                        active={lifestyle === l.id}
                        onClick={() => setLifestyle(l.id)}
                        label={l.label}
                        sub={l.sub}
                        Icon={l.Icon}
                      />
                    ))}
                  </div>
                </Section>

                {/* Gender */}
                <Section index={2} title="How do you identify?" sub="Choose what feels true to you.">
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    {GENDERS.map((g) => (
                      <SelectChip
                        key={g.id}
                        active={gender === g.id}
                        onClick={() => setGender(g.id)}
                      >
                        {g.label}
                      </SelectChip>
                    ))}
                  </div>
                </Section>

                {/* DOB */}
                <Section index={3} title="When did your story begin?" sub="Your date of birth helps us shape the rhythm of your journey.">
                  <div className="relative">
                    <CalendarIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-warm/70" />
                    <input
                      type="date"
                      value={dob}
                      max={today}
                      min={minDate}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-4 pl-12 pr-4 text-base text-foreground outline-none transition focus:border-warm/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(255,200,140,0.10)] [color-scheme:dark]"
                    />
                  </div>
                </Section>

                {/* Reflection */}
                <Section index={4} title="A quiet vow." sub="Before crossing the threshold.">
                  <button
                    type="button"
                    onClick={() => setReady((r) => !r)}
                    className={`group relative flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all duration-500 ${
                      ready
                        ? "border-warm/50 bg-warm/[0.08] shadow-[0_0_0_4px_rgba(255,200,140,0.10),0_0_40px_-10px_rgba(255,200,140,0.45)]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    <span
                      className={`relative grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-all duration-500 ${
                        ready ? "border-warm bg-warm text-warm-foreground" : "border-white/25 bg-white/5"
                      }`}
                    >
                      <AnimatePresence>
                        {ready && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          >
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {ready && (
                        <motion.span
                          className="absolute inset-0 rounded-full bg-warm/40 blur-md"
                          animate={{ opacity: [0.4, 0.9, 0.4] }}
                          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                        />
                      )}
                    </span>
                    <span className="font-serif text-[15px] sm:text-base leading-relaxed text-foreground/90">
                      I'm ready to begin this journey with an open mind.
                    </span>
                  </button>
                </Section>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-[12.5px] text-red-200"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-warm via-warm to-warm/90 px-7 py-4 text-sm font-medium tracking-wide text-warm-foreground shadow-glow-warm transition disabled:cursor-not-allowed disabled:opacity-50 hover:scale-[1.01]"
                >
                  <span className="absolute inset-0 shimmer" />
                  <span className="relative">
                    {loading ? "Calibrating your journey…" : "Begin Transformation"}
                  </span>
                  {loading ? (
                    <Loader2 className="relative h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
                  )}
                </button>

                <p className="text-center text-[11px] uppercase tracking-[0.28em] text-foreground/40">
                  A personal calibration · Move at your own pace
                </p>
              </motion.form>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="mt-10 flex flex-col items-center text-center"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="relative mb-7 grid h-24 w-24 place-items-center rounded-full bg-warm/20"
                >
                  <motion.span
                    className="absolute inset-0 rounded-full bg-warm/30 blur-3xl"
                    animate={{ opacity: [0.4, 0.95, 0.4], scale: [1, 1.25, 1] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <Sparkles className="relative h-10 w-10 text-warm" strokeWidth={1.4} />
                </motion.div>
                <h2 className="font-serif text-3xl sm:text-4xl tracking-tight">
                  Your calibration is complete.
                </h2>
                <p className="mt-3 text-sm text-foreground/60">
                  The doors are opening. Breathe in…
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}

/* ---------- pieces ---------- */

function Header({ done }: { done: boolean }) {
  return (
    <div className="text-center">
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.32em] text-foreground/65 backdrop-blur"
      >
        <Sparkles className="h-3 w-3 text-warm" /> A Personal Calibration
      </motion.span>
      <motion.h1
        initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="mt-5 font-serif text-4xl sm:text-5xl leading-[1.05] tracking-tight"
      >
        {done ? "Welcome inward." : "Personalize Your Journey"}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="mx-auto mt-4 max-w-lg text-sm sm:text-base leading-relaxed text-foreground/65"
      >
        {done
          ? "We're tuning the experience to who you are."
          : "Help us understand where you are in life so we can create a more meaningful experience."}
      </motion.p>
    </div>
  );
}

function Section({
  index,
  title,
  sub,
  children,
}: {
  index: number;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3.5">
      <div className="flex items-baseline gap-3">
        <span className="font-serif text-[11px] uppercase tracking-[0.32em] text-warm/70">
          0{index}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
      </div>
      <div>
        <h3 className="font-serif text-xl sm:text-2xl leading-snug tracking-tight">{title}</h3>
        <p className="mt-1.5 text-[13px] sm:text-sm text-foreground/55">{sub}</p>
      </div>
      <div className="pt-1">{children}</div>
    </section>
  );
}

function SelectChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border px-4 py-3.5 text-sm transition-all duration-500 ${
        active
          ? "border-warm/50 bg-warm/[0.10] text-foreground shadow-[0_0_0_4px_rgba(255,200,140,0.08),0_0_40px_-10px_rgba(255,200,140,0.45)]"
          : "border-white/10 bg-white/[0.03] text-foreground/75 hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground"
      }`}
    >
      {active && (
        <motion.span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-warm/10 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
      <span className="relative">{children}</span>
    </button>
  );
}

function LifestyleCard({
  active,
  onClick,
  label,
  sub,
  Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sub: string;
  Icon: typeof Rocket;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      className={`group relative overflow-hidden rounded-2xl border px-4 py-4 text-left transition-all duration-500 ${
        active
          ? "border-warm/50 bg-warm/[0.10] shadow-[0_0_0_4px_rgba(255,200,140,0.08),0_0_50px_-12px_rgba(255,200,140,0.55)]"
          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
      }`}
    >
      {active && (
        <motion.span
          aria-hidden
          className="absolute -inset-px rounded-2xl bg-gradient-to-br from-warm/15 via-transparent to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
      <div className="relative flex items-start gap-3.5">
        <span
          className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors ${
            active
              ? "border-warm/40 bg-warm/20 text-warm"
              : "border-white/10 bg-white/[0.04] text-foreground/70 group-hover:text-foreground"
          }`}
        >
          {active && (
            <motion.span
              className="absolute inset-0 rounded-xl bg-warm/40 blur-lg"
              animate={{ opacity: [0.35, 0.7, 0.35] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <Icon className="relative h-4.5 w-4.5" strokeWidth={1.6} />
        </span>
        <div className="min-w-0">
          <p className={`font-serif text-[15px] leading-snug tracking-tight ${active ? "text-foreground" : "text-foreground/85"}`}>
            {label}
          </p>
          <p className="mt-0.5 text-[12px] text-foreground/50">{sub}</p>
        </div>
      </div>
    </motion.button>
  );
}

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
