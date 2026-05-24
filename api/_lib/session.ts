// Session management for Vercel API routes.
// Mirrors the logic from src/lib/session.server.ts, adapted for VercelRequest/Response.
import { createHash, randomBytes } from "crypto";
import type { VercelRequest } from "@vercel/node";
import { getAdminClient } from "./supabase.js";

const SESSION_COOKIE = "hrj_session";
const SESSION_DAYS = 60;
const SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60;
const SLIDING_REFRESH_DAYS = 30;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function newToken() {
  return randomBytes(32).toString("base64url");
}

function addDays(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header.split(";").map((part) => {
      const [key, ...vals] = part.trim().split("=");
      return [key.trim(), vals.join("=")];
    }),
  );
}

/** Build an httpOnly Set-Cookie header value that sets the session token. */
export function buildSetCookieHeader(token: string) {
  return `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_MAX_AGE}`;
}

/** Build a Set-Cookie header value that immediately expires the session cookie. */
export function buildClearCookieHeader() {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export type SessionUser = {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  onboarding_completed: boolean;
};

/** Create a new session row in user_sessions and return the raw token. */
export async function createSession(userId: string, req: VercelRequest): Promise<string> {
  const supabase = getAdminClient();
  const token = newToken();
  const token_hash = hashToken(token);
  const expires = addDays(SESSION_DAYS);

  const device_info = (req.headers["user-agent"] as string | undefined) ?? null;
  const ip_address =
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ?? null;

  const { error } = await supabase.from("user_sessions").insert({
    user_id: userId,
    session_token_hash: token_hash,
    device_info,
    ip_address,
    expires_at: expires.toISOString(),
  });
  if (error) throw new Error(`Failed to create session: ${error.message}`);

  await supabase
    .from("journey_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", userId);

  return token;
}

/** Validate the session cookie in the request and return the associated user, or null. */
export async function getSessionUser(req: VercelRequest): Promise<SessionUser | null> {
  const supabase = getAdminClient();
  const cookies = parseCookies(req.headers.cookie as string | undefined);
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;

  const token_hash = hashToken(token);

  const { data: session, error: sErr } = await supabase
    .from("user_sessions")
    .select("id, user_id, expires_at")
    .eq("session_token_hash", token_hash)
    .maybeSingle();

  if (sErr || !session) return null;

  const expiresAt = new Date(session.expires_at).getTime();
  if (expiresAt < Date.now()) {
    await supabase.from("user_sessions").delete().eq("id", session.id);
    return null;
  }

  const { data: user, error: uErr } = await supabase
    .from("journey_users")
    .select("id, first_name, last_name, phone_number, onboarding_completed")
    .eq("id", session.user_id)
    .maybeSingle();
  if (uErr || !user) return null;

  // Sliding refresh: keep last_active_at current and extend DB expiry if close to expiry
  const now = new Date();
  const updates: { last_active_at: string; expires_at?: string } = {
    last_active_at: now.toISOString(),
  };
  if (expiresAt - now.getTime() < SLIDING_REFRESH_DAYS * 24 * 60 * 60 * 1000) {
    updates.expires_at = addDays(SESSION_DAYS).toISOString();
  }
  await supabase.from("user_sessions").update(updates).eq("id", session.id);

  return user;
}

/** Delete the session row for the cookie in this request. */
export async function destroySession(req: VercelRequest): Promise<void> {
  const supabase = getAdminClient();
  const cookies = parseCookies(req.headers.cookie as string | undefined);
  const token = cookies[SESSION_COOKIE];
  if (token) {
    const token_hash = hashToken(token);
    await supabase.from("user_sessions").delete().eq("session_token_hash", token_hash);
  }
}
