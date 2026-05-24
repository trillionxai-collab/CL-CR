// Client-side wrappers around the /api/auth/* Vercel serverless functions.
// No service role key is used here — all sensitive logic runs server-side in api/.

export type SessionUser = {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  onboarding_completed: boolean;
};

async function apiFetch(path: string, init?: RequestInit) {
  return fetch(path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

/* ---------- sendOtp ---------- */

export async function sendOtp(data: {
  firstName: string;
  lastName: string;
  phone: string;
}): Promise<{ ok: true }> {
  const res = await apiFetch("/api/auth/send-otp", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        "Auth API is not running locally. Use `npm run dev:full` instead of `npm run dev`.",
      );
    }
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to send OTP.");
  }
  return { ok: true };
}

/* ---------- verifyOtp ---------- */

type VerifyResult = { ok: true; user: SessionUser } | { ok: false; error: string };

export async function verifyOtp(data: {
  phone: string;
  code: string;
}): Promise<VerifyResult> {
  const res = await apiFetch("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json() as Promise<VerifyResult>;
}

/* ---------- getCurrentUser ---------- */

export async function getCurrentUser(): Promise<SessionUser | null> {
  const res = await apiFetch("/api/auth/me");
  if (!res.ok) return null;
  const data = (await res.json()) as { user: SessionUser | null };
  return data.user;
}

/* ---------- saveOnboarding ---------- */

export async function saveOnboarding(data: {
  dateOfBirth: string;
  gender: string;
  lifestyle: string;
  openMindConsent: boolean;
}): Promise<{ ok: true }> {
  const res = await apiFetch("/api/auth/onboarding", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Could not save your calibration.");
  }
  return { ok: true };
}

/* ---------- signOut ---------- */

export async function signOut(): Promise<{ ok: true }> {
  const res = await apiFetch("/api/auth/signout", { method: "POST" });
  if (!res.ok) throw new Error("Could not sign out.");
  return { ok: true };
}
