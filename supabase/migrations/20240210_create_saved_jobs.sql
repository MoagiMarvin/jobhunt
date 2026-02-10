-- SAVED JOBS TABLE

-- Application Status Enum
DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('saved', 'applied', 'interviewing', 'rejected', 'offered');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  job_data JSONB NOT NULL,
  status application_status DEFAULT 'saved' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS POLICIES
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- Users can view their own saved jobs
CREATE POLICY "Users can view own saved jobs" ON public.saved_jobs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own saved jobs
CREATE POLICY "Users can insert own saved jobs" ON public.saved_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own saved jobs
CREATE POLICY "Users can update own saved jobs" ON public.saved_jobs
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own saved jobs
CREATE POLICY "Users can delete own saved jobs" ON public.saved_jobs
  FOR DELETE USING (auth.uid() = user_id);
