-- Run this SQL in your Supabase SQL Editor to add the new columns

ALTER TABLE public.staff_details ADD COLUMN IF NOT EXISTS plain_password TEXT;
ALTER TABLE public.staff_details ADD COLUMN IF NOT EXISTS assigned_hamlet_codes TEXT;
