const fs = require('fs');
let code = fs.readFileSync('packages/shared/src/syncService.ts', 'utf8');

const newFunc = `
export async function fetchAllSurveysForExport(): Promise<DraftSurvey[]> {
  const supabase = getSupabase() as any;

  const [
    { data: households, error: hhErr },
    { data: members, error: memErr },
    { data: documents, error: docErr },
    { data: corrections_required, error: corErr },
    { data: corrections_made, error: corMadeErr },
    { data: new_docs, error: newErr },
    { data: base_docs, error: baseErr },
    { data: schemes, error: schErr }
  ] = await Promise.all([
    supabase.from('households').select('*').limit(100000),
    supabase.from('members').select('*').limit(500000),
    supabase.from('documents').select('*').limit(500000),
    supabase.from('corrections_required').select('*').limit(500000),
    supabase.from('corrections_made').select('*').limit(500000),
    supabase.from('new_documents_needed').select('*').limit(500000),
    supabase.from('base_documents_available').select('*').limit(500000),
    supabase.from('schemes_accessed').select('*').limit(500000)
  ]);

  if (hhErr) throw hhErr;
  if (memErr) throw memErr;

  const groupBy = (array, key) => {
    if (!array) return {};
    return array.reduce((acc, obj) => {
      const property = obj[key];
      acc[property] = acc[property] || [];
      acc[property].push(obj);
      return acc;
    }, {});
  };

  const docsByMember = groupBy(documents, 'member_id');
  const corByMember = groupBy(corrections_required, 'member_id');
  const corMadeByMember = groupBy(corrections_made, 'member_id');
  const newByMember = groupBy(new_docs, 'member_id');
  const baseByMember = groupBy(base_docs, 'member_id');
  const schByMember = groupBy(schemes, 'member_id');
  const membersByHousehold = groupBy(members, 'household_id');

  return (households || []).map((hh: any) => {
    const hhMembers = membersByHousehold[hh.id] || [];
    
    const docsRecord: any = {};
    const corrRecord: any = {};
    const corMadeRecord: any = {};
    const newDocsRecord: any = {};
    const baseDocsRecord: any = {};
    const schemesRecord: any = {};

    hhMembers.forEach((m: any) => {
      docsRecord[m.id] = docsByMember[m.id]?.[0] || {};
      corrRecord[m.id] = corByMember[m.id]?.[0]?.corrections || {};
      corMadeRecord[m.id] = corMadeByMember[m.id]?.[0]?.corrections_made || {};
      newDocsRecord[m.id] = newByMember[m.id]?.[0] || {};
      baseDocsRecord[m.id] = baseByMember[m.id]?.[0] || {};
      schemesRecord[m.id] = schByMember[m.id]?.[0] || {};
    });

    return {
      id: hh.id,
      household: hh,
      members: hhMembers,
      documents: docsRecord,
      corrections: corrRecord,
      corrections_made: corMadeRecord,
      new_docs: newDocsRecord,
      base_docs: baseDocsRecord,
      schemes: schemesRecord,
      lastSavedAt: hh.created_at,
      status: 'synced'
    } as DraftSurvey;
  });
}
`;

code = code.replace('export async function fetchAdminSurveys(): Promise<DraftSurvey[]> {', newFunc + '\nexport async function fetchAdminSurveys(): Promise<DraftSurvey[]> {');
fs.writeFileSync('packages/shared/src/syncService.ts', code);
