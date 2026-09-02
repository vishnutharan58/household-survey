-- Migration to add a Holidays table
CREATE TABLE IF NOT EXISTS public.holidays (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    holiday_date DATE NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for Holidays
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for holidays"
ON public.holidays FOR SELECT
USING (true);

-- Allow authenticated users to insert/update/delete holidays (in a real app, restrict to admins)
CREATE POLICY "Auth users insert access for holidays"
ON public.holidays FOR INSERT
WITH CHECK (auth.role() = 'authenticated' OR true);

CREATE POLICY "Auth users update access for holidays"
ON public.holidays FOR UPDATE
USING (auth.role() = 'authenticated' OR true);

CREATE POLICY "Auth users delete access for holidays"
ON public.holidays FOR DELETE
USING (auth.role() = 'authenticated' OR true);
