import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

export type Country = { name: string; dial: string; flag: string; iso: string };

export const COUNTRIES: Country[] = [
  { name: "India", dial: "+91", flag: "🇮🇳", iso: "IN" },
  { name: "United States", dial: "+1", flag: "🇺🇸", iso: "US" },
  { name: "United Kingdom", dial: "+44", flag: "🇬🇧", iso: "GB" },
  { name: "United Arab Emirates", dial: "+971", flag: "🇦🇪", iso: "AE" },
  { name: "Canada", dial: "+1", flag: "🇨🇦", iso: "CA" },
  { name: "Australia", dial: "+61", flag: "🇦🇺", iso: "AU" },
  { name: "Singapore", dial: "+65", flag: "🇸🇬", iso: "SG" },
  { name: "Germany", dial: "+49", flag: "🇩🇪", iso: "DE" },
  { name: "France", dial: "+33", flag: "🇫🇷", iso: "FR" },
  { name: "Spain", dial: "+34", flag: "🇪🇸", iso: "ES" },
  { name: "Italy", dial: "+39", flag: "🇮🇹", iso: "IT" },
  { name: "Netherlands", dial: "+31", flag: "🇳🇱", iso: "NL" },
  { name: "Switzerland", dial: "+41", flag: "🇨🇭", iso: "CH" },
  { name: "Sweden", dial: "+46", flag: "🇸🇪", iso: "SE" },
  { name: "Norway", dial: "+47", flag: "🇳🇴", iso: "NO" },
  { name: "Ireland", dial: "+353", flag: "🇮🇪", iso: "IE" },
  { name: "Japan", dial: "+81", flag: "🇯🇵", iso: "JP" },
  { name: "South Korea", dial: "+82", flag: "🇰🇷", iso: "KR" },
  { name: "China", dial: "+86", flag: "🇨🇳", iso: "CN" },
  { name: "Hong Kong", dial: "+852", flag: "🇭🇰", iso: "HK" },
  { name: "Indonesia", dial: "+62", flag: "🇮🇩", iso: "ID" },
  { name: "Malaysia", dial: "+60", flag: "🇲🇾", iso: "MY" },
  { name: "Thailand", dial: "+66", flag: "🇹🇭", iso: "TH" },
  { name: "Vietnam", dial: "+84", flag: "🇻🇳", iso: "VN" },
  { name: "Philippines", dial: "+63", flag: "🇵🇭", iso: "PH" },
  { name: "Pakistan", dial: "+92", flag: "🇵🇰", iso: "PK" },
  { name: "Bangladesh", dial: "+880", flag: "🇧🇩", iso: "BD" },
  { name: "Sri Lanka", dial: "+94", flag: "🇱🇰", iso: "LK" },
  { name: "Nepal", dial: "+977", flag: "🇳🇵", iso: "NP" },
  { name: "Saudi Arabia", dial: "+966", flag: "🇸🇦", iso: "SA" },
  { name: "Qatar", dial: "+974", flag: "🇶🇦", iso: "QA" },
  { name: "Kuwait", dial: "+965", flag: "🇰🇼", iso: "KW" },
  { name: "Bahrain", dial: "+973", flag: "🇧🇭", iso: "BH" },
  { name: "Oman", dial: "+968", flag: "🇴🇲", iso: "OM" },
  { name: "Israel", dial: "+972", flag: "🇮🇱", iso: "IL" },
  { name: "Turkey", dial: "+90", flag: "🇹🇷", iso: "TR" },
  { name: "South Africa", dial: "+27", flag: "🇿🇦", iso: "ZA" },
  { name: "Nigeria", dial: "+234", flag: "🇳🇬", iso: "NG" },
  { name: "Kenya", dial: "+254", flag: "🇰🇪", iso: "KE" },
  { name: "Egypt", dial: "+20", flag: "🇪🇬", iso: "EG" },
  { name: "Brazil", dial: "+55", flag: "🇧🇷", iso: "BR" },
  { name: "Mexico", dial: "+52", flag: "🇲🇽", iso: "MX" },
  { name: "Argentina", dial: "+54", flag: "🇦🇷", iso: "AR" },
  { name: "Chile", dial: "+56", flag: "🇨🇱", iso: "CL" },
  { name: "Colombia", dial: "+57", flag: "🇨🇴", iso: "CO" },
  { name: "New Zealand", dial: "+64", flag: "🇳🇿", iso: "NZ" },
  { name: "Russia", dial: "+7", flag: "🇷🇺", iso: "RU" },
  { name: "Portugal", dial: "+351", flag: "🇵🇹", iso: "PT" },
  { name: "Poland", dial: "+48", flag: "🇵🇱", iso: "PL" },
  { name: "Belgium", dial: "+32", flag: "🇧🇪", iso: "BE" },
];

export function CountryCodeSelect({
  value,
  onChange,
}: {
  value: Country;
  onChange: (c: Country) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
    else setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.iso.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-full items-center gap-1.5 rounded-l-2xl border-r border-white/10 bg-white/[0.02] px-3 text-sm text-foreground/85 transition hover:bg-white/[0.05]"
      >
        <span className="text-base leading-none">{value.flag}</span>
        <span className="font-mono text-[13px] tabular-nums">{value.dial}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[280px] overflow-hidden rounded-2xl border border-white/10 bg-[rgba(20,18,24,0.92)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
          <div className="flex items-center gap-2 border-b border-white/5 px-3 py-2.5">
            <Search className="h-3.5 w-3.5 text-foreground/40" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or code"
              className="w-full bg-transparent text-[13px] text-foreground placeholder:text-foreground/35 outline-none"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-[12px] text-foreground/45">No matches</li>
            )}
            {filtered.map((c) => (
              <li key={c.iso}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(c);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] transition hover:bg-white/5 ${
                    c.iso === value.iso ? "bg-white/[0.04] text-warm" : "text-foreground/85"
                  }`}
                >
                  <span className="text-base leading-none">{c.flag}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="font-mono text-[12px] text-foreground/55 tabular-nums">
                    {c.dial}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
