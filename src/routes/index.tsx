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
  Award,
  Infinity as InfinityIcon,
  Zap,
  Gift,
} from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import natureImg from "@/assets/nature.jpg";
import collectiveImg from "@/assets/collective.jpg";
import certImg from "@/assets/CLG-CERTIFICATE.png";
import { Countdown } from "@/components/Countdown";
import { Reveal } from "@/components/Reveal";

const LOGO_URL =
  "https://res.cloudinary.com/dzboz4mwb/image/upload/v1779428349/CL-Logo_2_qsyn5h.png";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <main className="relative overflow-x-hidden bg-background text-foreground">
      <Nav />
      <Hero />
      <Offer />
      <Disconnect />
      <CertificateAndBenefits />
      <Journey />
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
            <a href="#journey" className="hover:text-foreground transition">
              Journey
            </a>
            <a href="#discover" className="hover:text-foreground transition">
              Discover
            </a>
            <a href="#why" className="hover:text-foreground transition">
              Why
            </a>
            <a href="#community" className="hover:text-foreground transition">
              Community
            </a>
          </nav>
          <a
            href="/dashboard"
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
        <video
          src="https://res.cloudinary.com/dzboz4mwb/video/upload/q_auto/f_auto/v1779726566/man_in_the_sea_1_ejqdcp.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-deep/40 via-primary/30 to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-primary-deep/30" />
      </motion.div>

      {/* Glow orbs */}
      <div className="absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-secondary/30 blur-[120px] animate-float-slow" />
      <div
        className="absolute -right-32 top-1/2 h-96 w-96 rounded-full bg-warm/30 blur-[140px] animate-float-slow"
        style={{ animationDelay: "2s" }}
      />

      <motion.div
        style={{ opacity }}
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center px-5 pt-32 pb-20 text-center"
      >
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
          <Sparkles className="h-3 w-3" />A Cinematic Awakening
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
          A transformational 7-level certified course exploring human disconnection, awareness,
          consciousness, healing, and reconnection with self and nature.
        </motion.p>

        {/* Price */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.2 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm"
        >
          <span className="max-w-2xl text-base md:text-lg leading-relaxed text-warm/90 mt-[15px] line-through">
            ₹1,999
          </span>
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
          <Countdown minutes={1440} />
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.6 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-3"
        >
          <a
            href="/dashboard"
            className="group relative inline-flex items-center gap-2 rounded-full bg-warm text-warm-foreground px-7 py-3.5 text-sm font-medium shadow-glow-warm transition hover:scale-[1.02] animate-pulse-glow animate-vibrate-sides overflow-hidden"
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

        {/* Course Highlights Badges */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.8 }}
          className="mt-8 flex flex-wrap justify-center gap-2.5 text-xs text-warm/95"
        >
          <span className="glass-dark border border-warm/25 rounded-full px-3 py-1.5 flex items-center gap-1.5 backdrop-blur-md">
            <Award className="h-3.5 w-3.5 text-warm" /> Verified Certificate Included
          </span>
          <span className="glass-dark border border-warm/25 rounded-full px-3 py-1.5 flex items-center gap-1.5 backdrop-blur-md">
            <InfinityIcon className="h-3.5 w-3.5 text-warm" /> Lifetime Access & Updates
          </span>
          <span className="glass-dark border border-warm/25 rounded-full px-3 py-1.5 flex items-center gap-1.5 backdrop-blur-md">
            <Gift className="h-3.5 w-3.5 text-warm" /> Exclusive Partner Discounts
          </span>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-warm/60"
        >
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
  return (
    <section className="relative py-32 md:py-44 px-5">
      <div className="absolute inset-0 bg-gradient-warm" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[500px] w-[500px] bg-gradient-glow rounded-full opacity-50" />
      <div className="relative mx-auto max-w-5xl">
        <Reveal delay={0.05}>
          <div className="mt-6 flex justify-center">
            <img
              src="https://res.cloudinary.com/dzboz4mwb/image/upload/v1780419512/Thampi_Nagarjuna_2_1_agveqy.png"
              alt="Thampi Nagarjuna"
              className="h-32 w-32 rounded-full object-cover shadow-elevated"
            />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-secondary text-center">
            Thampi Nagarjuna
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <h2 className="mt-5 font-display text-[clamp(2rem,5vw,4rem)] font-light leading-[1.05] text-center max-w-4xl mx-auto text-gradient-ocean">
            We have everything. <br /> And feel nothing.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-8 max-w-2xl mx-auto text-center text-[17px] leading-relaxed text-muted-foreground">
            The modern human is overstimulated, overconnected, and slowly drifting away from
            themselves. Every notification becomes a small interruption. Every day feels like a
            louder repeat of the last. Somewhere along the way, they have lost touch with who they
            truly are. This course helps you reconnect with your inner self.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- JOURNEY ---------------- */
function Journey() {
  const levels = [
    {
      n: "01",
      t: "A Better Way to Feel",
      d: "Returning to the body. Breath, posture, presence — the doorway home.",
      icon: HeartPulse,
    },
    {
      n: "02",
      t: "Is Everything Okay?",
      d: "The quiet question beneath the noise. Honesty with the nervous system.",
      icon: Waves,
    },
    {
      n: "03",
      t: "The World Has Changed",
      d: "How modern life rewrote what it means to be human.",
      icon: Brain,
    },
    {
      n: "04",
      t: "The Hidden Damage",
      d: "The invisible wounds we carry without knowing their names.",
      icon: Eye,
    },
    {
      n: "05",
      t: "The Healing System",
      d: "Ancient and modern wisdom — the architecture of return.",
      icon: Sparkles,
    },
    {
      n: "06",
      t: "The Reconnection",
      d: "Self. Nature. Consciousness. Coming home — fully, finally.",
      icon: Leaf,
    },
    { n: "07", t: "The Conscious Living", d: "Practice and integration.", icon: Sun },
  ];

  return (
    <section
      id="journey"
      className="relative py-32 md:py-44 px-5 bg-gradient-ocean text-primary-foreground overflow-hidden"
    >
      <div className="absolute inset-0 noise" />
      <div className="absolute top-1/2 -left-40 h-[400px] w-[400px] rounded-full bg-secondary/40 blur-[120px]" />
      <div className="absolute bottom-0 -right-40 h-[400px] w-[400px] rounded-full bg-warm/20 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-warm text-center">The Path</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-5 font-display text-[clamp(2rem,5vw,4rem)] font-light leading-[1.05] text-center text-gradient-warm">
            Seven levels. <br />
            One descent inward.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-xl mx-auto text-center text-warm/70 leading-relaxed">
            A guided architecture from sensation to consciousness — each level deepening what the
            last one opened.
          </p>
        </Reveal>

        <div className="mt-20 relative">
          {/* Connecting line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-warm/30 to-transparent hidden md:block" />

          <div className="space-y-6 md:space-y-10">
            {levels.map((lv, i) => (
              <Reveal key={lv.n} delay={i * 0.08}>
                <div
                  className={`md:grid md:grid-cols-2 md:gap-12 items-center ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}
                >
                  <div
                    className={`relative ${i % 2 ? "md:text-left md:pl-12" : "md:text-right md:pr-12"}`}
                  >
                    <div className="glass-dark rounded-3xl p-7 md:p-9 shadow-elevated group hover:scale-[1.01] transition-transform duration-500">
                      <div className={`flex items-center gap-3 ${i % 2 ? "" : "md:justify-end"}`}>
                        <span className="font-mono text-xs text-warm/60 tracking-wider">
                          {lv.n}
                        </span>
                        <div className="h-px flex-1 bg-warm/20 max-w-[60px]" />
                        <lv.icon className="h-4 w-4 text-warm" strokeWidth={1.4} />
                      </div>
                      <h3 className="mt-4 font-display text-2xl md:text-3xl font-light text-warm">
                        {lv.t}
                      </h3>
                      <p className="mt-3 text-warm/70 text-sm md:text-base leading-relaxed">
                        {lv.d}
                      </p>
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

/* ---------------- CERTIFICATE & BENEFITS ---------------- */
function CertificateAndBenefits() {
  const benefits = [
    {
      title: "Verified Course Certificate",
      desc: "Receive an official completion certificate signed by Thampi Nagarjuna upon finishing all 7 levels of the journey.",
      icon: Award,
    },
    {
      title: "Lifetime Benefits Access",
      desc: "Return to the levels, video content, and daily practices anytime. Your access never expires.",
      icon: InfinityIcon,
    },
    {
      title: "Future Level Updates",
      desc: "Any newly added levels, meditations, or bonus resource materials are yours automatically at no extra cost.",
      icon: Zap,
    },
    {
      title: "Special Wellness Discounts",
      desc: "Enjoy exclusive, lifetime partner discounts on premium wellness products, wellness-tech, and partner cannabis products.",
      icon: Gift,
    },
  ];

  return (
    <section id="why" className="relative py-32 md:py-44 px-5 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-warm" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[500px] w-[500px] bg-gradient-glow rounded-full opacity-40 pointer-events-none" />

      <div className="relative mx-auto max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-20 md:mb-28">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-secondary">
              The Credentials & Access
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-5 font-display text-[clamp(2rem,5vw,4rem)] font-light leading-[1.05] text-gradient-ocean">
              A Certified Journey. <br />
              Lifetime Access & Benefits.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-2xl mx-auto text-[17px] leading-relaxed text-muted-foreground">
              This is more than a momentary disconnect. It is a systematic 7-level course that gives
              you lifetime tools, official certification, and exclusive community rewards.
            </p>
          </Reveal>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Certificate Preview (Fully visible) */}
          <div className="lg:col-span-6 flex justify-center items-center">
            <Reveal delay={0.3}>
              <motion.div
                whileHover={{ scale: 1.03, rotateY: 3, rotateX: -3 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative rounded-2xl overflow-hidden shadow-elevated border border-border/20"
              >
                {/* Reflection shimmer */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000 ease-out pointer-events-none z-10" />
                <img
                  src={certImg}
                  alt="Course Completion Certificate"
                  loading="lazy"
                  className="w-full h-auto object-contain block max-h-[480px]"
                />
              </motion.div>
            </Reveal>
          </div>

          {/* Right: Benefits Cards */}
          <div className="lg:col-span-6 space-y-6 md:space-y-8">
            {benefits.map((bf, i) => (
              <Reveal key={bf.title} delay={i * 0.08 + 0.2}>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-surface-elevated/80 border border-border/40 text-secondary grid place-items-center flex-shrink-0 shadow-soft">
                    <bf.icon className="h-5 w-5 md:h-6 md:w-6" strokeWidth={1.2} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display text-xl md:text-2xl font-light text-foreground tracking-tight">
                      {bf.title}
                    </h3>
                    <p className="text-[14.5px] text-muted-foreground leading-relaxed">{bf.desc}</p>
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
                A 7-level certified course worth ₹1,999 <br /> offered today, freely.
              </h2>

              <div className="mt-8 flex items-baseline justify-center gap-4">
                <span className="text-2xl line-through text-warm/40">₹1,999</span>
                <span className="font-display text-5xl md:text-6xl font-light text-warm">FREE</span>
              </div>

              <p className="mt-4 text-warm/80 text-sm max-w-md mx-auto">
                Get lifetime access, a verified completion certificate, and wellness partner
                discounts. Access is free today.
              </p>

              <div className="mt-10">
                <Countdown minutes={1440} />
              </div>

              <a
                href="/dashboard"
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
              <img
                src={collectiveImg}
                alt="Thousands gathered together holding candles at dawn"
                loading="lazy"
                width={1024}
                height={1024}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-primary-foreground">
                <div className="flex -space-x-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-warm/40 bg-gradient-to-br from-secondary to-warm"
                      style={{ opacity: 0.6 + i * 0.08 }}
                    />
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
        <img
          src={heroImg}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover opacity-30 reveal-mask"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-deep/70 via-primary-deep/60 to-primary-deep" />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] bg-gradient-glow rounded-full opacity-60" />

      <div className="relative mx-auto max-w-4xl text-center">
        <Reveal>
          <h2 className="font-display text-[clamp(2.5rem,7vw,6rem)] font-light leading-[0.95] tracking-tight text-gradient-warm">
            You were never <br /> meant to live{" "}
            <em className="italic font-extralight">disconnected.</em>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-8 max-w-xl mx-auto text-warm/80 text-lg leading-relaxed">
            Step inside. Get lifetime course access, claim your completion certificate, and begin
            your descent inward.
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
              A quiet movement returning humans to themselves — through awareness, nature, and
              consciousness.
            </p>
          </div>

          <div className="md:text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Explore</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="#journey" className="hover:text-secondary transition">
                  The Journey
                </a>
              </li>
              <li>
                <a href="#discover" className="hover:text-secondary transition">
                  Discover
                </a>
              </li>
              <li>
                <a href="#why" className="hover:text-secondary transition">
                  Why It Matters
                </a>
              </li>
              <li>
                <a href="#community" className="hover:text-secondary transition">
                  Community
                </a>
              </li>
            </ul>
          </div>

          <div className="md:text-right">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Connect</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-secondary transition">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary transition">
                  YouTube
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary transition">
                  WhatsApp
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary transition">
                  Telegram
                </a>
              </li>
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
