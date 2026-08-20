import { createFileRoute, Outlet } from "@tanstack/react-router";
import { getCurrentUser } from "@/lib/auth.functions";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const user = await getCurrentUser().catch(() => null);
    return { user };
  },
  component: () => <Outlet />,
});
