import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/journey")({
  head: () => ({ meta: [{ title: "Journey — The Human Reconnection" }] }),
  component: () => (
    <main className="min-h-screen bg-background text-foreground grid place-items-center px-6">
      <div className="text-center max-w-md">
        <h1 className="font-serif text-4xl tracking-tight">The journey awaits.</h1>
        <p className="mt-3 text-foreground/65">
          Level 1 opens soon. We're preparing the threshold.
        </p>
      </div>
    </main>
  ),
});
