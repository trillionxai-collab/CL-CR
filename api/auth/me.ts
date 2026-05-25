// GET /api/auth/me
// Returns the currently authenticated user based on the session cookie.
// If no valid session exists, returns { user: null } with 200.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildSetCookieHeader, getSessionUser } from "../_lib/session.js";

function getSessionTokenFromCookieHeader(header: string | undefined) {
  if (!header) return null;
  const parts = header.split(";");
  for (const part of parts) {
    const [k, ...rest] = part.trim().split("=");
    if (k === "hrj_session") return rest.join("=");
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const user = await getSessionUser(req);
  if (!user) return res.json({ user: null });

  const token = getSessionTokenFromCookieHeader(req.headers.cookie as string | undefined);
  if (token) {
    // Keep browser cookie alive for active users.
    res.setHeader("Set-Cookie", buildSetCookieHeader(token, req));
  }

  return res.json({ user });
}
