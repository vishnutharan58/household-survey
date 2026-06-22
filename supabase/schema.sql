-- Create ENUM types
CREATE TYPE economic_status_enum AS ENUM ('BPL', 'APL', 'Others');
CREATE TYPE gender_enum AS ENUM ('Male', 'Female', 'Other');
CREATE TYPE marital_status_enum AS ENUM ('Married', 'Unmarried', 'Widow', 'Child');

-- Create Households table
CREATE TABLE public.households (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sno SERIAL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  staff_name TEXT,
  hamlet_code TEXT,
  household_number TEXT,
  individual_number TEXT,
  block TEXT,
  village_panchayath TEXT,
  village TEXT,
  hamlet_name TEXT,
  door_no TEXT,
  street TEXT,
  economic_status economic_status_enum,
  religion TEXT,
  community TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Members table
CREATE TABLE public.members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  age INTEGER,
  gender gender_enum,
  qualification TEXT,
  marital_status marital_status_enum,
  head_of_family BOOLEAN DEFAULT FALSE,
  occupation TEXT,
  category TEXT,
  mbl_number TEXT,
  different_aadhaar_linked_mobile TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Documents Available table (Per Member)
CREATE TABLE public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE UNIQUE,
  aadhaar_card BOOLEAN DEFAULT FALSE,
  ration_card BOOLEAN DEFAULT FALSE,
  e_epic BOOLEAN DEFAULT FALSE,
  pan_card BOOLEAN DEFAULT FALSE,
  bank_account BOOLEAN DEFAULT FALSE,
  income_certificate BOOLEAN DEFAULT FALSE,
  community_certificate BOOLEAN DEFAULT FALSE,
  birth_certificate BOOLEAN DEFAULT FALSE,
  death_certificate BOOLEAN DEFAULT FALSE,
  widow_certificate BOOLEAN DEFAULT FALSE,
  udid BOOLEAN DEFAULT FALSE,
  society_card BOOLEAN DEFAULT FALSE,
  fisherman_id_card BOOLEAN DEFAULT FALSE,
  fisherman_welfare_card BOOLEAN DEFAULT FALSE,
  vb_g_ram_g_act BOOLEAN DEFAULT FALSE,
  cmchis BOOLEAN DEFAULT FALSE,
  legal_heir BOOLEAN DEFAULT FALSE
);

-- Create Corrections Required table (Per Member)
-- We use JSONB for sub-fields (Name, DOB, Address, Mobile Number, Guardian Name, Photo, Update, Others)
-- Example: {"aadhaar_card": {"Name": true, "DOB": false}, "ration_card": {...}}
CREATE TABLE public.corrections_required (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE UNIQUE,
  corrections JSONB DEFAULT '{}'::jsonb
);

-- Create New Documents Needed table (Per Member)
CREATE TABLE public.new_documents_needed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE UNIQUE,
  e_epic BOOLEAN DEFAULT FALSE,
  pan_card BOOLEAN DEFAULT FALSE,
  bank_account BOOLEAN DEFAULT FALSE,
  income_certificate BOOLEAN DEFAULT FALSE,
  community_certificate BOOLEAN DEFAULT FALSE,
  birth_certificate BOOLEAN DEFAULT FALSE,
  death_certificate BOOLEAN DEFAULT FALSE,
  widow_certificate BOOLEAN DEFAULT FALSE,
  udid BOOLEAN DEFAULT FALSE,
  society_card BOOLEAN DEFAULT FALSE,
  fisherman_id_card BOOLEAN DEFAULT FALSE,
  fisherman_welfare_card BOOLEAN DEFAULT FALSE,
  vb_g_ram_g_act BOOLEAN DEFAULT FALSE,
  cmchis BOOLEAN DEFAULT FALSE,
  land_rights BOOLEAN DEFAULT FALSE
);

-- Create Base Documents Available table (Per Member)
CREATE TABLE public.base_documents_available (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE UNIQUE,
  aadhaar_card BOOLEAN DEFAULT FALSE,
  ration_card BOOLEAN DEFAULT FALSE,
  e_epic BOOLEAN DEFAULT FALSE,
  pan_card BOOLEAN DEFAULT FALSE,
  bank_account BOOLEAN DEFAULT FALSE,
  birth_certificate BOOLEAN DEFAULT FALSE
);

-- Create Schemes Accessed table (Per Member)
CREATE TABLE public.schemes_accessed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE UNIQUE,
  old_age_pension BOOLEAN DEFAULT FALSE,
  widow_pension BOOLEAN DEFAULT FALSE,
  disability_pension BOOLEAN DEFAULT FALSE,
  cm_girl_child_protection_scheme BOOLEAN DEFAULT FALSE,
  death_relief_assistance BOOLEAN DEFAULT FALSE,
  women_welfare_schemes BOOLEAN DEFAULT FALSE,
  puthumai_penn_schemes BOOLEAN DEFAULT FALSE,
  tamil_puthalvan_schemes BOOLEAN DEFAULT FALSE,
  widows_daughter_marriage_assistance BOOLEAN DEFAULT FALSE,
  fishing_ban_period_relief BOOLEAN DEFAULT FALSE,
  short_term_relief BOOLEAN DEFAULT FALSE,
  saving_period_schemes BOOLEAN DEFAULT FALSE,
  vb_g_ram_g_act BOOLEAN DEFAULT FALSE,
  cmchis BOOLEAN DEFAULT FALSE
);

-- Create Eligible Schemes table (Per Member)
CREATE TABLE public.eligible_schemes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE UNIQUE,
  old_age_pension BOOLEAN DEFAULT FALSE,
  widow_pension BOOLEAN DEFAULT FALSE,
  disability_pension BOOLEAN DEFAULT FALSE,
  cm_girl_child_protection_scheme BOOLEAN DEFAULT FALSE,
  death_relief_assistance BOOLEAN DEFAULT FALSE,
  women_welfare_schemes BOOLEAN DEFAULT FALSE,
  puthumai_penn_schemes BOOLEAN DEFAULT FALSE,
  tamil_puthalvan_schemes BOOLEAN DEFAULT FALSE,
  widows_daughter_marriage_assistance BOOLEAN DEFAULT FALSE,
  fishing_ban_period_relief BOOLEAN DEFAULT FALSE,
  short_term_relief BOOLEAN DEFAULT FALSE,
  saving_period_schemes BOOLEAN DEFAULT FALSE,
  vb_g_ram_g_act BOOLEAN DEFAULT FALSE,
  cmchis BOOLEAN DEFAULT FALSE,
  maternity_benefit_schemes BOOLEAN DEFAULT FALSE,
  different_subsidiaries BOOLEAN DEFAULT FALSE,
  if_applied_follow_up_needed BOOLEAN DEFAULT FALSE
);

-- RLS setup
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corrections_required ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.new_documents_needed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.base_documents_available ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes_accessed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligible_schemes ENABLE ROW LEVEL SECURITY;

-- Admins can do everything. Staff can only access their hamlet.
-- (Assuming auth.users has a role and hamlet_code stored in raw_user_meta_data)

CREATE POLICY "Admin full access households"
  ON public.households
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Staff hamlet access households"
  ON public.households
  FOR ALL
  USING (hamlet_code = (auth.jwt() -> 'user_metadata' ->> 'hamlet_code'));

-- Cascading policies for child tables based on households (for staff and admin)

-- MEMBERS
CREATE POLICY "Admin full access members" ON public.members FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Staff hamlet access members" ON public.members FOR ALL USING (EXISTS (SELECT 1 FROM public.households h WHERE h.id = public.members.household_id AND h.hamlet_code = (auth.jwt() -> 'user_metadata' ->> 'hamlet_code')));

-- DOCUMENTS
CREATE POLICY "Admin full access documents" ON public.documents FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Staff hamlet access documents" ON public.documents FOR ALL USING (EXISTS (SELECT 1 FROM public.members m JOIN public.households h ON h.id = m.household_id WHERE m.id = public.documents.member_id AND h.hamlet_code = (auth.jwt() -> 'user_metadata' ->> 'hamlet_code')));

-- CORRECTIONS REQUIRED
CREATE POLICY "Admin full access corrections_required" ON public.corrections_required FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Staff hamlet access corrections_required" ON public.corrections_required FOR ALL USING (EXISTS (SELECT 1 FROM public.members m JOIN public.households h ON h.id = m.household_id WHERE m.id = public.corrections_required.member_id AND h.hamlet_code = (auth.jwt() -> 'user_metadata' ->> 'hamlet_code')));

-- NEW DOCUMENTS NEEDED
CREATE POLICY "Admin full access new_documents_needed" ON public.new_documents_needed FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Staff hamlet access new_documents_needed" ON public.new_documents_needed FOR ALL USING (EXISTS (SELECT 1 FROM public.members m JOIN public.households h ON h.id = m.household_id WHERE m.id = public.new_documents_needed.member_id AND h.hamlet_code = (auth.jwt() -> 'user_metadata' ->> 'hamlet_code')));

-- BASE DOCUMENTS AVAILABLE
CREATE POLICY "Admin full access base_documents_available" ON public.base_documents_available FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Staff hamlet access base_documents_available" ON public.base_documents_available FOR ALL USING (EXISTS (SELECT 1 FROM public.members m JOIN public.households h ON h.id = m.household_id WHERE m.id = public.base_documents_available.member_id AND h.hamlet_code = (auth.jwt() -> 'user_metadata' ->> 'hamlet_code')));

-- SCHEMES ACCESSED
CREATE POLICY "Admin full access schemes_accessed" ON public.schemes_accessed FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Staff hamlet access schemes_accessed" ON public.schemes_accessed FOR ALL USING (EXISTS (SELECT 1 FROM public.members m JOIN public.households h ON h.id = m.household_id WHERE m.id = public.schemes_accessed.member_id AND h.hamlet_code = (auth.jwt() -> 'user_metadata' ->> 'hamlet_code')));

-- ELIGIBLE SCHEMES
CREATE POLICY "Admin full access eligible_schemes" ON public.eligible_schemes FOR ALL USING (auth.jwt() ->> 'role' = 'admin' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Staff hamlet access eligible_schemes" ON public.eligible_schemes FOR ALL USING (EXISTS (SELECT 1 FROM public.members m JOIN public.households h ON h.id = m.household_id WHERE m.id = public.eligible_schemes.member_id AND h.hamlet_code = (auth.jwt() -> 'user_metadata' ->> 'hamlet_code')));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_households_modtime
BEFORE UPDATE ON households
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_members_modtime
BEFORE UPDATE ON members
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
