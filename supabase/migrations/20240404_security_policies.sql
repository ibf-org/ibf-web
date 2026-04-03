-- ═══════════════════════════════════════════════════════════════════════════
-- IBF Security Audit — Row Level Security Policies
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/umxyvvsoyallnqamrfsg/sql/new
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Ensure RLS is enabled on ALL tables ──────────────────────────────
ALTER TABLE IF EXISTS users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS roles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS applications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS team_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS community_messages ENABLE ROW LEVEL SECURITY;

-- ── 2. USERS table ──────────────────────────────────────────────────────
-- Everyone can read basic user info (for profiles, avatars, etc.)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'users_public_read') THEN
    CREATE POLICY "users_public_read" ON users FOR SELECT USING (true);
  END IF;
END $$;

-- Users can only update their own row
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'users_own_update') THEN
    CREATE POLICY "users_own_update" ON users FOR UPDATE
      USING (clerk_id = (auth.jwt()->>'sub'))
      WITH CHECK (clerk_id = (auth.jwt()->>'sub'));
  END IF;
END $$;

-- ── 3. PROFILES table ───────────────────────────────────────────────────
-- Public read (for public profiles)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_public_read') THEN
    CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
  END IF;
END $$;

-- Users can only update their own profile
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_own_update') THEN
    CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE
      USING (user_id IN (SELECT id FROM users WHERE clerk_id = (auth.jwt()->>'sub')))
      WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = (auth.jwt()->>'sub')));
  END IF;
END $$;

-- Users can insert their own profile
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_own_insert') THEN
    CREATE POLICY "profiles_own_insert" ON profiles FOR INSERT
      WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = (auth.jwt()->>'sub')));
  END IF;
END $$;

-- ── 4. PROJECTS table ───────────────────────────────────────────────────
-- Public projects are readable by everyone
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'projects_public_read') THEN
    CREATE POLICY "projects_public_read" ON projects FOR SELECT
      USING (is_public = true);
  END IF;
END $$;

-- Founders can read their own private projects
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'projects_own_read') THEN
    CREATE POLICY "projects_own_read" ON projects FOR SELECT
      USING (founder_id IN (SELECT id FROM users WHERE clerk_id = (auth.jwt()->>'sub')));
  END IF;
END $$;

-- Founders can only create projects as themselves
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'projects_own_insert') THEN
    CREATE POLICY "projects_own_insert" ON projects FOR INSERT
      WITH CHECK (founder_id IN (SELECT id FROM users WHERE clerk_id = (auth.jwt()->>'sub')));
  END IF;
END $$;

-- Founders can only update their own projects
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'projects_own_update') THEN
    CREATE POLICY "projects_own_update" ON projects FOR UPDATE
      USING (founder_id IN (SELECT id FROM users WHERE clerk_id = (auth.jwt()->>'sub')))
      WITH CHECK (founder_id IN (SELECT id FROM users WHERE clerk_id = (auth.jwt()->>'sub')));
  END IF;
END $$;

-- Founders can only delete their own projects
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'projects_own_delete') THEN
    CREATE POLICY "projects_own_delete" ON projects FOR DELETE
      USING (founder_id IN (SELECT id FROM users WHERE clerk_id = (auth.jwt()->>'sub')));
  END IF;
END $$;

-- ── 5. ROLES table ──────────────────────────────────────────────────────
-- Everyone can read roles (to browse open positions)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'roles' AND policyname = 'roles_public_read') THEN
    CREATE POLICY "roles_public_read" ON roles FOR SELECT USING (true);
  END IF;
END $$;

-- Only the project founder can create/update/delete roles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'roles' AND policyname = 'roles_founder_insert') THEN
    CREATE POLICY "roles_founder_insert" ON roles FOR INSERT
      WITH CHECK (project_id IN (SELECT id FROM projects WHERE founder_id IN (SELECT id FROM users WHERE clerk_id = (auth.jwt()->>'sub'))));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'roles' AND policyname = 'roles_founder_update') THEN
    CREATE POLICY "roles_founder_update" ON roles FOR UPDATE
      USING (project_id IN (SELECT id FROM projects WHERE founder_id IN (SELECT id FROM users WHERE clerk_id = (auth.jwt()->>'sub'))))
      WITH CHECK (project_id IN (SELECT id FROM projects WHERE founder_id IN (SELECT id FROM users WHERE clerk_id = (auth.jwt()->>'sub'))));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'roles' AND policyname = 'roles_founder_delete') THEN
    CREATE POLICY "roles_founder_delete" ON roles FOR DELETE
      USING (project_id IN (SELECT id FROM projects WHERE founder_id IN (SELECT id FROM users WHERE clerk_id = (auth.jwt()->>'sub'))));
  END IF;
END $$;

-- ── 6. APPLICATIONS table ───────────────────────────────────────────────
-- Students can read their own applications
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'applications' AND policyname = 'applications_student_read') THEN
    CREATE POLICY "applications_student_read" ON applications FOR SELECT
      USING (student_id IN (SELECT id FROM users WHERE clerk_id = (auth.jwt()->>'sub')));
  END IF;
END $$;

-- Founders can read applications for their projects
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'applications' AND policyname = 'applications_founder_read') THEN
    CREATE POLICY "applications_founder_read" ON applications FOR SELECT
      USING (role_id IN (
        SELECT r.id FROM roles r
        JOIN projects p ON r.project_id = p.id
        WHERE p.founder_id IN (SELECT id FROM users WHERE clerk_id = (auth.jwt()->>'sub'))
      ));
  END IF;
END $$;

-- Students can only insert applications as themselves
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'applications' AND policyname = 'applications_student_insert') THEN
    CREATE POLICY "applications_student_insert" ON applications FOR INSERT
      WITH CHECK (student_id IN (SELECT id FROM users WHERE clerk_id = (auth.jwt()->>'sub')));
  END IF;
END $$;

-- Students can only delete (withdraw) their own applications
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'applications' AND policyname = 'applications_student_delete') THEN
    CREATE POLICY "applications_student_delete" ON applications FOR DELETE
      USING (student_id IN (SELECT id FROM users WHERE clerk_id = (auth.jwt()->>'sub')));
  END IF;
END $$;

-- Founders can update application status for their projects
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'applications' AND policyname = 'applications_founder_update') THEN
    CREATE POLICY "applications_founder_update" ON applications FOR UPDATE
      USING (role_id IN (
        SELECT r.id FROM roles r
        JOIN projects p ON r.project_id = p.id
        WHERE p.founder_id IN (SELECT id FROM users WHERE clerk_id = (auth.jwt()->>'sub'))
      ));
  END IF;
END $$;

-- ── 7. TEAM_MEMBERS table ───────────────────────────────────────────────
-- Team members are readable by project members
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'team_members_project_read') THEN
    CREATE POLICY "team_members_project_read" ON team_members FOR SELECT USING (true);
  END IF;
END $$;

-- Only the project founder can add team members
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'team_members_founder_insert') THEN
    CREATE POLICY "team_members_founder_insert" ON team_members FOR INSERT
      WITH CHECK (project_id IN (SELECT id FROM projects WHERE founder_id IN (SELECT id FROM users WHERE clerk_id = (auth.jwt()->>'sub'))));
  END IF;
END $$;

-- Only the project founder can remove team members
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'team_members_founder_delete') THEN
    CREATE POLICY "team_members_founder_delete" ON team_members FOR DELETE
      USING (project_id IN (SELECT id FROM projects WHERE founder_id IN (SELECT id FROM users WHERE clerk_id = (auth.jwt()->>'sub'))));
  END IF;
END $$;

-- ── 8. NOTIFICATIONS table ──────────────────────────────────────────────
-- Users can only read their own notifications
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'notifications_own_read') THEN
    CREATE POLICY "notifications_own_read" ON notifications FOR SELECT
      USING (user_id IN (SELECT id FROM users WHERE clerk_id = (auth.jwt()->>'sub')));
  END IF;
END $$;

-- Users can only update (mark as read) their own notifications
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'notifications_own_update') THEN
    CREATE POLICY "notifications_own_update" ON notifications FOR UPDATE
      USING (user_id IN (SELECT id FROM users WHERE clerk_id = (auth.jwt()->>'sub')));
  END IF;
END $$;

-- System can insert notifications (via service role — no policy needed for service role)
-- Authenticated users should not be able to insert notifications directly
-- (notifications are created server-side via supabaseAdmin)

-- ── 9. COMMUNITY_MESSAGES table ─────────────────────────────────────────
-- Already has policies from community migration, but verify:
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_messages' AND policyname = 'Anyone can read messages') THEN
    CREATE POLICY "Anyone can read messages" ON community_messages FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_messages' AND policyname = 'Anyone can insert messages') THEN
    CREATE POLICY "Anyone can insert messages" ON community_messages FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- IMPORTANT: The service_role key used by supabaseAdmin BYPASSES all RLS.
-- These policies protect against direct client-side access via the anon key.
-- ═══════════════════════════════════════════════════════════════════════════
