-- Add startups table
CREATE TABLE IF NOT EXISTS public.startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT,
  tagline TEXT,
  description TEXT,
  stage TEXT,
  category TEXT,
  website_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  logo_url TEXT,
  founded_year INT,
  team_size TEXT,
  looking_for TEXT[],
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;

-- Apply policies
CREATE POLICY "founders_manage_startup" ON public.startups FOR ALL USING (founder_id IN (SELECT id FROM public.users WHERE clerk_id = auth.jwt()->>'sub'));
CREATE POLICY "public_startups_readable" ON public.startups FOR SELECT USING (is_public = true);

-- Setup storage bucket for startup logos
INSERT INTO storage.buckets (id, name, public) VALUES ('startup-logos', 'startup-logos', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Public access for logos" ON storage.objects FOR SELECT USING (bucket_id = 'startup-logos');
CREATE POLICY "Authenticated users can insert logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'startup-logos' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update their logos" ON storage.objects FOR UPDATE USING (bucket_id = 'startup-logos' AND auth.role() = 'authenticated');
