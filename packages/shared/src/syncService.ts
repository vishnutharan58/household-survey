import { getSupabase } from './supabase';
import type { DraftSurvey } from './store';

export async function syncDraftToSupabase(draft: DraftSurvey) {
  const supabase = getSupabase() as any;

  // 1. Insert household
  const { data: hhData, error: hhError } = await supabase
    .from('households')
    .insert([{
      date: draft.household.date,
      staff_name: draft.household.staff_name,
      hamlet_code: draft.household.hamlet_code,
      household_number: draft.household.household_number,
      individual_number: draft.household.individual_number,
      block: draft.household.block,
      village_panchayath: draft.household.village_panchayath,
      village: draft.household.village,
      door_no: draft.household.door_no,
      street: draft.household.street,
      economic_status: draft.household.economic_status,
      religion: draft.household.religion,
      community: draft.household.community,
      remarks: draft.household.remarks
    }])
    .select('id')
    .single();

  if (hhError) throw hhError;
  const householdId = hhData.id;

  // 2. Insert members
  for (const member of draft.members) {
    const { data: memberData, error: memError } = await supabase
      .from('members')
      .insert([{
        household_id: householdId,
        name: member.name,
        relationship: member.relationship,
        age: member.age ? parseInt(member.age.toString(), 10) : null,
        gender: member.gender,
        qualification: member.qualification,
        marital_status: member.marital_status,
        head_of_family: member.head_of_family || false,
        occupation: member.occupation,
        category: member.category,
        mbl_number: member.mbl_number,
        different_aadhaar_linked_mobile: member.different_aadhaar_linked_mobile
      }])
      .select('id')
      .single();

    if (memError) throw memError;
    const memberId = memberData.id;

    // 3. Insert Documents
    const docs = draft.documents[member.id!] || {};
    if (Object.keys(docs).length > 0) {
      const docPayload: any = { member_id: memberId };
      for (const [k, v] of Object.entries(docs)) docPayload[k] = v;
      await supabase.from('documents').insert([docPayload]);
    }

    // 4. Insert Corrections
    const corrs = draft.corrections[member.id!] || {};
    if (Object.keys(corrs).length > 0) {
      await supabase.from('corrections_required').insert([{
        member_id: memberId,
        corrections: corrs
      }]);
    }

    // 5. Insert New Docs
    const newDocs = draft.new_docs[member.id!] || {};
    if (Object.keys(newDocs).length > 0) {
      const newDocPayload: any = { member_id: memberId };
      for (const [k, v] of Object.entries(newDocs)) newDocPayload[k] = v;
      await supabase.from('new_documents_needed').insert([newDocPayload]);
    }

    // 6. Base Docs
    const baseDocs = draft.base_docs[member.id!] || {};
    if (Object.keys(baseDocs).length > 0) {
      const basePayload: any = { member_id: memberId };
      for (const [k, v] of Object.entries(baseDocs)) basePayload[k] = v;
      await supabase.from('base_documents_available').insert([basePayload]);
    }

    // 7. Schemes Accessed
    const schemes = draft.schemes[member.id!] || {};
    if (Object.keys(schemes).length > 0) {
      const schemesPayload: any = { member_id: memberId };
      for (const [k, v] of Object.entries(schemes)) schemesPayload[k] = v;
      await supabase.from('schemes_accessed').insert([schemesPayload]);
    }
  }

  return householdId;
}

export async function fetchDashboardStats(): Promise<any> {
  const supabase = getSupabase() as any;
  const { data, error } = await supabase.rpc('get_dashboard_stats');
  if (error) throw error;
  return data;
}

export async function fetchSurveyDetail(householdId: string): Promise<DraftSurvey> {
  const supabase = getSupabase() as any;

  // Fetch household and members first
  const [
    { data: hh, error: hhErr },
    { data: members, error: memErr }
  ] = await Promise.all([
    supabase.from('households').select('*').eq('id', householdId).single(),
    supabase.from('members').select('*').eq('household_id', householdId)
  ]);

  if (hhErr) throw hhErr;
  if (memErr) throw memErr;

  const docsRecord: any = {};
  const corrRecord: any = {};
  const newDocsRecord: any = {};
  const baseDocsRecord: any = {};
  const schemesRecord: any = {};

  if (members && members.length > 0) {
    const memberIds = members.map((m: any) => m.id);

    // Fetch child table data using the resolved member IDs
    const [
      { data: documents, error: docErr },
      { data: corrections_required, error: corErr },
      { data: new_docs, error: newErr },
      { data: base_docs, error: baseErr },
      { data: schemes, error: schErr }
    ] = await Promise.all([
      supabase.from('documents').select('*').in('member_id', memberIds),
      supabase.from('corrections_required').select('*').in('member_id', memberIds),
      supabase.from('new_documents_needed').select('*').in('member_id', memberIds),
      supabase.from('base_documents_available').select('*').in('member_id', memberIds),
      supabase.from('schemes_accessed').select('*').in('member_id', memberIds)
    ]);

    if (docErr) throw docErr;
    if (corErr) throw corErr;
    if (newErr) throw newErr;
    if (baseErr) throw baseErr;
    if (schErr) throw schErr;

    members.forEach((m: any) => {
      docsRecord[m.id] = documents.find((d: any) => d.member_id === m.id) || {};
      corrRecord[m.id] = corrections_required.find((c: any) => c.member_id === m.id)?.corrections || {};
      newDocsRecord[m.id] = new_docs.find((nd: any) => nd.member_id === m.id) || {};
      baseDocsRecord[m.id] = base_docs.find((bd: any) => bd.member_id === m.id) || {};
      schemesRecord[m.id] = schemes.find((s: any) => s.member_id === m.id) || {};
    });
  }

  return {
    id: hh.id,
    household: hh,
    members: members || [],
    documents: docsRecord,
    corrections: corrRecord,
    corrections_made: {},
    new_docs: newDocsRecord,
    base_docs: baseDocsRecord,
    schemes: schemesRecord,
    lastSavedAt: hh.created_at,
    status: 'synced'
  } as DraftSurvey;
}

export async function fetchAdminSurveys(): Promise<DraftSurvey[]> {
  const supabase = getSupabase() as any;

  // Fetch households and member counts separately to avoid statement timeout
  const [{ data: households, error: hhErr }, { data: members, error: memErr }] = await Promise.all([
    supabase.from('households').select('*').limit(10000),
    supabase.from('members').select('household_id').limit(100000)
  ]);

  if (hhErr) throw hhErr;
  if (memErr) throw memErr;

  // Count members per household in memory
  const countsMap: Record<string, number> = {};
  for (const m of members) {
    if (m.household_id) {
      countsMap[m.household_id] = (countsMap[m.household_id] || 0) + 1;
    }
  }

  return households.map((hh: any) => {
    const memberCount = countsMap[hh.id] || 0;
    const mockMembers = Array.from({ length: memberCount }, () => ({}));

    return {
      id: hh.id,
      household: hh,
      members: mockMembers,
      documents: {},
      corrections: {},
      corrections_made: {},
      new_docs: {},
      base_docs: {},
      schemes: {},
      lastSavedAt: hh.created_at,
      status: 'synced'
    } as DraftSurvey;
  });
}

