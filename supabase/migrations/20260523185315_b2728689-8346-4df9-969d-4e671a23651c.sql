ALTER TABLE public.journey_users
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS lifestyle text,
  ADD COLUMN IF NOT EXISTS onboarded_at timestamptz;

CREATE POLICY "Public can update journey users by phone"
ON public.journey_users
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);