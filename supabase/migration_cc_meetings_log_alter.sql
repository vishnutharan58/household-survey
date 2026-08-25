-- Add start_date, end_date, and village to cc_meetings_log
ALTER TABLE public.cc_meetings_log
ADD COLUMN IF NOT EXISTS start_date TEXT,
ADD COLUMN IF NOT EXISTS end_date TEXT,
ADD COLUMN IF NOT EXISTS village TEXT;
