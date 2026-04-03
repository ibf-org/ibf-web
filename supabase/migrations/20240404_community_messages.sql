-- Create community_messages table for persistent real-time chat
CREATE TABLE IF NOT EXISTS community_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL DEFAULT 'general',
  author_name text NOT NULL,
  author_id text NOT NULL,
  author_role text NOT NULL DEFAULT 'member', -- 'founder' | 'student' | 'system'
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read messages
CREATE POLICY "Authenticated users can read messages"
  ON community_messages FOR SELECT
  USING (auth.role() = 'authenticated');

-- Anyone authenticated can insert their own messages
CREATE POLICY "Authenticated users can insert messages"
  ON community_messages FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Enable real-time for this table
ALTER PUBLICATION supabase_realtime ADD TABLE community_messages;

-- Seed some starter messages
INSERT INTO community_messages (channel, author_name, author_id, author_role, content) VALUES
  ('general', 'IBF System', 'system', 'system', '👋 Welcome to the IBF Community! This is a real-time space for founders and students to connect, share ideas, and build together.'),
  ('general', 'Rahul K.', 'seed1', 'founder', 'Just crossed 100 beta users on our AI Legal Assistant! Anyone else seeing strong retention in week 2? 🚀'),
  ('general', 'Priya M.', 'seed2', 'student', 'Congrats Rahul! Personalization features drive week-2 retention on our platform too.'),
  ('founder-lounge', 'IBF System', 'system', 'system', '🔒 Founder-only space. Share what you''re building, ask for feedback, and collaborate.'),
  ('founder-lounge', 'Sonali P.', 'seed3', 'founder', 'Quick poll: Are you charging from day 1 or building first? I say charge from day 1 — it validates faster.'),
  ('find-talent', 'IBF System', 'system', 'system', '🎯 Post your open roles here and connect with students looking for real startup experience.'),
  ('find-talent', 'Arjun S.', 'seed4', 'founder', '🔍 Looking for a Flutter dev with Firebase experience. DM or check our IBF project page!'),
  ('introductions', 'IBF System', 'system', 'system', '👋 New here? Say hello! Tell us your name, what you''re building or what you''re looking for.'),
  ('introductions', 'Aditya R.', 'seed5', 'student', 'Hi everyone! Final year CS at NIT Trichy, specializing in ML/AI. Looking for a climate tech or health startup to join. 🌍');
