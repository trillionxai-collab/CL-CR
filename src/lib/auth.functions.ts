import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { mySupabase } from "@/integrations/my-supabase/admin.server";
import {
  createSession,
  destroySession,
  getSessionSetCookieHeader,
  getSessionUser,
  type SessionUser,
} from "@/lib/session.server";
import { createHash } from "crypto";

const WEBHOOK_URL =
  "https://n8n-642200590.kloudbeansite.com/webhook/sent-otp";

function normalizePhone(p: string) {
  return p.replace(/[^\d+]/g, "");
}

function hashOtp(phone: string, code: string) {
  return createHash("sha256").update(`${phone}:${code}`).digest("hex");
}

/* ---------- sendOtp ---------- */

const SendSchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  phone: z.string().trim().min(7).max(20),
});

export const sendOtp = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SendSchema.parse(d))
  .handler(async ({ data }) => {
    const phone = normalizePhone(data.phone);
    const firstName = data.firstName.trim();
    const lastName = data.lastName.trim();

    // Upsert journey user
    const { error: upsertErr } = await mySupabase
      .from("journey_users")
      .upsert(
        { phone_number: phone, first_name: firstName, last_name: lastName },
        { onConflict: "phone_number" },
      );
    if (upsertErr) {
      console.error("journey_users upsert", upsertErr);
      throw new Error("Could not save your details. Please try again.");
    }

    // Invalidate ALL previous OTPs for this phone (verified or not) so only
    // the freshly issued code is valid. Without this, a stale verified row
    // can shadow the new code and verifyOtp returns "already used".
    const { error: cleanupErr } = await mySupabase
      .from("otp_verifications")
      .delete()
      .eq("phone_number", phone);
    if (cleanupErr) {
      console.error("otp cleanup", cleanupErr);
      throw new Error("Could not reset previous access codes. Please try again.");
    }

    // Generate 4-digit OTP, expires in 5 minutes
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const otp_hash = hashOtp(phone, code);
    const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error: otpErr } = await mySupabase
      .from("otp_verifications")
      .insert({ phone_number: phone, otp_hash, expires_at });
    if (otpErr) {
      console.error("otp insert", otpErr);
      throw new Error("Could not generate access code.");
    }

    // Fire webhook (n8n) — do not block the user if it fails.
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, otp: code }),
      });
      if (!res.ok)
        console.error("webhook non-200", res.status, await res.text());
    } catch (e) {
      console.error("webhook send failed", e);
    }

    return { ok: true as const };
  });

/* ---------- verifyOtp ---------- */

const VerifySchema = z.object({
  phone: z.string().trim().min(7).max(20),
  code: z.string().trim().regex(/^\d{4}$/),
});

type VerifyResult =
  | { ok: true; user: SessionUser }
  | { ok: false; error: string };

function verifyJson(result: VerifyResult, sessionToken?: string) {
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      "content-type": "application/json",
      ...(sessionToken ? { "set-cookie": getSessionSetCookieHeader(sessionToken) } : {}),
    },
  }) as unknown as VerifyResult;
}

export const verifyOtp = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => VerifySchema.parse(d))
  .handler(async ({ data }): Promise<VerifyResult> => {
    const phone = normalizePhone(data.phone);
    const otp_hash = hashOtp(phone, data.code);

    const { data: rows, error } = await mySupabase
      .from("otp_verifications")
      .select("id, otp_hash, expires_at, verified, attempts")
      .eq("phone_number", phone)
      .eq("otp_hash", otp_hash)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !rows || rows.length === 0) {
      const { data: latestRows } = await mySupabase
        .from("otp_verifications")
        .select("id, expires_at, verified, attempts")
        .eq("phone_number", phone)
        .eq("verified", false)
        .order("created_at", { ascending: false })
        .limit(1);

      const latest = latestRows?.[0];
      if (!latest) {
        return verifyJson({ ok: false, error: "No active access code found. Please request a new one." });
      }
      if (new Date(latest.expires_at).getTime() < Date.now()) {
        return verifyJson({ ok: false, error: "This code has expired. Request a new one." });
      }
      if (latest.attempts >= 5) {
        return verifyJson({ ok: false, error: "Too many attempts. Request a new code." });
      }
      await mySupabase
        .from("otp_verifications")
        .update({ attempts: latest.attempts + 1 })
        .eq("id", latest.id);
      return verifyJson({ ok: false, error: "That code doesn't match. Try again." });
    }
    const otp = rows[0];
    if (otp.verified) {
      return verifyJson({ ok: false, error: "This code was already used. Request a new one." });
    }
    if (new Date(otp.expires_at).getTime() < Date.now()) {
      return verifyJson({ ok: false, error: "This code has expired. Request a new one." });
    }
    if (otp.attempts >= 5) {
      return verifyJson({ ok: false, error: "Too many attempts. Request a new code." });
    }
    if (otp.otp_hash !== otp_hash) {
      await mySupabase
        .from("otp_verifications")
        .update({ attempts: otp.attempts + 1 })
        .eq("id", otp.id);
      return verifyJson({ ok: false, error: "That code doesn't match. Try again." });
    }

    const { error: markUsedErr } = await mySupabase
      .from("otp_verifications")
      .update({ verified: true })
      .eq("id", otp.id);
    if (markUsedErr) {
      console.error("otp mark used", markUsedErr);
      return verifyJson({ ok: false, error: "Could not verify this code. Please try again." });
    }

    const { data: user, error: uErr } = await mySupabase
      .from("journey_users")
      .select("id, first_name, last_name, phone_number, onboarding_completed")
      .eq("phone_number", phone)
      .single();
    if (uErr || !user) {
      return verifyJson({ ok: false, error: "Could not verify your account." });
    }

    // Issue persistent session cookie
    const sessionToken = await createSession(user.id);

    // Best-effort cleanup of older OTPs for this phone
    await mySupabase
      .from("otp_verifications")
      .delete()
      .eq("phone_number", phone);

    // Ensure a journey_progress row exists
    await mySupabase
      .from("journey_progress")
      .upsert({ user_id: user.id }, { onConflict: "user_id" });

    return verifyJson({ ok: true, user }, sessionToken);
  });

/* ---------- saveOnboarding ---------- */

const OnboardSchema = z.object({
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(["female", "male", "non-binary", "prefer-not-to-say"]),
  lifestyle: z.enum([
    "student",
    "working-professional",
    "entrepreneur",
    "creative",
    "homemaker",
    "exploring",
  ]),
  openMindConsent: z.boolean(),
});

export const saveOnboarding = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => OnboardSchema.parse(d))
  .handler(async ({ data }) => {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      throw new Error("Your session has expired. Please sign in again.");
    }
    const { error } = await mySupabase
      .from("journey_users")
      .update({
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
        lifestyle: data.lifestyle,
        open_mind_consent: data.openMindConsent,
        onboarding_completed: true,
      })
      .eq("id", sessionUser.id);
    if (error) {
      console.error("onboarding update", error);
      throw new Error("Could not save your calibration. Please try again.");
    }
    return { ok: true as const };
  });

/* ---------- session helpers ---------- */

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
  async (): Promise<SessionUser | null> => {
    return getSessionUser();
  },
);

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  await destroySession();
  return { ok: true as const };
});
