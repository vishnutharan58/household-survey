const fs = require('fs');

let code = fs.readFileSync('packages/shared/src/syncService.ts', 'utf8');

// 1. Fix docErr in fetchSurveyDetail
code = code.replace(
`    const [
      { data: documents },
      { data: corrections_required },
      { data: corrections_made },
      { data: new_docs },
      { data: base_docs },
      { data: schemes }
    ] = await Promise.all([`,
`    const [
      { data: documents, error: docErr },
      { data: corrections_required, error: corErr },
      { data: corrections_made, error: corMadeErr },
      { data: new_docs, error: newErr },
      { data: base_docs, error: baseErr },
      { data: schemes, error: schErr }
    ] = await Promise.all([`
);

// 2. Refactor fetchAllSurveysForExport
code = code.replace(
`export async function fetchAllSurveysForExport(): Promise<DraftSurvey[]> {
  const supabase = getSupabase() as any;

  const [
    { data: households, error: hhErr },
    { data: members, error: memErr },
    { data: documents },
    { data: corrections_required },
    { data: corrections_made },
    { data: new_docs },
    { data: base_docs },
    { data: schemes }
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
  if (memErr) throw memErr;`,
`export async function fetchAllSurveysForExport(filterType: 'weekly' | 'monthly' | 'all' = 'all'): Promise<DraftSurvey[]> {
  const supabase = getSupabase() as any;

  const fetchTable = async (table: string, limit = 500000) => {
    const { data, error } = await supabase.from(table).select('*').limit(limit);
    if (error) {
      console.error(\`Error fetching \${table}:\`, error);
      throw error;
    }
    return data || [];
  };

  let hhQuery = supabase.from('households').select('*');
  const now = new Date();
  if (filterType === 'weekly') {
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    hhQuery = hhQuery.gte('created_at', lastWeek.toISOString());
  } else if (filterType === 'monthly') {
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    hhQuery = hhQuery.gte('created_at', lastMonth.toISOString());
  }
  const { data: households, error: hhErr } = await hhQuery.limit(100000);
  if (hhErr) throw hhErr;

  if (!households || households.length === 0) return [];

  const members = await fetchTable('members');
  const documents = await fetchTable('documents');
  const corrections_required = await fetchTable('corrections_required');
  const corrections_made = await fetchTable('corrections_made');
  const new_docs = await fetchTable('new_documents_needed');
  const base_docs = await fetchTable('base_documents_available');
  const schemes = await fetchTable('schemes_accessed');`
);

fs.writeFileSync('packages/shared/src/syncService.ts', code);
