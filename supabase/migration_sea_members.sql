-- Create SEA Members table
CREATE TABLE IF NOT EXISTS public.sea_members_list (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sea_members_list ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public all access on sea_members_list"
  ON public.sea_members_list FOR ALL USING (true);

-- Assuming update_modified_column trigger function exists in schema.sql
CREATE TRIGGER update_sea_members_modtime
BEFORE UPDATE ON sea_members_list
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
