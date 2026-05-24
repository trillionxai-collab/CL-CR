// Server-only session manager. Custom opaque-token sessions stored in your
// own Supabase (table: user_sessions), validated against an httpOnly cookie.
import {
  getCookie,
  setCookie,
  deleteCookie,
  getRequestHeader,
  getRequestIP,
} from "@tanstack/react-start/server";
import { serializeCookie } from "cookie-es";
import { randomBytes, createHash } from "crypto";
import { mySupabase } from "@/integrations/my-supabase/admin.server";

export const SESSION_COOKIE = "hrj_session";
const SESSION_DAYS = 60;
const SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60;
const SLIDING_REFRESH_DAYS = 30; // refresh when fewer days remain

export function getSessionSetCookieHeader(token: string): string {
  return serializeCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function newToken(): string {
  return randomBytes(32).toString("base64url");
}

function addDays(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function createSession(userId: string) {
  const token = newToken();
  const token_hash = hashToken(token);
  const expires = addDays(SESSION_DAYS);

  const device_info = getRequestHeader("user-agent") ?? null;
  let ip_address: string | null = null;
  try {
    ip_address = getRequestIP({ xForwardedFor: true }) ?? null;
  } catch {
    ip_address = null;
  }

  const { error } = await mySupabase.from("user_sessions").insert({
    user_id: userId,
    session_token_hash: token_hash,
    device_info,
    ip_address,
    expires_at: expires.toISOString(),
  });
  if (error) throw new Error(`Failed to create session: ${error.message}`);

  await mySupabase
    .from("journey_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", userId);

  setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return token;
}

export type SessionUser = {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  onboarding_completed: boolean;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = getCookie(SESSION_COOKIE);
  if (!token) return null;
  const token_hash = hashToken(token);

  const { data: session, error: sErr } = await mySupabase
    .from("user_sessions")
    .select("id, user_id, expires_at")
    .eq("session_token_hash", token_hash)
    .maybeSingle();

  if (sErr || !session) return null;

  const expiresAt = new Date(session.expires_at).getTime();
  if (expiresAt < Date.now()) {
    await mySupabase.from("user_sessions").delete().eq("id", session.id);
    deleteCookie(SESSION_COOKIE, { path: "/" });
    return null;
  }

  const { data: user, error: uErr } = await mySupabase
    .from("journey_users")
    .select("id, first_name, last_name, phone_number, onboarding_completed")
    .eq("id", session.user_id)
    .maybeSingle();
  if (uErr || !user) return null;

  // Sliding refresh: bump last_active_at, and extend expiry if <30 days remain
  const now = new Date();
  const updates: { last_active_at: string; expires_at?: string } = {
    last_active_at: now.toISOString(),
  };
  const remainingMs = expiresAt - now.getTime();
  if (remainingMs < SLIDING_REFRESH_DAYS * 24 * 60 * 60 * 1000) {
    const newExpires = addDays(SESSION_DAYS);
    updates.expires_at = newExpires.toISOString();
    setCookie(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
  }
  await mySupabase.from("user_sessions").update(updates).eq("id", session.id);

  return user;
}

export async function destroySession() {
  const token = getCookie(SESSION_COOKIE);
  if (token) {
    const token_hash = hashToken(token);
    await mySupabase
      .from("user_sessions")
      .delete()
      .eq("session_token_hash", token_hash);
  }
  deleteCookie(SESSION_COOKIE, { path: "/" });
}
