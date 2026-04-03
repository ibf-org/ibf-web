-- IBF (Innovators Bridge Foundry) — Initial Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('founder', 'student')),
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROFILES TABLE
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  university TEXT,
  grad_year INT,
  github_url TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  availability_status TEXT DEFAULT 'actively_looking',
  location_city TEXT,
  startup_name TEXT,
  startup_tagline TEXT,
  startup_website TEXT,
  startup_stage TEXT
);

-- PROJECTS TABLE
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  founder_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  stage TEXT NOT NULL,
  category TEXT NOT NULL,
  cover_image_url TEXT,
  website_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'paused', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROLES TABLE
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  skills_required TEXT[] DEFAULT '{}',
  commitment_type TEXT NOT NULL,
  compensation_type TEXT NOT NULL,
  num_openings INT DEFAULT 1,
  is_filled BOOLEAN DEFAULT FALSE
);

-- APPLICATIONS TABLE
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  cover_note TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (role_id, student_id)
);

-- TEAM MEMBERS TABLE
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  removed_at TIMESTAMPTZ,
  stream_channel_id TEXT,
  UNIQUE (project_id, user_id)
);

-- ENDORSEMENTS TABLE
CREATE TABLE public.endorsements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  giver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (giver_id, receiver_id, project_id)
);

-- NOTIFICATIONS TABLE
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SAVED PROFILES TABLE
CREATE TABLE public.saved_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  founder_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (founder_id, student_id)
);

-- TASKS TABLE (for team workspace Kanban)
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  due_date DATE,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PINNED LINKS TABLE
CREATE TABLE public.pinned_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- UPDATE TIMESTAMP TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- ROW LEVEL SECURITY
-- =====================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pinned_links ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's Supabase UUID from clerk_id stored in JWT
CREATE OR REPLACE FUNCTION get_my_user_id()
RETURNS UUID AS $$
  SELECT id FROM public.users WHERE clerk_id = auth.jwt() ->> 'sub' LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- USERS policies
CREATE POLICY "Users are publicly readable" ON public.users FOR SELECT USING (TRUE);
CREATE POLICY "Users can update their own record" ON public.users FOR UPDATE USING (clerk_id = auth.jwt() ->> 'sub');

-- PROFILES policies  
CREATE POLICY "Profiles are publicly readable" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (user_id = get_my_user_id());
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (user_id = get_my_user_id());

-- PROJECTS policies
CREATE POLICY "Public projects readable by all" ON public.projects FOR SELECT USING (is_public = TRUE OR founder_id = get_my_user_id());
CREATE POLICY "Founders can insert their own projects" ON public.projects FOR INSERT WITH CHECK (founder_id = get_my_user_id());
CREATE POLICY "Founders can update their own projects" ON public.projects FOR UPDATE USING (founder_id = get_my_user_id());
CREATE POLICY "Founders can delete their own projects" ON public.projects FOR DELETE USING (founder_id = get_my_user_id());

-- ROLES policies
CREATE POLICY "Roles readable by all authenticated users" ON public.roles FOR SELECT USING (TRUE);
CREATE POLICY "Founders can manage roles on their projects" ON public.roles FOR ALL USING (
  project_id IN (SELECT id FROM public.projects WHERE founder_id = get_my_user_id())
);

-- APPLICATIONS policies
CREATE POLICY "Students can read their own applications" ON public.applications FOR SELECT USING (student_id = get_my_user_id());
CREATE POLICY "Founders can read applications for their projects" ON public.applications FOR SELECT USING (
  role_id IN (SELECT r.id FROM public.roles r JOIN public.projects p ON r.project_id = p.id WHERE p.founder_id = get_my_user_id())
);
CREATE POLICY "Students can create applications" ON public.applications FOR INSERT WITH CHECK (student_id = get_my_user_id());
CREATE POLICY "Students can update their own applications" ON public.applications FOR UPDATE USING (student_id = get_my_user_id());
CREATE POLICY "Founders can update application status" ON public.applications FOR UPDATE USING (
  role_id IN (SELECT r.id FROM public.roles r JOIN public.projects p ON r.project_id = p.id WHERE p.founder_id = get_my_user_id())
);

-- TEAM MEMBERS policies
CREATE POLICY "Team members readable by project members" ON public.team_members FOR SELECT USING (
  project_id IN (SELECT id FROM public.projects WHERE founder_id = get_my_user_id())
  OR user_id = get_my_user_id()
);
CREATE POLICY "Service role can insert team members" ON public.team_members FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Founders can remove team members" ON public.team_members FOR DELETE USING (
  project_id IN (SELECT id FROM public.projects WHERE founder_id = get_my_user_id())
);

-- NOTIFICATIONS policies
CREATE POLICY "Users can read their own notifications" ON public.notifications FOR SELECT USING (user_id = get_my_user_id());
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (user_id = get_my_user_id());
CREATE POLICY "Service role can insert notifications" ON public.notifications FOR INSERT WITH CHECK (TRUE);

-- SAVED PROFILES policies
CREATE POLICY "Founders can manage their saved profiles" ON public.saved_profiles FOR ALL USING (founder_id = get_my_user_id());

-- TASKS policies
CREATE POLICY "Team members can view and manage tasks" ON public.tasks FOR ALL USING (
  project_id IN (
    SELECT project_id FROM public.team_members WHERE user_id = get_my_user_id()
    UNION
    SELECT id FROM public.projects WHERE founder_id = get_my_user_id()
  )
);

-- PINNED LINKS policies
CREATE POLICY "Team members can view pinned links" ON public.pinned_links FOR SELECT USING (
  project_id IN (
    SELECT project_id FROM public.team_members WHERE user_id = get_my_user_id()
    UNION
    SELECT id FROM public.projects WHERE founder_id = get_my_user_id()
  )
);
CREATE POLICY "Founders can manage pinned links" ON public.pinned_links FOR ALL USING (
  project_id IN (SELECT id FROM public.projects WHERE founder_id = get_my_user_id())
);

-- ENDORSEMENTS policies
CREATE POLICY "Endorsements are publicly readable" ON public.endorsements FOR SELECT USING (TRUE);
CREATE POLICY "Founders can create endorsements" ON public.endorsements FOR INSERT WITH CHECK (giver_id = get_my_user_id());

-- INDEXES
CREATE INDEX idx_projects_founder_id ON public.projects(founder_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_category ON public.projects(category);
CREATE INDEX idx_roles_project_id ON public.roles(project_id);
CREATE INDEX idx_applications_student_id ON public.applications(student_id);
CREATE INDEX idx_applications_role_id ON public.applications(role_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_team_members_project_id ON public.team_members(project_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
