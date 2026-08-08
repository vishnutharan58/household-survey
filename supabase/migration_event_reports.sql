-- Create Event Reports table for Staff to submit event details
CREATE TABLE IF NOT EXISTS public.event_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  staff_email TEXT NOT NULL,
  achieved_participants INTEGER DEFAULT 0,
  start_time TEXT,
  end_time TEXT,
  event_date DATE,
  place TEXT,
  resource_person TEXT,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on event_reports table
ALTER TABLE public.event_reports ENABLE ROW LEVEL SECURITY;

-- Policies for event_reports
CREATE POLICY "Allow public read access to event_reports" ON public.event_reports
  FOR SELECT USING (true);

CREATE POLICY "Admin full access event_reports" ON public.event_reports
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Staff insert access event_reports" ON public.event_reports
  FOR INSERT WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'staff'
  );

CREATE POLICY "Staff update own event_reports" ON public.event_reports
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'staff' AND
    staff_email = auth.jwt() ->> 'email'
  );

CREATE TRIGGER update_event_reports_modtime
BEFORE UPDATE ON event_reports
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
