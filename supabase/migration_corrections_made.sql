-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/looezwqzqumajqlavgvt/sql/new)

-- 1. Create corrections_made table
CREATE TABLE IF NOT EXISTS public.corrections_made (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE UNIQUE,
  corrections_made JSONB DEFAULT '{}'::jsonb
);

-- 2. Enable RLS
ALTER TABLE public.corrections_made ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
CREATE POLICY "Admin full access corrections_made" 
  ON public.corrections_made 
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Staff hamlet access corrections_made" 
  ON public.corrections_made 
  FOR ALL 
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'staff');

-- 4. Update get_dashboard_stats function
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
BEGIN
  -- Basic counts
  SELECT count(*) INTO total_hh FROM public.households;
  SELECT count(*) INTO total_mem FROM public.members;
  SELECT count(*) FROM public.households WHERE economic_status = 'BPL' INTO bpl_cnt;
  SELECT count(DISTINCT staff_name) FROM public.households WHERE staff_name IS NOT NULL AND staff_name <> '' INTO staff_cnt;
  SELECT count(DISTINCT hamlet_code) FROM public.households WHERE hamlet_code IS NOT NULL AND hamlet_code <> '' INTO hamlet_cnt;

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

  -- Corrections made (sum of keys in corrections_made not ending in '__new' with true status)
  SELECT COALESCE(sum(made_cnt), 0) INTO corr_made_cnt
  FROM (
    SELECT (
      SELECT count(1)
      FROM jsonb_each_text(corrections_made) AS m(key, val)
      WHERE val = 'true' AND key NOT LIKE '%__new'
    ) as made_cnt
    FROM public.corrections_made
  ) m_sums;

  -- New documents needed (count of true columns across all records)
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

  -- New documents obtained (sum of keys ending in '__new' with true status)
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
    'total_other_services_obtained', other_services_cnt
  );

  RETURN result;
END;
$$;
