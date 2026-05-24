import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/progress")({
  head: () => ({ meta: [{ title: "Progress — The Human Reconnection" }] }),
  component: () => (
    <main className="min-h-screen bg-background text-foreground grid place-items-center px-6">
      <div className="text-center max-w-md">
        <h1 className="font-serif text-4xl tracking-tight">Your unfolding.</h1>
        <p className="mt-3 text-foreground/65">
          Detailed progress will appear here as you move through the levels.
        </p>
      </div>
    </main>
  ),
});
