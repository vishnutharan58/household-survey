const fs = require('fs');

const file = 'packages/shared/src/syncService.ts';
let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

// 1. Fix fetchSurveyDetail Promise.all
let start1 = lines.findIndex(l => l.includes("const [") && lines[lines.indexOf(l)+1]?.includes("data: documents"));
if (start1 !== -1) {
    let end1 = start1 + 7;
    let replacement = [
      "    const [",
      "      { data: documents, error: docErr },",
      "      { data: corrections_required, error: corErr },",
      "      { data: corrections_made, error: corMadeErr },",
      "      { data: new_docs, error: newErr },",
      "      { data: base_docs, error: baseErr },",
      "      { data: schemes, error: schErr }",
      "    ] = await Promise.all(["
    ];
    lines.splice(start1, 8, ...replacement);
}

// 2. Fix fetchAllSurveysForExport
let start2 = lines.findIndex(l => l.includes('export async function fetchAllSurveysForExport(): Promise<DraftSurvey[]> {'));
if (start2 !== -1) {
    let end2 = lines.findIndex((l, i) => i > start2 && l.includes('if (memErr) throw memErr;'));
    if (end2 !== -1) {
        let replacement2 = `export async function fetchAllSurveysForExport(filterType: 'weekly' | 'monthly' | 'all' = 'all'): Promise<DraftSurvey[]> {
  const supabase = getSupabase() as any;

  const fetchTable = async (table: string, limit = 500000) => {
    const { data, error } = await supabase.from(table).select('*').limit(limit);
    if (error) {
      console.error('Error fetching ' + table + ':', error);
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
  const schemes = await fetchTable('schemes_accessed');`.split('\n');
        
        lines.splice(start2, end2 - start2 + 1, ...replacement2);
    }
}

fs.writeFileSync(file, lines.join('\n'));
