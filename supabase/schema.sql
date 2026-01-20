-- USERS (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  email text,
  linkedin_url text,
  portfolio_url text,
  phone text,
  summary text, -- The "Master Summary"
  education_level text, -- e.g., "Matric", "Diploma", "Bachelor", "Honours", "Masters", "PhD"
  master_cv JSONB DEFAULT '{}'::jsonb, -- The "Master Profile" (Skills, Exp, Edu, etc.)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- EDUCATIONS
create table public.educations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  school text not null,
  degree text not null,
  field_of_study text,
  start_date date,
  end_date date,
  is_current boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- WORK EXPERIENCES
create table public.work_experiences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  company text not null,
  position text not null,
  location text,
  start_date date,
  end_date date,
  is_current boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- EXPERIENCE BULLETS (The "Atomic" units for AI to pick)
create table public.experience_bullets (
  id uuid default uuid_generate_v4() primary key,
  experience_id uuid references public.work_experiences(id) on delete cascade not null,
  content text not null, -- e.g., "Led a team of 5 developers..."
  tags text[], -- e.g., ["management", "react"] - helpful for AI filtering
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SKILLS (The "Bank")
create table public.skills (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  name text not null, -- e.g., "Python"
  category text, -- e.g., "Language", "Framework", "Soft Skill"
  proficiency_level text, -- "Beginner", "Intermediate", "Advanced", "Expert"
  min_experience_years numeric, -- e.g., 0.5, 2, 5 (in years)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROJECTS
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  description text,
  technologies text[], -- e.g., ["Next.js", "Supabase"]
  link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- GENERATED CVS (History)
create table public.generated_cvs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  job_title text,
  company_name text,
  job_description_text text, -- What we scraped
  pdf_url text, -- Storage link
  selected_bullet_ids uuid[], -- Which bullets were used
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TALENT GROUPS (For Recruiters to organize candidates)
create table public.talent_groups (
  id uuid default uuid_generate_v4() primary key,
  recruiter_id uuid references auth.users not null,
  name text not null, -- e.g., "Doctor - Hospital XYZ" or "Senior Developer - TechCorp"
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SAVED CANDIDATES (In Groups)
create table public.saved_candidates (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.talent_groups(id) on delete cascade not null,
  talent_id text not null, -- Referencing talent by ID (can be from mock data or profiles)
  talent_name text not null,
  talent_headline text,
  talent_sector text,
  notes text, -- Recruiter notes about why they saved this candidate
  saved_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RECRUITER PROFILES
create table public.recruiter_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null unique,
  company_name text not null,
  full_name text not null,
  email text not null,
  phone text,
  company_website text,
  job_board_url text, -- Where they post jobs (RSS feed, API endpoint, etc.)
  job_board_type text, -- "rss", "json_api", "xml_sitemap", "manual"
  verification_status text default 'pending', -- "pending", "verified", "rejected"
  verification_token text,
  verified_at timestamp with time zone,
  industry text, -- e.g., "Tech", "Finance", "Healthcare"
  specializations text[], -- e.g., ["React Developer", "Full Stack"]
  company_size text, -- "Solo", "Small (2-10)", "Medium (11-50)", "Large (50+)"
  years_in_business integer,
  linkedin_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SYNCED JOBS (From recruiter job boards)
create table public.synced_jobs (
  id uuid default uuid_generate_v4() primary key,
  recruiter_id uuid references public.recruiter_profiles(id) on delete cascade not null,
  external_job_id text, -- Job ID from recruiter's system
  title text not null,
  description text,
  location text,
  salary_min numeric,
  salary_max numeric,
  job_type text, -- "Full-time", "Contract", "Part-time"
  posted_date timestamp with time zone,
  application_url text, -- Where to submit on recruiter's site
  sync_metadata jsonb, -- Store original feed data for updates/deletes
  last_synced_at timestamp with time zone,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- JOB APPLICATIONS (Candidates applying through our platform)
create table public.job_applications (
  id uuid default uuid_generate_v4() primary key,
  synced_job_id uuid references public.synced_jobs(id) on delete cascade not null,
  candidate_id uuid references public.profiles(id) on delete cascade not null,
  recruiter_id uuid references public.recruiter_profiles(id) not null,
  candidate_name text not null,
  candidate_email text not null,
  resume_url text,
  cover_letter text,
  webhook_sent_at timestamp with time zone,
  webhook_status text, -- "pending", "delivered", "failed"
  webhook_response jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROFESSIONAL REFERENCES
create table public.references (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  relationship text, -- e.g., "Former Manager"
  company text,
  phone text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SECONDARY EDUCATION (MATRIC)
create table public.secondary_education (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  school_name text not null,
  completion_year integer,
  subjects jsonb default '[]'::jsonb, -- e.g., [{"subject": "Mathematics", "grade": "Level 7"}]
  distinctions_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
