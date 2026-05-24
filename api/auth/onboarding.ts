// POST /api/auth/onboarding
// Saves the user's onboarding calibration and marks onboarding complete.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { getAdminClient } from "../_lib/supabase";
import { getSessionUser } from "../_lib/session";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const sessionUser = await getSessionUser(req);
  if (!sessionUser)
    return res.status(401).json({ error: "Session expired. Please sign in again." });

  const parsed = OnboardSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { dateOfBirth, gender, lifestyle, openMindConsent } = parsed.data;
  const supabase = getAdminClient();

  const { error } = await supabase
    .from("journey_users")
    .update({
      date_of_birth: dateOfBirth,
      gender,
      lifestyle,
      open_mind_consent: openMindConsent,
      onboarding_completed: true,
    })
    .eq("id", sessionUser.id);

  if (error) {
    console.error("onboarding update", error);
    return res.status(500).json({ error: "Could not save your calibration. Please try again." });
  }

  return res.json({ ok: true });
}
