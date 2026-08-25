-- Create cc_meetings_log table to track individual CC meetings
CREATE TABLE IF NOT EXISTS public.cc_meetings_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collective_id TEXT NOT NULL,
  collective_name TEXT NOT NULL,
  staff_email TEXT NOT NULL,
  meeting_date DATE NOT NULL,
  participants_added INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cc_meetings_log ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (Admin and Staff) to read and insert
CREATE POLICY "Allow authenticated read access to cc_meetings_log" 
ON public.cc_meetings_log FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert access to cc_meetings_log" 
ON public.cc_meetings_log FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');
