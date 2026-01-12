-- USERS (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  email text,
  linkedin_url text,
  portfolio_url text,
  phone text,
  summary text, -- The "Master Summary"
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
  proficiency_level text, -- "Beginner", "Intermediate", "Expert"
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
