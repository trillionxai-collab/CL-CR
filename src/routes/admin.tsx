import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Search, X, Users, Trophy, Circle, CheckCircle2, Activity } from "lucide-react";
import { getAdminOverview, type AdminUserRow } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
});

const TOTAL_LEVELS = 5;

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function relativeTime(iso: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return formatDate(iso);
}

function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => getAdminOverview(),
    refetchInterval: 30_000,
  });

  const [query, setQuery] = useState("");
  const [openUser, setOpenUser] = useState<AdminUserRow | null>(null);
  const [filter, setFilter] = useState<"all" | "new-today" | "completions-today">("all");

  const users = data?.users ?? [];
  const stats = data?.stats;

  const activeCount = useMemo(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return users.filter((u) => u.last_active_at && new Date(u.last_active_at).getTime() >= cutoff)
      .length;
  }, [users]);

  const filteredUsers = useMemo(() => {
    let rows = users;
    if (filter === "new-today" && stats) {
      const ids = new Set(stats.newToday);
      rows = rows.filter((u) => ids.has(u.id));
    } else if (filter === "completions-today" && stats) {
      const ids = new Set(stats.completionsToday);
      rows = rows.filter((u) => ids.has(u.id));
    }
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((u) =>
      `${u.first_name} ${u.last_name} ${u.phone_number} ${u.gender ?? ""} ${u.lifestyle ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [users, query, filter, stats]);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-xl tracking-tight text-foreground sm:text-2xl">
                Admin
              </h1>
              <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 sm:inline-flex">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Live
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{today}</p>
          </div>
          <div className="hidden text-right sm:block">
            <div className="font-display text-lg tracking-tight">
              {data?.stats.totalUsers ?? 0}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Total users
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="New Users Today"
            value={stats?.newToday.length ?? 0}
            icon={<Users className="h-4 w-4" />}
            active={filter === "new-today"}
            loading={isLoading}
            onClick={() => setFilter(filter === "new-today" ? "all" : "new-today")}
          />
          <StatCard
            label="Course Completions"
            value={stats?.completionsToday.length ?? 0}
            icon={<Trophy className="h-4 w-4" />}
            accent
            active={filter === "completions-today"}
            loading={isLoading}
            onClick={() =>
              setFilter(filter === "completions-today" ? "all" : "completions-today")
            }
          />
          <StatCard
            label="Active (24h)"
            value={activeCount}
            icon={<Activity className="h-4 w-4" />}
            loading={isLoading}
          />
        </section>

        <section className="mt-10">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-lg tracking-tight text-foreground sm:text-xl">
                Registered Users
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {filteredUsers.length} {filteredUsers.length === 1 ? "person" : "people"}
                {filter !== "all" && (
                  <button
                    onClick={() => setFilter("all")}
                    className="ml-2 text-secondary underline-offset-2 hover:underline"
                  >
                    clear filter
                  </button>
                )}
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, phone, lifestyle…"
                className="w-full rounded-full border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-secondary/50"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card/60 shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <Th>Name</Th>
                    <Th>WhatsApp</Th>
                    <Th>Gender</Th>
                    <Th>Lifestyle</Th>
                    <Th>Registered</Th>
                    <Th>Level</Th>
                    <Th className="w-[180px]">Progress</Th>
                    <Th>Last Active</Th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr>
                      <td colSpan={8} className="px-5 py-16 text-center text-muted-foreground">
                        Loading…
                      </td>
                    </tr>
                  )}
                  {!isLoading && filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-16 text-center text-muted-foreground">
                        No users to show.
                      </td>
                    </tr>
                  )}
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      onClick={() => setOpenUser(u)}
                      className="cursor-pointer border-b border-border/40 transition-colors last:border-0 hover:bg-muted/40"
                    >
                      <Td>
                        <div className="font-medium text-foreground">
                          {u.first_name} {u.last_name}
                        </div>
                      </Td>
                      <Td className="font-mono text-xs text-muted-foreground">{u.phone_number}</Td>
                      <Td className="capitalize text-muted-foreground">{u.gender ?? "—"}</Td>
                      <Td className="capitalize text-muted-foreground">
                        {u.lifestyle?.replace(/-/g, " ") ?? "—"}
                      </Td>
                      <Td className="text-muted-foreground">{formatDate(u.created_at)}</Td>
                      <Td>
                        <span className="inline-flex items-center rounded-md bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
                          {u.current_level}/{TOTAL_LEVELS}
                        </span>
                      </Td>
                      <Td>
                        <ProgressBar value={u.completion_percentage} />
                      </Td>
                      <Td className="text-muted-foreground">{relativeTime(u.last_active_at)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <UserDrawer user={openUser} onClose={() => setOpenUser(null)} />
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-5 py-3 font-medium ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-5 py-4 align-middle ${className}`}>{children}</td>;
}

function StatCard({
  label,
  value,
  icon,
  accent,
  active,
  loading,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: boolean;
  active?: boolean;
  loading?: boolean;
  onClick?: () => void;
}) {
  const Comp: any = onClick ? motion.button : motion.div;
  return (
    <Comp
      whileHover={onClick ? { y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border bg-card/70 px-6 py-6 text-left transition-all sm:px-7 sm:py-7 ${
        active
          ? "border-secondary/60 shadow-glow"
          : "border-border hover:border-secondary/30 shadow-soft"
      }`}
    >
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full blur-3xl transition-opacity ${
          accent ? "bg-[oklch(0.86_0.10_75/0.35)]" : "bg-[oklch(0.58_0.10_178/0.25)]"
        } ${active ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-foreground/70">
              {icon}
            </span>
            {label}
          </div>
          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-5xl tracking-tight text-foreground sm:text-6xl">
              {loading ? "—" : value}
            </span>
            {onClick && (
              <span className="text-xs text-muted-foreground">
                {active ? "showing" : "click to view"}
              </span>
            )}
          </div>
        </div>
      </div>
    </Comp>
  );
}

function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${v}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-secondary to-accent"
        />
      </div>
      <span className="w-10 text-right text-xs font-medium text-foreground">{Math.round(v)}%</span>
    </div>
  );
}

function UserDrawer({ user, onClose }: { user: AdminUserRow | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {user && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm"
          />
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto border-l border-border bg-background shadow-elevated sm:max-w-md"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/60 bg-background/90 px-6 py-4 backdrop-blur-xl">
              <div>
                <h3 className="font-display text-lg tracking-tight">
                  {user.first_name} {user.last_name}
                </h3>
                <p className="font-mono text-xs text-muted-foreground">{user.phone_number}</p>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-8 px-6 py-6">
              <div className="rounded-xl border border-border bg-card/60 p-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    Journey progress
                  </span>
                  <span className="font-display text-3xl tracking-tight">
                    {Math.round(user.completion_percentage)}%
                  </span>
                </div>
                <div className="mt-3">
                  <ProgressBar value={user.completion_percentage} />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Currently on level{" "}
                  <span className="font-medium text-foreground">{user.current_level}</span> of{" "}
                  {TOTAL_LEVELS}
                </p>
              </div>

              <Section title="Levels">
                <div className="space-y-2">
                  {Array.from({ length: TOTAL_LEVELS }).map((_, i) => {
                    const lvl = i + 1;
                    const done = lvl < user.current_level || user.completion_percentage >= 100;
                    const current = lvl === user.current_level && !done;
                    return (
                      <div
                        key={lvl}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                          done
                            ? "border-secondary/30 bg-secondary/5"
                            : current
                              ? "border-accent/40 bg-accent/5"
                              : "border-border bg-card/40"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {done ? (
                            <CheckCircle2 className="h-4 w-4 text-secondary" />
                          ) : (
                            <Circle
                              className={`h-4 w-4 ${
                                current ? "text-accent" : "text-muted-foreground/40"
                              }`}
                            />
                          )}
                          <span className={done ? "text-foreground" : "text-muted-foreground"}>
                            Level {lvl}
                          </span>
                        </div>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">
                          {done ? "Completed" : current ? "In progress" : "Locked"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Section>

              <Section title="Profile">
                <Field label="Gender" value={user.gender ?? "—"} />
                <Field label="Lifestyle" value={user.lifestyle?.replace(/-/g, " ") ?? "—"} />
                <Field label="Date of Birth" value={user.date_of_birth ?? "—"} />
                <Field label="Open-Mind Consent" value={user.open_mind_consent ? "Yes" : "No"} />
                <Field
                  label="Onboarding"
                  value={user.onboarding_completed ? "Completed" : "Incomplete"}
                />
              </Section>

              <Section title="Activity">
                <Field label="Registered" value={formatDate(user.created_at)} />
                <Field label="Last Login" value={relativeTime(user.last_login_at)} />
                <Field label="Last Active" value={relativeTime(user.last_active_at)} />
                <Field
                  label="Total Watch Time"
                  value={`${Math.round(user.total_watch_time / 60)} min`}
                />
              </Section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="capitalize text-foreground">{value}</span>
    </div>
  );
}
