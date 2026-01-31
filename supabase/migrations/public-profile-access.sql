-- 1. Enable RLS on all relevant tables (just in case they aren't)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.references ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they conflict (Optional but safer)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public qualifications are viewable by everyone" ON public.qualifications;
DROP POLICY IF EXISTS "Public work experiences are viewable by everyone" ON public.work_experiences;
DROP POLICY IF EXISTS "Public skills are viewable by everyone" ON public.skills;
DROP POLICY IF EXISTS "Public projects are viewable by everyone" ON public.projects;
DROP POLICY IF EXISTS "Public languages are viewable by everyone" ON public.languages;
DROP POLICY IF EXISTS "Public references are viewable by everyone" ON public.references;

-- 3. Add Public Read Policies
-- profiles: Anyone can view any profile
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

-- qualifications: Anyone can view qualifications for any user
CREATE POLICY "Public qualifications are viewable by everyone" ON public.qualifications
  FOR SELECT USING (true);

-- work_experiences: Anyone can view work experiences for any user
CREATE POLICY "Public work experiences are viewable by everyone" ON public.work_experiences
  FOR SELECT USING (true);

-- skills: Anyone can view skills for any user
CREATE POLICY "Public skills are viewable by everyone" ON public.skills
  FOR SELECT USING (true);

-- projects: Anyone can view projects for any user
CREATE POLICY "Public projects are viewable by everyone" ON public.projects
  FOR SELECT USING (true);

-- languages: Anyone can view languages for any user
CREATE POLICY "Public languages are viewable by everyone" ON public.languages
  FOR SELECT USING (true);

-- references: Anyone can view references for any user
CREATE POLICY "Public references are viewable by everyone" ON public.references
  FOR SELECT USING (true);
