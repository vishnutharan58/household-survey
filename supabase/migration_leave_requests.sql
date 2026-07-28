-- Supabase Migration Script for Staff Leave Requests System
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.leave_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_email TEXT NOT NULL,
  staff_name TEXT,
  leave_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on leave_requests
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- Allow read/insert/update access
CREATE POLICY "Allow public all access on leave_requests"
  ON public.leave_requests FOR ALL USING (true);

-- Trigger for updated_at column
DROP TRIGGER IF EXISTS update_leave_requests_modtime ON public.leave_requests;
CREATE TRIGGER update_leave_requests_modtime
BEFORE UPDATE ON public.leave_requests
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
