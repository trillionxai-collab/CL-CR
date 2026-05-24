// POST /api/auth/signout
// Destroys the session and clears the session cookie.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { destroySession, buildClearCookieHeader } from "../_lib/session.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  await destroySession(req);
  res.setHeader("Set-Cookie", buildClearCookieHeader(req));
  return res.json({ ok: true });
}
