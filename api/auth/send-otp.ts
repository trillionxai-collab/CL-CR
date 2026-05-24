// POST /api/auth/send-otp
// Upserts the user, clears old OTPs, generates a new one, and fires the n8n webhook.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHash } from "crypto";
import { z } from "zod";
import { getAdminClient } from "../_lib/supabase.js";

const WEBHOOK_URL = "https://n8n-642200590.kloudbeansite.com/webhook/sent-otp";

const SendSchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  phone: z.string().trim().min(7).max(20),
});

function normalizePhone(p: string) {
  return p.replace(/[^\d+]/g, "");
}

function hashOtp(phone: string, code: string) {
  return createHash("sha256").update(`${phone}:${code}`).digest("hex");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const parsed = SendSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { firstName, lastName, phone: rawPhone } = parsed.data;
  const phone = normalizePhone(rawPhone);
  const supabase = getAdminClient();

  // Upsert user record
  const { error: upsertErr } = await supabase
    .from("journey_users")
    .upsert(
      { phone_number: phone, first_name: firstName, last_name: lastName },
      { onConflict: "phone_number" },
    );
  if (upsertErr) {
    console.error("journey_users upsert", upsertErr);
    return res.status(500).json({ error: "Could not save your details. Please try again." });
  }

  // Invalidate all previous OTPs so only the new code is valid
  await supabase.from("otp_verifications").delete().eq("phone_number", phone);

  // Generate 4-digit OTP expiring in 5 minutes
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const otp_hash = hashOtp(phone, code);
  const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { error: otpErr } = await supabase
    .from("otp_verifications")
    .insert({ phone_number: phone, otp_hash, expires_at });
  if (otpErr) {
    console.error("otp insert", otpErr);
    return res.status(500).json({ error: "Could not generate access code." });
  }

  // Fire n8n webhook — non-blocking, errors are logged but not surfaced to the user
  try {
    const webhookRes = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, phone, otp: code }),
    });
    if (!webhookRes.ok) console.error("webhook non-200", webhookRes.status);
  } catch (e) {
    console.error("webhook send failed", e);
  }

  return res.status(200).json({ ok: true });
}
