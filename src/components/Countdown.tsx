import { useEffect, useState } from "react";

export function Countdown({ minutes = 10, className = "" }: { minutes?: number; className?: string }) {
  const [seconds, setSeconds] = useState(minutes * 60);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");

  return (
    <div className={`inline-flex items-center gap-2 font-mono tabular-nums ${className}`}>
      <TimeCell value={h} label="hr" />
      <span className="text-2xl opacity-40">:</span>
      <TimeCell value={m} label="min" />
      <span className="text-2xl opacity-40">:</span>
      <TimeCell value={s} label="sec" />
    </div>
  );
}

function TimeCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="glass-dark rounded-xl px-4 py-3 min-w-[64px] text-center shadow-glow">
        <span className="text-3xl md:text-4xl font-display font-light text-gradient-warm">{value}</span>
      </div>
      <span className="mt-1.5 text-[10px] uppercase tracking-[0.2em] opacity-60">{label}</span>
    </div>
  );
}
