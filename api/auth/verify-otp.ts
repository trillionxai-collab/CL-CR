// POST /api/auth/verify-otp
// Validates the OTP, marks it used, creates a session, and returns the user.
// The session token is set as an httpOnly cookie.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHash } from "crypto";
import { z } from "zod";
import { getAdminClient } from "../_lib/supabase";
import { createSession, buildSetCookieHeader } from "../_lib/session";

const VerifySchema = z.object({
  phone: z.string().trim().min(7).max(20),
  code: z.string().trim().regex(/^\d{4}$/),
});

function normalizePhone(p: string) {
  return p.replace(/[^\d+]/g, "");
}

function hashOtp(phone: string, code: string) {
  return createHash("sha256").update(`${phone}:${code}`).digest("hex");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const parsed = VerifySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { phone: rawPhone, code } = parsed.data;
  const phone = normalizePhone(rawPhone);
  const otp_hash = hashOtp(phone, code);
  const supabase = getAdminClient();

  // Look up the exact OTP row matching phone + hash
  const { data: rows, error } = await supabase
    .from("otp_verifications")
    .select("id, otp_hash, expires_at, verified, attempts")
    .eq("phone_number", phone)
    .eq("otp_hash", otp_hash)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !rows || rows.length === 0) {
    // Hash didn't match — find the latest unverified row for better error messages
    const { data: latestRows } = await supabase
      .from("otp_verifications")
      .select("id, expires_at, verified, attempts")
      .eq("phone_number", phone)
      .eq("verified", false)
      .order("created_at", { ascending: false })
      .limit(1);

    const latest = latestRows?.[0];
    if (!latest)
      return res.json({ ok: false, error: "No active access code found. Please request a new one." });
    if (new Date(latest.expires_at).getTime() < Date.now())
      return res.json({ ok: false, error: "This code has expired. Request a new one." });
    if (latest.attempts >= 5)
      return res.json({ ok: false, error: "Too many attempts. Request a new code." });
    await supabase
      .from("otp_verifications")
      .update({ attempts: latest.attempts + 1 })
      .eq("id", latest.id);
    return res.json({ ok: false, error: "That code doesn't match. Try again." });
  }

  const otp = rows[0];
  if (otp.verified)
    return res.json({ ok: false, error: "This code was already used. Request a new one." });
  if (new Date(otp.expires_at).getTime() < Date.now())
    return res.json({ ok: false, error: "This code has expired. Request a new one." });
  if (otp.attempts >= 5)
    return res.json({ ok: false, error: "Too many attempts. Request a new code." });

  // Mark as used
  const { error: markUsedErr } = await supabase
    .from("otp_verifications")
    .update({ verified: true })
    .eq("id", otp.id);
  if (markUsedErr)
    return res.json({ ok: false, error: "Could not verify this code. Please try again." });

  // Fetch the user
  const { data: user, error: uErr } = await supabase
    .from("journey_users")
    .select("id, first_name, last_name, phone_number, onboarding_completed")
    .eq("phone_number", phone)
    .single();
  if (uErr || !user)
    return res.json({ ok: false, error: "Could not verify your account." });

  // Issue session cookie
  const sessionToken = await createSession(user.id, req);

  // Clean up all OTPs for this phone now that one was consumed
  await supabase.from("otp_verifications").delete().eq("phone_number", phone);

  // Ensure a journey_progress row exists for this user
  await supabase.from("journey_progress").upsert({ user_id: user.id }, { onConflict: "user_id" });

  res.setHeader("Set-Cookie", buildSetCookieHeader(sessionToken));
  return res.json({ ok: true, user });
}
