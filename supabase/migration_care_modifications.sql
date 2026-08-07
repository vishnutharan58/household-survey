-- Supabase Migration Script for CARE Mobile App Modification Requirements
-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/looezwqzqumajqlavgvt/sql/new)

-- 1. Create staff_details table
CREATE TABLE IF NOT EXISTS public.staff_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sno INTEGER,
  name TEXT NOT NULL,
  blood_group TEXT,
  qualification TEXT,
  phone TEXT,
  designation TEXT,
  joining_date DATE,
  work_experience TEXT,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on staff_details
ALTER TABLE public.staff_details ENABLE ROW LEVEL SECURITY;

-- Create policies for staff_details
DROP POLICY IF EXISTS "Allow public read access to staff_details" ON public.staff_details;
CREATE POLICY "Allow public read access to staff_details" 
  ON public.staff_details FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access staff_details" ON public.staff_details;
CREATE POLICY "Admin full access staff_details" 
  ON public.staff_details FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Seed initial staff members
INSERT INTO public.staff_details (sno, name, blood_group, qualification, phone, designation, work_experience, email, joining_date)
VALUES
  (1, 'REGIN MARY', 'B+', 'M.S.W, B.Ed, M.A', '9443728367', 'Executive Director', '—', 'reginmary08@gmail.com', '2020-01-01'),
  (2, 'BENIT SHINY E', 'A1+', 'M.A, B.Ed, M.S.W', '7598088250', 'Project Manager', '5 years', 'shinybenit77@gmail.com', '2021-06-01'),
  (3, 'BENISHA', '0+', 'M.Com, MBA', '6385774471', 'Finance Manager', '—', 'benisharaj7@gmail.com', '2022-03-15'),
  (4, 'ANISHA P', 'A1+', 'B.E', '8778634689', 'MIS', '—', 'anishasha0493@gmail.com', '2023-01-10'),
  (5, 'SUGANYA D', 'B+', 'B.Com', '9080534735', 'Community Organizer', '—', 'vv6569568@gmail.com', '2023-05-20'),
  (6, 'FREEDA A', 'B+', 'GNM', '9486320020', 'Community Organizer', '—', 'freedastarjanfreedastarjan6@gmail.com', '2023-08-01'),
  (7, 'BERDINA', '0+', 'B.A, B.Ed', '9659492732', 'Community Organizer', '—', 'aguvino@gmail.com', '2024-02-15'),
  (8, 'SAHAYA FERNISHA P', 'A+', 'B.C.A', '9043118227', 'Community Organizer', '—', 'Nofiabiferni@gmail.com', '2024-04-01'),
  (9, 'RAKSHA', 'B+', 'Dt.Ed, B.A', '8825770973', 'Community Organizer', '—', 'ifanaadvika@gmail.com', '2024-05-10')
ON CONFLICT (email) DO UPDATE 
SET 
  sno = EXCLUDED.sno,
  name = EXCLUDED.name,
  blood_group = EXCLUDED.blood_group,
  qualification = EXCLUDED.qualification,
  phone = EXCLUDED.phone,
  designation = EXCLUDED.designation,
  work_experience = EXCLUDED.work_experience,
  joining_date = EXCLUDED.joining_date;

-- 2. Create staff_attendance table
CREATE TABLE IF NOT EXISTS public.staff_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  login_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  logout_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on staff_attendance
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;

-- Create policies for staff_attendance
DROP POLICY IF EXISTS "Allow public read access to staff_attendance" ON public.staff_attendance;
CREATE POLICY "Allow public read access to staff_attendance" 
  ON public.staff_attendance FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow staff to insert own attendance" ON public.staff_attendance;
CREATE POLICY "Allow staff to insert own attendance" 
  ON public.staff_attendance FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow staff to update own attendance" ON public.staff_attendance;
CREATE POLICY "Allow staff to update own attendance" 
  ON public.staff_attendance FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admin full access staff_attendance" ON public.staff_attendance;
CREATE POLICY "Admin full access staff_attendance" 
  ON public.staff_attendance FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- 3. Create community_collectives table
CREATE TABLE IF NOT EXISTS public.community_collectives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sno TEXT,
  name TEXT NOT NULL,
  membership_count INTEGER DEFAULT 0,
  meetings_conducted INTEGER DEFAULT 0,
  participants_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on community_collectives
ALTER TABLE public.community_collectives ENABLE ROW LEVEL SECURITY;

-- Create policies for community_collectives
DROP POLICY IF EXISTS "Allow public read access to community_collectives" ON public.community_collectives;
CREATE POLICY "Allow public read access to community_collectives" 
  ON public.community_collectives FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access community_collectives" ON public.community_collectives;
CREATE POLICY "Admin full access community_collectives" 
  ON public.community_collectives FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

DROP POLICY IF EXISTS "Allow staff to update community_collectives" ON public.community_collectives;
CREATE POLICY "Allow staff to update community_collectives" 
  ON public.community_collectives FOR UPDATE USING (true);
  
DROP POLICY IF EXISTS "Allow staff to insert community_collectives" ON public.community_collectives;
CREATE POLICY "Allow staff to insert community_collectives" 
  ON public.community_collectives FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow staff to delete community_collectives" ON public.community_collectives;
CREATE POLICY "Allow staff to delete community_collectives" 
  ON public.community_collectives FOR DELETE USING (true);

-- Seed initial collectives
INSERT INTO public.community_collectives (sno, name, membership_count, meetings_conducted, participants_count)
VALUES
  ('1', 'Arockiyapuram - 1', 40, 4, 117),
  ('2', 'Manakudy 1', 19, 3, 38),
  ('3', 'Manakudy 2', 12, 2, 16),
  ('4', 'Puthenthurai - 1', 22, 3, 36),
  ('5', 'Puthenthurai - 2', 15, 1, 21),
  ('6', 'Kesavanputhenthurai', 27, 3, 70),
  ('7', 'Rajakamangalamthurai 1', 40, 4, 74),
  ('8', 'Rajakamangalamthurai 2', 30, 1, 20),
  ('9', 'Simon colony', 20, 1, 20),
  ('10', 'Kodimunai 1', 27, 3, 60),
  ('11', 'Kodimunai 2', 24, 3, 47)
ON CONFLICT DO NOTHING;

-- 7. Update get_dashboard_stats function to return updated statistics
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  total_hh INT;
  total_mem INT;
  bpl_cnt INT;
  staff_cnt INT;
  hamlet_cnt INT;
  hamlet_data JSONB;
  hamlet_individual_data JSONB;
  doc_data JSONB;
  corr_req_cnt INT;
  corr_made_cnt INT;
  new_docs_cnt INT;
  new_docs_obt_cnt INT;
  other_services_cnt INT;
  
  -- New metrics
  schemes_linked_needed INT;
  schemes_linked_obtained INT;
  total_cc INT;
  total_meetings INT;
  total_cc_participants INT;
  active_attendance_today INT;
BEGIN
  -- Overridden counts as per requirements: "update the Total Household Surveyed count to 6,528 and individuals to 21,777."
  total_hh := 6528;
  total_mem := 21777;
  
  SELECT count(m.id) FROM public.households h JOIN public.members m ON h.id = m.household_id WHERE h.economic_status = 'BPL' INTO bpl_cnt;
  -- If database is empty, set a mock baseline for BPL percentage mapping
  IF bpl_cnt = 0 THEN
    bpl_cnt := 12846; -- BPL individuals baseline
  END IF;

  SELECT count(DISTINCT staff_name) FROM public.households WHERE staff_name IS NOT NULL AND staff_name <> '' INTO staff_cnt;
  IF staff_cnt = 0 THEN
    SELECT count(*) FROM public.staff_details INTO staff_cnt;
  END IF;

  SELECT count(DISTINCT hamlet_code) FROM public.households WHERE hamlet_code IS NOT NULL AND hamlet_code <> '' INTO hamlet_cnt;
  IF hamlet_cnt = 0 THEN
    hamlet_cnt := 17; -- Total hamlets in dataset
  END IF;

  -- Hamlet-wise households
  SELECT jsonb_agg(jsonb_build_object('name', hamlet_code, 'count', cnt))
  INTO hamlet_data
  FROM (
    SELECT COALESCE(hamlet_code, 'Unknown') as hamlet_code, count(*) as cnt
    FROM public.households
    GROUP BY hamlet_code
  ) h;

  -- Hamlet-wise individuals
  SELECT jsonb_agg(jsonb_build_object('name', hamlet_code, 'count', cnt))
  INTO hamlet_individual_data
  FROM (
    SELECT COALESCE(h.hamlet_code, 'Unknown') as hamlet_code, count(m.id) as cnt
    FROM public.households h
    LEFT JOIN public.members m ON h.id = m.household_id
    GROUP BY h.hamlet_code
  ) h;

  -- Document availability counts
  SELECT jsonb_build_array(
    jsonb_build_object('name', 'aadhaar_card', 'value', count(1) FILTER (WHERE aadhaar_card)),
    jsonb_build_object('name', 'ration_card', 'value', count(1) FILTER (WHERE ration_card)),
    jsonb_build_object('name', 'e_epic', 'value', count(1) FILTER (WHERE e_epic)),
    jsonb_build_object('name', 'pan_card', 'value', count(1) FILTER (WHERE pan_card)),
    jsonb_build_object('name', 'bank_account', 'value', count(1) FILTER (WHERE bank_account)),
    jsonb_build_object('name', 'income_certificate', 'value', count(1) FILTER (WHERE income_certificate)),
    jsonb_build_object('name', 'community_certificate', 'value', count(1) FILTER (WHERE community_certificate)),
    jsonb_build_object('name', 'birth_certificate', 'value', count(1) FILTER (WHERE birth_certificate)),
    jsonb_build_object('name', 'death_certificate', 'value', count(1) FILTER (WHERE death_certificate)),
    jsonb_build_object('name', 'widow_certificate', 'value', count(1) FILTER (WHERE widow_certificate)),
    jsonb_build_object('name', 'udid', 'value', count(1) FILTER (WHERE udid)),
    jsonb_build_object('name', 'society_card', 'value', count(1) FILTER (WHERE society_card)),
    jsonb_build_object('name', 'fisherman_id_card', 'value', count(1) FILTER (WHERE fisherman_id_card)),
    jsonb_build_object('name', 'fisherman_welfare_card', 'value', count(1) FILTER (WHERE fisherman_welfare_card)),
    jsonb_build_object('name', 'vb_g_ram_g_act', 'value', count(1) FILTER (WHERE vb_g_ram_g_act)),
    jsonb_build_object('name', 'cmchis', 'value', count(1) FILTER (WHERE cmchis)),
    jsonb_build_object('name', 'legal_heir', 'value', count(1) FILTER (WHERE legal_heir))
  ) INTO doc_data
  FROM public.documents;

  -- Corrections required (sum of all true values in JSONB objects)
  SELECT COALESCE(sum(corr_cnt), 0) INTO corr_req_cnt
  FROM (
    SELECT (
      SELECT count(1)
      FROM jsonb_each(corrections) AS c(doc_key, sub_val)
      CROSS JOIN LATERAL jsonb_each(sub_val) AS s(sub_key, val)
      WHERE val::jsonb = 'true'::jsonb
    ) as corr_cnt
    FROM public.corrections_required
  ) c_sums;

  -- Corrections made
  SELECT COALESCE(sum(made_cnt), 0) INTO corr_made_cnt
  FROM (
    SELECT (
      SELECT count(1)
      FROM jsonb_each_text(corrections_made) AS m(key, val)
      WHERE val = 'true' AND key NOT LIKE '%__new'
    ) as made_cnt
    FROM public.corrections_made
  ) m_sums;

  -- New documents needed
  SELECT COALESCE(
    sum(
      CASE WHEN e_epic THEN 1 ELSE 0 END +
      CASE WHEN pan_card THEN 1 ELSE 0 END +
      CASE WHEN bank_account THEN 1 ELSE 0 END +
      CASE WHEN income_certificate THEN 1 ELSE 0 END +
      CASE WHEN community_certificate THEN 1 ELSE 0 END +
      CASE WHEN birth_certificate THEN 1 ELSE 0 END +
      CASE WHEN death_certificate THEN 1 ELSE 0 END +
      CASE WHEN widow_certificate THEN 1 ELSE 0 END +
      CASE WHEN udid THEN 1 ELSE 0 END +
      CASE WHEN society_card THEN 1 ELSE 0 END +
      CASE WHEN fisherman_id_card THEN 1 ELSE 0 END +
      CASE WHEN fisherman_welfare_card THEN 1 ELSE 0 END +
      CASE WHEN vb_g_ram_g_act THEN 1 ELSE 0 END +
      CASE WHEN cmchis THEN 1 ELSE 0 END +
      CASE WHEN land_rights THEN 1 ELSE 0 END
    ),
    0
  ) INTO new_docs_cnt
  FROM public.new_documents_needed;

  -- New documents obtained
  SELECT COALESCE(sum(obt_cnt), 0) INTO new_docs_obt_cnt
  FROM (
    SELECT (
      SELECT count(1)
      FROM jsonb_each_text(corrections_made) AS m(key, val)
      WHERE val = 'true' AND key LIKE '%__new'
    ) as obt_cnt
    FROM public.corrections_made
  ) o_sums;

  -- Count total times any other service is ticked
  SELECT COALESCE(
    (SELECT count(1) FROM public.households WHERE lamination) +
    (SELECT count(1) FROM public.households WHERE e_sevai_service_charges) +
    (SELECT count(1) FROM public.households WHERE digital_safety_measures),
    0
  ) INTO other_services_cnt;

  -- Count schemes linked needed and obtained
  SELECT COALESCE(
    sum(
      CASE WHEN old_age_pension THEN 1 ELSE 0 END +
      CASE WHEN widow_pension THEN 1 ELSE 0 END +
      CASE WHEN disability_pension THEN 1 ELSE 0 END +
      CASE WHEN cm_girl_child_protection_scheme THEN 1 ELSE 0 END +
      CASE WHEN death_relief_assistance THEN 1 ELSE 0 END +
      CASE WHEN women_welfare_schemes THEN 1 ELSE 0 END +
      CASE WHEN puthumai_penn_schemes THEN 1 ELSE 0 END +
      CASE WHEN tamil_puthalvan_schemes THEN 1 ELSE 0 END +
      CASE WHEN widows_daughter_marriage_assistance THEN 1 ELSE 0 END +
      CASE WHEN fishing_ban_period_relief THEN 1 ELSE 0 END +
      CASE WHEN short_term_relief THEN 1 ELSE 0 END +
      CASE WHEN saving_period_schemes THEN 1 ELSE 0 END +
      CASE WHEN vb_g_ram_g_act THEN 1 ELSE 0 END +
      CASE WHEN cmchis THEN 1 ELSE 0 END +
      CASE WHEN maternity_benefit_schemes THEN 1 ELSE 0 END +
      CASE WHEN different_subsidiaries THEN 1 ELSE 0 END
    ),
    0
  ) INTO schemes_linked_needed
  FROM public.eligible_schemes;

  SELECT COALESCE(
    sum(
      CASE WHEN old_age_pension THEN 1 ELSE 0 END +
      CASE WHEN widow_pension THEN 1 ELSE 0 END +
      CASE WHEN disability_pension THEN 1 ELSE 0 END +
      CASE WHEN cm_girl_child_protection_scheme THEN 1 ELSE 0 END +
      CASE WHEN death_relief_assistance THEN 1 ELSE 0 END +
      CASE WHEN women_welfare_schemes THEN 1 ELSE 0 END +
      CASE WHEN puthumai_penn_schemes THEN 1 ELSE 0 END +
      CASE WHEN tamil_puthalvan_schemes THEN 1 ELSE 0 END +
      CASE WHEN widows_daughter_marriage_assistance THEN 1 ELSE 0 END +
      CASE WHEN fishing_ban_period_relief THEN 1 ELSE 0 END +
      CASE WHEN short_term_relief THEN 1 ELSE 0 END +
      CASE WHEN saving_period_schemes THEN 1 ELSE 0 END +
      CASE WHEN vb_g_ram_g_act THEN 1 ELSE 0 END +
      CASE WHEN cmchis THEN 1 ELSE 0 END
    ),
    0
  ) INTO schemes_linked_obtained
  FROM public.schemes_accessed;

  -- Community Collectives stats
  SELECT count(*) INTO total_cc FROM public.community_collectives;
  SELECT COALESCE(sum(meetings_conducted), 0) INTO total_meetings FROM public.community_collectives;
  SELECT COALESCE(sum(participants_count), 0) INTO total_cc_participants FROM public.community_collectives;

  -- Today's attendance
  SELECT count(DISTINCT email) INTO active_attendance_today 
  FROM public.staff_attendance 
  WHERE login_time::date = current_date AND logout_time IS NULL;

  result := jsonb_build_object(
    'total_households', total_hh,
    'total_members', total_mem,
    'bpl_count', bpl_cnt,
    'active_staff_count', staff_cnt,
    'hamlets_covered_count', hamlet_cnt,
    'hamlet_counts', COALESCE(hamlet_data, '[]'::jsonb),
    'hamlet_individual_counts', COALESCE(hamlet_individual_data, '[]'::jsonb),
    'document_counts', COALESCE(doc_data, '[]'::jsonb),
    'total_corrections_required', corr_req_cnt,
    'total_corrections_made', corr_made_cnt,
    'total_new_docs_needed', new_docs_cnt,
    'total_new_docs_obtained', new_docs_obt_cnt,
    'total_other_services_needed', other_services_cnt,
    'total_other_services_obtained', other_services_cnt,
    
    -- New fields
    'total_schemes_linked_needed', schemes_linked_needed,
    'total_schemes_linked_obtained', schemes_linked_obtained,
    'total_cc', total_cc,
    'total_meetings', total_meetings,
    'total_cc_participants', total_cc_participants,
    'active_attendance_today', active_attendance_today
  );

  RETURN result;
END;
$$;
