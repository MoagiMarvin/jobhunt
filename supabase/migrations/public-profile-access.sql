-- 1. Enable RLS on all relevant tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.references ENABLE ROW LEVEL SECURITY;

-- 2. Ensure missing columns exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='skills' AND column_name='is_soft_skill') THEN
        ALTER TABLE public.skills ADD COLUMN is_soft_skill BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 3. Clear existing conflicting policies explicitly to avoid reserved keyword issues
DROP POLICY IF EXISTS "Users can manage own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

DROP POLICY IF EXISTS "Users can manage own qualifications" ON public.qualifications;
DROP POLICY IF EXISTS "Public qualifications are viewable by everyone" ON public.qualifications;

DROP POLICY IF EXISTS "Users can manage own work_experiences" ON public.work_experiences;
DROP POLICY IF EXISTS "Public work experiences are viewable by everyone" ON public.work_experiences;

DROP POLICY IF EXISTS "Users can manage own skills" ON public.skills;
DROP POLICY IF EXISTS "Public skills are viewable by everyone" ON public.skills;

DROP POLICY IF EXISTS "Users can manage own projects" ON public.projects;
DROP POLICY IF EXISTS "Public projects are viewable by everyone" ON public.projects;

DROP POLICY IF EXISTS "Users can manage own languages" ON public.languages;
DROP POLICY IF EXISTS "Public languages are viewable by everyone" ON public.languages;

DROP POLICY IF EXISTS "Users can manage own references" ON public.references;
DROP POLICY IF EXISTS "Public references are viewable by everyone" ON public.references;

-- 4. Add Public Read Policies (Allow everyone to see profiles)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public qualifications are viewable by everyone" ON public.qualifications FOR SELECT USING (true);
CREATE POLICY "Public work experiences are viewable by everyone" ON public.work_experiences FOR SELECT USING (true);
CREATE POLICY "Public skills are viewable by everyone" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Public projects are viewable by everyone" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public languages are viewable by everyone" ON public.languages FOR SELECT USING (true);
CREATE POLICY "Public references are viewable by everyone" ON public.references FOR SELECT USING (true);

-- 5. Add Private Write Policies (Only owner can edit)
-- Profiles: Users can update their own row (id matches auth.uid())
CREATE POLICY "Users can manage own profiles" ON public.profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Other tables: user_id matches auth.uid()
CREATE POLICY "Users can manage own qualifications" ON public.qualifications
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own work_experiences" ON public.work_experiences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own skills" ON public.skills
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own projects" ON public.projects
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own languages" ON public.languages
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own references" ON public.references
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

