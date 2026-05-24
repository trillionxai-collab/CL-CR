
CREATE TABLE public.journey_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL UNIQUE,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.journey_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert journey users"
ON public.journey_users FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Public can read journey users by phone"
ON public.journey_users FOR SELECT TO anon, authenticated
USING (true);

CREATE TABLE public.otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean NOT NULL DEFAULT false,
  attempts int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_otp_codes_phone ON public.otp_codes(phone, created_at DESC);

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- No public policies: only service role (server functions) may read/write OTPs.

CREATE TRIGGER trg_journey_users_updated_at
BEFORE UPDATE ON public.journey_users
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
