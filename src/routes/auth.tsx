import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { sendOtp, verifyOtp } from "@/lib/auth.functions";
import { COUNTRIES, CountryCodeSelect, type Country } from "@/components/CountryCodeSelect";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Begin Your Journey — The Human Reconnection Journey" },
      {
        name: "description",
        content:
          "A transformational experience exploring awareness, healing, consciousness, and reconnection.",
      },
    ],
  }),
  component: AuthPage,
});

type Stage = "details" | "otp";

function AuthPage() {
  const navigate = useNavigate();
  const send = useServerFn(sendOtp);
  const verify = useServerFn(verifyOtp);

  const [stage, setStage] = useState<Stage>("details");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<Country>(
    COUNTRIES.find((c) => c.iso === "IN") ?? COUNTRIES[0],
  );
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const verifyingRef = useRef(false);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const nationalDigits = phone.replace(/\D/g, "");
  const fullPhone = `${country.dial}${nationalDigits}`;
  const canContinue = first.trim() && last.trim() && nationalDigits.length >= 6;

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canContinue || loading) return;
    verifyingRef.current = false;
    setError(null);
    setLoading(true);
    try {
      await send({ data: { firstName: first, lastName: last, phone: fullPhone } });
      setStage("otp");
      setResendIn(30);
      setOtp(["", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 350);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(code?: string) {
    const c = code ?? otp.join("");
    if (c.length !== 4 || loading || verifyingRef.current) return;
    verifyingRef.current = true;
    setError(null);
    setLoading(true);
    try {
      const raw = await verify({ data: { phone: fullPhone, code: c } });
      const res = raw instanceof Response ? await raw.json() : raw;
      if (!res.ok) {
        setError(res.error);
        setOtp(["", "", "", ""]);
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
        return;
      }
      // Session cookie is set server-side. Route based on onboarding state.
      if (res.user.onboarding_completed) {
        navigate({ to: "/dashboard" });
      } else {
        navigate({ to: "/onboarding" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
      setOtp(["", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
      verifyingRef.current = false;
    }
  }

  function setOtpAt(i: number, v: string) {
    const clean = v.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = clean;
    setOtp(next);
    if (clean && i < 3) otpRefs.current[i + 1]?.focus();
    if (next.every((x) => x) && next.join("").length === 4) {
      handleVerify(next.join(""));
    }
  }

  function onOtpKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 3) otpRefs.current[i + 1]?.focus();
  }

  function onOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!text) return;
    e.preventDefault();
    const next = ["", "", "", ""];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setOtp(next);
    if (text.length === 4) handleVerify(text);
    else otpRefs.current[text.length]?.focus();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <CinematicBackdrop />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <Header stage={stage} firstName={first} />

          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:p-9 shadow-[0_30px_120px_-30px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
            <AnimatePresence mode="wait">
              {stage === "details" && (
                <motion.form
                  key="details"
                  onSubmit={handleSend}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <Field label="First Name" value={first} onChange={setFirst} placeholder="Your first name" />
                    <Field label="Last Name" value={last} onChange={setLast} placeholder="Your last name" />
                  </div>
                  <PhoneField
                    country={country}
                    onCountryChange={setCountry}
                    value={phone}
                    onChange={setPhone}
                  />

                  {error && <ErrorLine message={error} />}

                  <button
                    type="submit"
                    disabled={!canContinue || loading}
                    className="group relative mt-2 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-warm via-warm to-warm/90 px-7 py-4 text-sm font-medium tracking-wide text-warm-foreground shadow-glow-warm transition disabled:cursor-not-allowed disabled:opacity-50 hover:scale-[1.01]"
                  >
                    <span className="absolute inset-0 shimmer" />
                    <span className="relative">
                      {loading ? "Sending access code…" : "Continue The Journey"}
                    </span>
                    {loading ? (
                      <Loader2 className="relative h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
                    )}
                  </button>
                  <p className="text-center text-[12px] text-foreground/55">
                    Your journey progress will be securely saved.
                  </p>
                </motion.form>
              )}

              {stage === "otp" && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setStage("details");
                        setError(null);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-foreground/70 hover:text-foreground transition"
                    >
                      <ArrowLeft className="h-3 w-3" /> Edit number
                    </button>
                    <p className="text-[12px] text-foreground/60 truncate">
                      sent to <span className="text-foreground/90">{fullPhone}</span>
                    </p>
                  </div>

                  <p className="text-sm text-foreground/75 leading-relaxed">
                    We've sent your access code through WhatsApp. Enter the four digits to
                    cross the threshold.
                  </p>

                  <div className="flex justify-between gap-3 sm:gap-4">
                    {otp.map((d, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        value={d}
                        onChange={(e) => setOtpAt(i, e.target.value)}
                        onKeyDown={(e) => onOtpKey(i, e)}
                        onPaste={onOtpPaste}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        className="h-16 w-full sm:h-20 rounded-2xl border border-white/10 bg-white/[0.03] text-center text-3xl font-light text-foreground caret-warm shadow-inner outline-none transition focus:border-warm/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(255,200,140,0.12)]"
                      />
                    ))}
                  </div>

                  {error && <ErrorLine message={error} />}

                  <button
                    type="button"
                    onClick={() => handleVerify()}
                    disabled={otp.join("").length !== 4 || loading}
                    className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-warm via-warm to-warm/90 px-7 py-4 text-sm font-medium text-warm-foreground shadow-glow-warm transition disabled:cursor-not-allowed disabled:opacity-50 hover:scale-[1.01]"
                  >
                    <span className="absolute inset-0 shimmer" />
                    <span className="relative">
                      {loading ? "Opening the doors…" : "Enter The Journey"}
                    </span>
                    {loading ? (
                      <Loader2 className="relative h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
                    )}
                  </button>

                  <div className="flex items-center justify-center text-[12px] text-foreground/55">
                    {resendIn > 0 ? (
                      <span>
                        Didn't receive it? Resend in <span className="text-foreground/80">{resendIn}s</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSend()}
                        className="underline-offset-4 hover:underline text-foreground/80"
                      >
                        Resend access code
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          <p className="mt-6 text-center text-[11px] uppercase tracking-[0.28em] text-foreground/40">
            A quiet doorway · No spam · Move at your own pace
          </p>
        </motion.div>
      </div>
    </main>
  );
}

/* ---------- pieces ---------- */

function Header({ stage, firstName }: { stage: Stage; firstName: string }) {
  const subtitle = useMemo(() => {
    if (stage === "details")
      return "A transformational experience exploring awareness, healing, consciousness, and reconnection with self and nature.";
    return "One last breath before the threshold opens.";
  }, [stage]);

  const title = "Begin Your Journey";

  return (
    <div className="text-center">
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.32em] text-foreground/65 backdrop-blur"
      >
        <Sparkles className="h-3 w-3 text-warm" /> The Human Reconnection
      </motion.span>
      <motion.h1
        key={title}
        initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="mt-5 font-serif text-4xl sm:text-5xl leading-[1.05] tracking-tight"
      >
        {title}
      </motion.h1>
      <motion.p
        key={subtitle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="mx-auto mt-4 max-w-md text-sm sm:text-base leading-relaxed text-foreground/65"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;
  return (
    <label className="relative block">
      <span
        className={`pointer-events-none absolute left-4 transition-all duration-300 ${
          focused || filled
            ? "top-2 text-[10px] uppercase tracking-[0.22em] text-warm/80"
            : "top-1/2 -translate-y-1/2 text-sm text-foreground/45"
        }`}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused ? placeholder : ""}
        className="peer w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 pb-3 pt-6 text-base text-foreground outline-none transition focus:border-warm/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgba(255,200,140,0.10)]"
      />
    </label>
  );
}

function PhoneField({
  country,
  onCountryChange,
  value,
  onChange,
}: {
  country: Country;
  onCountryChange: (c: Country) => void;
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;
  return (
    <label className="relative block">
      <span
        className={`pointer-events-none absolute left-[110px] transition-all duration-300 z-10 ${
          focused || filled
            ? "top-2 text-[10px] uppercase tracking-[0.22em] text-warm/80"
            : "top-1/2 -translate-y-1/2 text-sm text-foreground/45"
        }`}
      >
        WhatsApp Number
      </span>
      <div className="flex h-[62px] w-full overflow-visible rounded-2xl border border-white/10 bg-white/[0.03] transition focus-within:border-warm/50 focus-within:bg-white/[0.06] focus-within:shadow-[0_0_0_4px_rgba(255,200,140,0.10)]">
        <CountryCodeSelect value={country} onChange={onCountryChange} />
        <input
          type="tel"
          inputMode="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={focused || filled ? "Your WhatsApp number" : ""}
          className="peer flex-1 min-w-0 bg-transparent px-4 pb-3 pt-6 text-base text-foreground outline-none placeholder:text-foreground/35"
        />
      </div>
    </label>
  );
}

function ErrorLine({ message }: { message: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-[12.5px] text-red-200"
    >
      {message}
    </motion.p>
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
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.9' /></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
      }} />
    </>
  );
}
