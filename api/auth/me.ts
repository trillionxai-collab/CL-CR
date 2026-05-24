// GET /api/auth/me
// Returns the currently authenticated user based on the session cookie, or 401.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSessionUser } from "../_lib/session.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const user = await getSessionUser(req);
  if (!user) return res.status(401).json({ user: null });
  return res.json({ user });
}
