// Server-only Supabase admin client for the user's own Supabase project.
// Uses service role key (bypasses RLS). NEVER import this from client code.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function build() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    const missing = [
      !url ? "VITE_SUPABASE_URL" : null,
      !key ? "SUPABASE_SERVICE_ROLE_KEY" : null,
    ]
      .filter(Boolean)
      .join(", ");
    throw new Error(
      `Missing required Supabase environment variable(s): ${missing}. Add them to your .env file.`,
    );
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

let _client: ReturnType<typeof build> | undefined;

export const mySupabase = new Proxy({} as ReturnType<typeof build>, {
  get(_, prop, receiver) {
    if (!_client) _client = build();
    return Reflect.get(_client, prop, receiver);
  },
});
