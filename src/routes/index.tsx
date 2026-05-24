import { createFileRoute } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  Sparkles,
  Waves,
  Brain,
  HeartPulse,
  Eye,
  Leaf,
  Compass,
  Users,
  MessageCircle,
  Sun,
  Moon,
  CircleDot,
  Lock,
} from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import natureImg from "@/assets/nature.jpg";
import collectiveImg from "@/assets/collective.jpg";
import { Countdown } from "@/components/Countdown";
import { Reveal } from "@/components/Reveal";

const LOGO_URL = "https://res.cloudinary.com/dzboz4mwb/image/upload/v1779428349/CL-Logo_2_qsyn5h.png";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "The Human Reconnection Journey — A Cinematic Experience" },
      {
        name: "description",
        content:
          "A transformational 6-level experience exploring disconnection, awareness, healing, and reconnection with self and nature. Free for a limited time.",
      },
      { property: "og:title", content: "The Human Reconnection Journey" },
      {
        property: "og:description",
        content: "A cinematic 6-level transformation. Free for a limited time.",
      },
    ],
  }),
});

function Landing() {
  return (
    <main className="relative overflow-x-hidden bg-background text-foreground">
      <Nav />
      <Hero />
      <Disconnect />
      <Journey />
      <Discover />
      <WhyMatters />
      <Offer />
      <Community />
      <FinalCTA />
      <Footer />
    </main>
  );
}

/* ---------------- NAV ---------------- */
function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto mt-4 md:mt-6 max-w-6xl px-4">
        <div className="glass rounded-full px-4 md:px-6 py-2.5 flex items-center justify-between shadow-soft">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="relative h-7 w-7 rounded-full bg-gradient-ocean grid place-items-center shadow-glow">
              <CircleDot className="h-3.5 w-3.5 text-primary-foreground" />
            </span>
            <span className="font-display text-[15px] tracking-tight">Reconnection</span>
          </a>
          <nav className="hidden md:flex items-center gap-7 text-[13px] text-muted-foreground">
            <a href="#journey" className="hover:text-foreground transition">Journey</a>
            <a href="#discover" className="hover:text-foreground transition">Discover</a>
            <a href="#why" className="hover:text-foreground transition">Why</a>
            <a href="#community" className="hover:text-foreground transition">Community</a>
          </nav>
          <a
            href="#offer"
            className="group inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-[13px] font-medium shadow-soft hover:bg-primary-deep transition"
          >
            Begin
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </header>
  );
}

/* ---------------- HERO ---------------- */
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <section id="top" ref={ref} className="relative min-h-[100svh] w-full overflow-hidden">
      {/* Cinematic background */}
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img
          src={heroImg}
          alt="A lone figure standing in a misty ocean at dawn"
          width={1920}
          height={1080}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-deep/40 via-primary/30 to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-primary-deep/30" />
      </motion.div>

      {/* Glow orbs */}
      <div className="absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-secondary/30 blur-[120px] animate-float-slow" />
      <div className="absolute -right-32 top-1/2 h-96 w-96 rounded-full bg-warm/30 blur-[140px] animate-float-slow" style={{ animationDelay: "2s" }} />

      <motion.div style={{ opacity }} className="relative z-10 mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center px-5 pt-32 pb-20 text-center">
        <motion.img
          src={LOGO_URL}
          alt="The Human Reconnection Journey logo"
          initial={{ opacity: 0, y: -10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.05 }}
          className="mb-6 h-16 md:h-20 w-auto object-contain drop-shadow-[0_0_30px_rgba(255,220,170,0.35)] shadow-none opacity-100"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="glass-dark inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-warm"
        >
          <Sparkles className="h-3 w-3" />
          A Cinematic Awakening
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40, filter: "blur(20px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          className="mt-6 font-display text-[clamp(2.5rem,7vw,6.5rem)] font-light leading-[0.95] tracking-tight text-gradient-warm"
        >
          The Human <br className="hidden sm:block" />
          <em className="not-italic font-extralight italic-tight">Reconnection</em> Journey
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="mt-8 max-w-2xl text-base md:text-lg leading-relaxed text-warm/90"
        >
          A transformational 6-level experience exploring human disconnection, awareness,
          consciousness, healing, and reconnection with self and nature.
        </motion.p>

        {/* Price */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.2 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm"
        >
          <span className="max-w-2xl text-base md:text-lg leading-relaxed text-warm/90 mt-[15px]">₹1,999</span>
          <span className="glass-dark rounded-full px-3.5 py-1.5 text-warm font-medium tracking-wide">
            FREE
          </span>
          <span className="text-warm/70">· Limited Time Free Access</span>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.4 }}
          className="mt-8 text-warm"
        >
          <Countdown minutes={10} />
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.6 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-3"
        >
          <a
            href="/auth"
            className="group relative inline-flex items-center gap-2 rounded-full bg-warm text-warm-foreground px-7 py-3.5 text-sm font-medium shadow-glow-warm transition hover:scale-[1.02] animate-pulse-glow overflow-hidden"
          >
            <span className="absolute inset-0 shimmer" />
            <span className="relative">Begin The Journey</span>
            <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#journey"
            className="text-sm text-warm/80 hover:text-warm transition inline-flex items-center gap-1.5 px-4 py-3"
          >
            Explore The Experience <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-warm/60"
        >
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-8 w-px bg-gradient-to-b from-warm/60 to-transparent"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ---------------- DISCONNECT ---------------- */
function Disconnect() {
  const items = [
    { icon: Waves, label: "Overstimulation" },
    { icon: Brain, label: "Mental Fatigue" },
    { icon: HeartPulse, label: "Emotional Numbness" },
    { icon: Sun, label: "Loss of Stillness" },
    { icon: Moon, label: "Restless Sleep" },
    { icon: Leaf, label: "Nature Disconnect" },
  ];

  return (
    <section className="relative py-32 md:py-44 px-5">
      <div className="absolute inset-0 bg-gradient-warm" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[500px] w-[500px] bg-gradient-glow rounded-full opacity-50" />
      <div className="relative mx-auto max-w-5xl">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-secondary text-center">Chapter One</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-5 font-display text-[clamp(2rem,5vw,4rem)] font-light leading-[1.05] text-center max-w-4xl mx-auto text-gradient-ocean">
            We have everything. <br /> And feel nothing.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-8 max-w-2xl mx-auto text-center text-[17px] leading-relaxed text-muted-foreground">
            The modern human is overstimulated, overconnected, and quietly drifting from
            themselves. Every notification a small interruption. Every day a louder version
            of yesterday. Somewhere along the way, the signal became noise.
          </p>
        </Reveal>

        <div className="mt-20 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {items.map((it, i) => (
            <Reveal key={it.label} delay={i * 0.06}>
              <div className="group relative overflow-hidden rounded-2xl bg-surface-elevated border border-border/60 p-6 shadow-soft hover:shadow-elevated transition-all duration-500">
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-secondary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <it.icon className="h-5 w-5 text-secondary" strokeWidth={1.4} />
                <p className="mt-6 font-display text-lg text-foreground">{it.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- JOURNEY ---------------- */
function Journey() {
  const levels = [
    { n: "01", t: "A Better Way to Feel", d: "Returning to the body. Breath, posture, presence — the doorway home.", icon: HeartPulse },
    { n: "02", t: "Is Everything Okay?", d: "The quiet question beneath the noise. Honesty with the nervous system.", icon: Waves },
    { n: "03", t: "The World Has Changed", d: "How modern life rewrote what it means to be human.", icon: Brain },
    { n: "04", t: "The Hidden Damage", d: "The invisible wounds we carry without knowing their names.", icon: Eye },
    { n: "05", t: "The Healing System", d: "Ancient and modern wisdom — the architecture of return.", icon: Sparkles },
    { n: "06", t: "The Reconnection", d: "Self. Nature. Consciousness. Coming home — fully, finally.", icon: Leaf },
  ];

  return (
    <section id="journey" className="relative py-32 md:py-44 px-5 bg-gradient-ocean text-primary-foreground overflow-hidden">
      <div className="absolute inset-0 noise" />
      <div className="absolute top-1/2 -left-40 h-[400px] w-[400px] rounded-full bg-secondary/40 blur-[120px]" />
      <div className="absolute bottom-0 -right-40 h-[400px] w-[400px] rounded-full bg-warm/20 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-warm text-center">The Path</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-5 font-display text-[clamp(2rem,5vw,4rem)] font-light leading-[1.05] text-center text-gradient-warm">
            Six levels. <br />One descent inward.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-xl mx-auto text-center text-warm/70 leading-relaxed">
            A guided architecture from sensation to consciousness — each level deepening
            what the last one opened.
          </p>
        </Reveal>

        <div className="mt-20 relative">
          {/* Connecting line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-warm/30 to-transparent hidden md:block" />

          <div className="space-y-6 md:space-y-10">
            {levels.map((lv, i) => (
              <Reveal key={lv.n} delay={i * 0.08}>
                <div className={`md:grid md:grid-cols-2 md:gap-12 items-center ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
                  <div className={`relative ${i % 2 ? "md:text-left md:pl-12" : "md:text-right md:pr-12"}`}>
                    <div className="glass-dark rounded-3xl p-7 md:p-9 shadow-elevated group hover:scale-[1.01] transition-transform duration-500">
                      <div className={`flex items-center gap-3 ${i % 2 ? "" : "md:justify-end"}`}>
                        <span className="font-mono text-xs text-warm/60 tracking-wider">{lv.n}</span>
                        <div className="h-px flex-1 bg-warm/20 max-w-[60px]" />
                        <lv.icon className="h-4 w-4 text-warm" strokeWidth={1.4} />
                      </div>
                      <h3 className="mt-4 font-display text-2xl md:text-3xl font-light text-warm">{lv.t}</h3>
                      <p className="mt-3 text-warm/70 text-sm md:text-base leading-relaxed">{lv.d}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex justify-center relative">
                    <div className="relative h-3 w-3 rounded-full bg-warm shadow-glow-warm">
                      <div className="absolute inset-0 rounded-full bg-warm animate-ping opacity-40" />
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- DISCOVER ---------------- */
function Discover() {
  const cards = [
    { t: "The Human System", d: "Body, mind, breath — as one living organism.", icon: Compass },
    { t: "Nervous System", d: "How safety becomes the foundation of awareness.", icon: Waves },
    { t: "Consciousness", d: "Beyond identity. Beyond conditioning.", icon: Eye },
    { t: "Modern Conditioning", d: "The invisible scripts shaping your day.", icon: Brain },
    { t: "Healing Systems", d: "Ancient and modern wisdom, woven together.", icon: HeartPulse },
    { t: "Awareness Practice", d: "Subtle, daily, transformational.", icon: Sparkles },
    { t: "Reconnection with Nature", d: "Remembering you are not separate from it.", icon: Leaf },
    { t: "Emotional Patterns", d: "Naming, feeling, releasing — without story.", icon: Sun },
  ];

  return (
    <section id="discover" className="relative py-32 md:py-44 px-5 bg-background">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-secondary text-center">What You Will Discover</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-5 font-display text-[clamp(2rem,5vw,4rem)] font-light leading-[1.05] text-center text-gradient-ocean">
            Knowledge that returns <br /> you to yourself.
          </h2>
        </Reveal>

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {cards.map((c, i) => (
            <Reveal key={c.t} delay={i * 0.05}>
              <div className="group relative h-full overflow-hidden rounded-2xl bg-card border border-border/60 p-6 shadow-soft hover:shadow-elevated hover:-translate-y-1 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/0 to-secondary/0 group-hover:from-secondary/5 group-hover:to-warm/10 transition-all duration-700" />
                <div className="relative">
                  <div className="h-10 w-10 rounded-xl bg-gradient-ocean grid place-items-center shadow-soft">
                    <c.icon className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-5 font-display text-lg text-foreground">{c.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- WHY MATTERS ---------------- */
function WhyMatters() {
  return (
    <section id="why" className="relative py-32 md:py-48 px-5 overflow-hidden">
      <div className="absolute inset-0">
        <img src={natureImg} alt="" loading="lazy" className="h-full w-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/40 to-background" />
      </div>
      <div className="relative mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-secondary">Why This Journey Matters</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-6 font-display text-[clamp(2rem,5.5vw,4.5rem)] font-light leading-[1.05] text-gradient-ocean">
            You are not broken. <br /> You are disconnected.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-8 text-lg leading-relaxed text-foreground/80">
            The exhaustion is not a flaw in you — it is the natural response of a being who
            has been asked to live in ways the human system was never designed for.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            Reconnection is not a destination. It is a remembering. Of breath. Of body. Of
            silence. Of the quiet aliveness that has been waiting beneath the noise.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- OFFER ---------------- */
function Offer() {
  return (
    <section id="offer" className="relative py-28 md:py-40 px-5">
      <div className="absolute inset-0 bg-gradient-warm" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[600px] bg-gradient-glow opacity-40" />

      <div className="relative mx-auto max-w-3xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-ocean p-8 md:p-14 text-primary-foreground shadow-elevated noise">
            <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-warm/20 blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-secondary/40 blur-[80px]" />

            <div className="relative text-center">
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-warm">
                <span className="h-1.5 w-1.5 rounded-full bg-warm animate-pulse" />
                Limited Time
              </span>

              <h2 className="mt-6 font-display text-[clamp(2rem,5vw,3.75rem)] font-light leading-[1.05] text-gradient-warm">
                A journey worth ₹1,999 <br /> offered today, freely.
              </h2>

              <div className="mt-8 flex items-baseline justify-center gap-4">
                <span className="text-2xl line-through text-warm/40">₹1,999</span>
                <span className="font-display text-5xl md:text-6xl font-light text-warm">FREE</span>
              </div>

              <p className="mt-4 text-warm/80 text-sm max-w-md mx-auto">
                Access ends when the timer does. Once the doors close, this experience returns
                to its full price.
              </p>

              <div className="mt-10">
                <Countdown minutes={10} />
              </div>

              <a
                href="/auth"
                className="group mt-10 inline-flex items-center gap-2 rounded-full bg-warm text-warm-foreground px-8 py-4 text-sm font-medium shadow-glow-warm transition hover:scale-[1.02] relative overflow-hidden"
              >
                <span className="absolute inset-0 shimmer" />
                <span className="relative">Claim Free Access</span>
                <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>

              <p className="mt-5 text-xs text-warm/60">No payment required · Instant access</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- COMMUNITY ---------------- */
function Community() {
  return (
    <section id="community" className="relative py-32 md:py-44 px-5 bg-background">
      <div className="mx-auto max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Reveal>
              <p className="text-xs uppercase tracking-[0.3em] text-secondary">The Collective</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.5rem)] font-light leading-[1.05] text-gradient-ocean">
                You don't walk this <br /> path alone.
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                A growing circle of seekers, healers, and quiet humans — sharing reflections,
                practices, and presence as the journey unfolds.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  title="Unlocks after you begin the journey"
                  className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-secondary/40 text-secondary-foreground/70 px-6 py-3 text-sm font-medium shadow-soft cursor-not-allowed overflow-hidden"
                >
                  <MessageCircle className="h-4 w-4 opacity-60" />
                  <span>Join on WhatsApp</span>
                  <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-background/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em]">
                    <Lock className="h-3 w-3" /> Locked
                  </span>
                </button>
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  title="Unlocks after you begin the journey"
                  className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-surface-elevated text-foreground/60 border border-border px-6 py-3 text-sm font-medium cursor-not-allowed"
                >
                  <Users className="h-4 w-4 opacity-60" />
                  <span>Telegram Circle</span>
                  <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em]">
                    <Lock className="h-3 w-3" /> Locked
                  </span>
                </button>
              </div>
            </Reveal>
            <Reveal delay={0.4}>
              <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" /> Access unlocks once you begin the journey above.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-elevated">
              <img src={collectiveImg} alt="Thousands gathered together holding candles at dawn" loading="lazy" width={1024} height={1024} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-primary-foreground">
                <div className="flex -space-x-2">
                  {[0,1,2,3,4].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-warm/40 bg-gradient-to-br from-secondary to-warm" style={{ opacity: 0.6 + i*0.08 }} />
                  ))}
                </div>
                <p className="mt-4 font-display text-lg">Thousands have already begun.</p>
                <p className="text-sm text-warm/70">A shared remembering, in real time.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FINAL CTA ---------------- */
function FinalCTA() {
  return (
    <section className="relative py-32 md:py-48 px-5 overflow-hidden bg-primary-deep text-primary-foreground">
      <div className="absolute inset-0">
        <img src={heroImg} alt="" loading="lazy" className="h-full w-full object-cover opacity-30 reveal-mask" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-deep/70 via-primary-deep/60 to-primary-deep" />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] bg-gradient-glow rounded-full opacity-60" />

      <div className="relative mx-auto max-w-4xl text-center">
        <Reveal>
          <h2 className="font-display text-[clamp(2.5rem,7vw,6rem)] font-light leading-[0.95] tracking-tight text-gradient-warm">
            You were never <br /> meant to live <em className="italic font-extralight">disconnected.</em>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-8 max-w-xl mx-auto text-warm/80 text-lg leading-relaxed">
            Step inside. The journey is quiet, deep, and waiting.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <a
            href="#offer"
            className="group mt-12 inline-flex items-center gap-2 rounded-full bg-warm text-warm-foreground px-10 py-5 text-base font-medium shadow-glow-warm transition hover:scale-[1.02] relative overflow-hidden"
          >
            <span className="absolute inset-0 shimmer" />
            <span className="relative">Start The Journey</span>
            <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- FOOTER ---------------- */
function Footer() {
  return (
    <footer className="relative bg-background border-t border-border py-14 px-5">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-3 md:gap-6">
          <div>
            <img
              src="https://res.cloudinary.com/dzboz4mwb/image/upload/v1779443572/logoos_i0nuqo.png"
              alt="The Human Reconnection Journey logo"
              className="h-10 w-auto object-contain mb-4"
            />
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
              A quiet movement returning humans to themselves — through awareness, nature,
              and consciousness.
            </p>
          </div>

          <div className="md:text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Explore</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#journey" className="hover:text-secondary transition">The Journey</a></li>
              <li><a href="#discover" className="hover:text-secondary transition">Discover</a></li>
              <li><a href="#why" className="hover:text-secondary transition">Why It Matters</a></li>
              <li><a href="#community" className="hover:text-secondary transition">Community</a></li>
            </ul>
          </div>

          <div className="md:text-right">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Connect</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#" className="hover:text-secondary transition">Instagram</a></li>
              <li><a href="#" className="hover:text-secondary transition">YouTube</a></li>
              <li><a href="#" className="hover:text-secondary transition">WhatsApp</a></li>
              <li><a href="#" className="hover:text-secondary transition">Telegram</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} The Human Reconnection Journey.</p>
          <p className="italic">"The longest journey is the one inward."</p>
        </div>
      </div>
    </footer>
  );
}
