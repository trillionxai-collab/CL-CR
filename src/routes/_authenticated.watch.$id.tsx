import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/watch/$id")({
  head: () => ({ meta: [{ title: "Watch — The Human Reconnection" }] }),
  component: WatchPage,
});

function WatchPage() {
  const { id } = Route.useParams();
  return (
    <main className="min-h-screen bg-background text-foreground grid place-items-center px-6">
      <div className="text-center max-w-md">
        <p className="text-[11px] uppercase tracking-[0.32em] text-foreground/55">
          Level {id}
        </p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight">
          This chapter is being prepared.
        </h1>
      </div>
    </main>
  );
}
