// Server-only Supabase admin client for Vercel API routes.
// Uses the service role key which bypasses RLS — NEVER import from frontend code.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../src/integrations/my-supabase/types";

function build() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

let _client: ReturnType<typeof build> | undefined;

export function getAdminClient() {
  if (!_client) _client = build();
  return _client;
}
