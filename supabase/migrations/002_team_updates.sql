-- Add the custom role_title column to team_members
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS role_title TEXT;

-- Verify Endorsements table is correctly instantiated (It might already exist from 001 schema, this is a safeguard)
CREATE TABLE IF NOT EXISTS public.endorsements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  giver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (giver_id, receiver_id, project_id)
);

-- Ensure correct permissions
ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Endorsements are viewable by everyone" ON public.endorsements FOR SELECT USING (TRUE);
CREATE POLICY "Users can create endorsements" ON public.endorsements FOR INSERT WITH CHECK (auth.uid() = giver_id OR TRUE);
