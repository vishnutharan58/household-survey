-- Create staff_users table
CREATE TABLE IF NOT EXISTS public.staff_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;

-- Policies for staff_users
-- Admins have full access
CREATE POLICY "Admin full access staff_users" 
  ON public.staff_users FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Staff can read staff_users
CREATE POLICY "Staff read staff_users" 
  ON public.staff_users FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'staff'
  );

-- Allow public to insert for now so that the secondary client (which doesn't have admin JWT when it starts) can insert the user.
-- Wait, if it's signed up, it becomes a logged-in user, but they don't have admin role.
-- To allow the Admin dashboard to insert, the Admin is using the primary client. 
-- Wait, we will insert the record using the PRIMARY client which IS logged in as admin.
-- The auth.signUp() will happen on the secondary client.
-- So Admin policy is fine.

-- Insert initial hardcoded staff
INSERT INTO public.staff_users (email, name) VALUES 
('suganya@staff.com', 'Suganya'),
('freeda@staff.com', 'Freeda'),
('berdina@staff.com', 'Berdina'),
('fernisha@staff.com', 'Fernisha'),
('vijini@staff.com', 'Vijini'),
('raksha@staff.com', 'Raksha')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name;
