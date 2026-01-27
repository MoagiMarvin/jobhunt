-- TALENT SCHEMA - Complete database structure for talent profiles
-- This includes: profiles, qualifications (unified), work experience, skills, projects, languages, references

-- ENUMS
DO $$ BEGIN
    CREATE TYPE qualification_type AS ENUM ('high_school', 'tertiary', 'certification');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. PROFILES (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  headline TEXT,
  summary TEXT,
  location TEXT,
  avatar_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  availability_status TEXT DEFAULT 'Looking for Work',
  target_roles TEXT[] DEFAULT '{}',
  have_license BOOLEAN DEFAULT false,
  license_code TEXT,
  have_car BOOLEAN DEFAULT false,
  master_cv JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. QUALIFICATIONS (Unified: Matric, University, Certificates)
CREATE TABLE IF NOT EXISTS public.qualifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type qualification_type NOT NULL,
  title TEXT NOT NULL,
  institution TEXT NOT NULL,
  year INTEGER,
  start_date DATE,
  end_date DATE,
  document_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. WORK EXPERIENCES
CREATE TABLE IF NOT EXISTS public.work_experiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  location TEXT,
  description TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. EXPERIENCE BULLETS (For AI Selection)
CREATE TABLE IF NOT EXISTS public.experience_bullets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id UUID REFERENCES public.work_experiences(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. SKILLS (The Bank)
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  proficiency_level TEXT,
  min_experience_years NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  technologies TEXT[] DEFAULT '{}',
  link TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. LANGUAGES
CREATE TABLE IF NOT EXISTS public.languages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  language TEXT NOT NULL,
  proficiency TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. REFERENCES
CREATE TABLE IF NOT EXISTS public.references (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT,
  company TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. GENERATED CVS (History)
CREATE TABLE IF NOT EXISTS public.generated_cvs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  job_title TEXT,
  company_name TEXT,
  job_description_text TEXT,
  pdf_url TEXT,
  selected_bullet_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
