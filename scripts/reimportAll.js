const path = require('path');
const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../apps/web/.env') });

function mapFieldToDbCol(field) {
  const f = field.toLowerCase().replace(/[^a-z0-9]/g, '_');
  if (f.includes('aadhar')) return 'aadhaar_card';
  if (f.includes('ration')) return 'ration_card';
  if (f.includes('e_epic')) return 'e_epic';
  if (f.includes('pan')) return 'pan_card';
  if (f.includes('bank')) return 'bank_account';
  if (f.includes('income')) return 'income_certificate';
  if (f.includes('community')) return 'community_certificate';
  if (f.includes('birth')) return 'birth_certificate';
  if (f.includes('death')) return 'death_certificate';
  if (f.includes('widow_certificate')) return 'widow_certificate';
  if (f.includes('udid')) return 'udid';
  if (f.includes('society')) return 'society_card';
  if (f.includes('fisherman_id')) return 'fisherman_id_card';
  if (f.includes('fisherman_welfare')) return 'fisherman_welfare_card';
  if (f.includes('vb_g_ram')) return 'vb_g_ram_g_act';
  if (f.includes('cmchis') || f.includes('comprehensive')) return 'cmchis';
  if (f.includes('legal_heir')) return 'legal_heir';
  if (f.includes('land')) return 'land_rights';
  if (f.includes('old_age_pension')) return 'old_age_pension';
  if (f.includes('widow_pension')) return 'widow_pension';
  if (f.includes('disability_pension')) return 'disability_pension';
  if (f.includes('girl_child')) return 'cm_girl_child_protection_scheme';
  if (f.includes('death_relief')) return 'death_relief_assistance';
  if (f.includes('women_welfare')) return 'women_welfare_schemes';
  if (f.includes('puthumai_penn')) return 'puthumai_penn_schemes';
  if (f.includes('tamil_puthalvan')) return 'tamil_puthalvan_schemes';
  if (f.includes('widows_daughter') || f.includes('widow_s_daughter')) return 'widows_daughter_marriage_assistance';
  if (f.includes('fishing_ban')) return 'fishing_ban_period_relief';
  if (f.includes('short_term')) return 'short_term_relief';
  if (f.includes('saving_period')) return 'saving_period_schemes';
  if (f.includes('maternity')) return 'maternity_benefit_schemes';
  if (f.includes('different_subsid')) return 'different_subsidiaries';
  return null;
}

function fixRel(r) {
  if (!r) return null;
  const l = r.trim().toLowerCase();
  if (l === 'husband') return 'Husband';
  if (l === 'wife') return 'Wife';
  if (l === 'spouse') return 'Spouse';
  if (l === 'son') return 'Son';
  if (l === 'daughter') return 'Daughter';
  if (l === 'father') return 'Father';
  if (l === 'mother') return 'Mother';
  if (l === 'brother') return 'Brother';
  if (l === 'sister') return 'Sister';
  if (['self', 'head'].includes(l)) return 'Head of Family';
  if (l === 'mother in law') return 'Mother-in-law';
  if (l === 'father in law') return 'Father-in-law';
  if (l === 'daughter in law') return 'Daughter-in-law';
  if (l === 'son in law') return 'Son-in-law';
  if (l === 'grandson') return 'Grandson';
  if (l === 'granddaughter') return 'Granddaughter';
  return 'Other';
}

function fixQual(q) {
  if (!q) return null;
  const l = q.trim().toLowerCase();
  if (l.includes('primary')) return 'Primary (1st to 5th)';
  if (l.includes('middle')) return 'Middle (6th to 8th)';
  if (l.includes('high school')) return 'High School (10th)';
  if (l.includes('higher secondary')) return 'Higher Secondary (12th)';
  if (l === 'uneducated' || l === 'illiterate' || l.includes('uneducated')) return 'Illiterate';
  if (l === 'ug') return "Graduate / Bachelor's Degree";
  if (l === 'pg') return "Post Graduate / Master's Degree";
  if (l.includes('diploma')) return 'Diploma';
  if (l.includes('iti')) return 'ITI';
  return 'Other';
}

function fixEconomicStatus(es) {
  if (!es) return null;
  const l = es.trim().toLowerCase();
  if (l === 'bpl') return 'BPL';
  if (l === 'apl') return 'APL';
  return 'Others';
}

function fixMaritalStatus(ms) {
  if (!ms) return null;
  const l = ms.trim().toLowerCase();
  if (l === 'married' || l === 'remarried') return 'Married';
  if (l === 'unmarried') return 'Unmarried';
  if (l === 'widow' || l === 'widower') return 'Widow';
  if (l === 'child') return 'Child';
  if (l === 'divorce' || l === 'seperated' || l === 'deserted') return 'Unmarried';
  return null;
}

function fixGender(g) {
  if (!g) return null;
  const l = g.trim().toLowerCase();
  if (l === 'male') return 'Male';
  if (l === 'female') return 'Female';
  return 'Other';
}

function formatExcelDate(excelDate) {
  if (!excelDate) return null;
  if (typeof excelDate === 'number') {
    const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }
  const s = String(excelDate).trim();
  const match = s.match(/^(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return null;
}

const NEW_DOC_EXCLUDED = ['aadhaar_card', 'ration_card'];

const VALID_SCHEME_COLS = new Set([
  'old_age_pension', 'widow_pension', 'disability_pension',
  'cm_girl_child_protection_scheme', 'death_relief_assistance',
  'women_welfare_schemes', 'puthumai_penn_schemes', 'tamil_puthalvan_schemes',
  'widows_daughter_marriage_assistance', 'fishing_ban_period_relief',
  'short_term_relief', 'saving_period_schemes', 'vb_g_ram_g_act', 'cmchis'
]);

const VALID_ELIGIBLE_COLS = new Set([
  ...VALID_SCHEME_COLS, 'maternity_benefit_schemes', 'different_subsidiaries',
  'if_applied_follow_up_needed'
]);

async function main() {
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD,
  });
  if (authError) { console.error('Login failed:', authError.message); process.exit(1); }
  console.log('Logged in.');

  // CLEAR DB RECORDS CHUNK-BY-CHUNK
  console.log('Clearing existing database records in chunks...');
  const tables = [
    'documents', 
    'corrections_required', 
    'new_documents_needed', 
    'base_documents_available', 
    'schemes_accessed', 
    'eligible_schemes', 
    'members', 
    'households'
  ];

  for (const table of tables) {
    console.log(`  Clearing table "${table}"...`);
    let deletedCount = 0;
    while (true) {
      const { data, error: selectErr } = await supabase
        .from(table)
        .select('id')
        .limit(2000);
      
      if (selectErr) {
        console.error(`Failed to select from ${table}:`, selectErr.message);
        process.exit(1);
      }
      
      if (!data || data.length === 0) break;
      
      const ids = data.map(d => d.id);
      const { error: deleteErr } = await supabase
        .from(table)
        .delete()
        .in('id', ids);
        
      if (deleteErr) {
        console.error(`Failed to delete from ${table}:`, deleteErr.message);
        process.exit(1);
      }
      deletedCount += ids.length;
      console.log(`    Deleted ${ids.length} rows (total ${deletedCount})`);
      await new Promise(r => setTimeout(r, 50));
    }
  }
  console.log('Database cleared successfully.');

  const workbook = XLSX.readFile(path.join(__dirname, '../HOUSEHOLD_SURVEY.xlsx'));
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Build column mapping
  const row1 = rows[1], row2 = rows[2], row3 = rows[3];
  let currentCategory = '';
  const colMapping = [];
  for (let i = 0; i < Math.max(row1.length, row2.length || 0); i++) {
    if (row1[i] && typeof row1[i] === 'string') currentCategory = row1[i].trim();
    if (row2[i]) colMapping.push({ index: i, category: currentCategory, field: String(row2[i]).trim() });
  }

  // Build correction sub-type mapping
  let corrStart = -1, corrEnd = -1;
  for (let i = 0; i < row1.length; i++) { if (row1[i] === 'TYPES OF CORRECTION') { corrStart = i; break; } }
  for (let i = corrStart + 1; i < row1.length; i++) { if (row1[i] && typeof row1[i] === 'string' && row1[i] !== 'TYPES OF CORRECTION') { corrEnd = i; break; } }
  const corrSubMap = [];
  let curCorrDoc = null;
  for (let i = corrStart; i < corrEnd; i++) {
    if (row2[i]) { const dbCol = mapFieldToDbCol(row2[i]); if (dbCol) curCorrDoc = dbCol; }
    if (curCorrDoc && row3[i]) {
      let subId = String(row3[i]).trim();
      if (subId === 'Mobile Number') subId = 'Mobile_Number';
      if (subId === 'Guardian Name') subId = 'Guardian_Name';
      if (subId === 'Remove/Add Name') subId = 'Others';
      corrSubMap.push({ index: i, doc: curCorrDoc, subId });
    }
  }

  // ---- Parse ALL rows with carry-forward ----
  console.log('Parsing Excel...');
  const hhList = []; // [{hhData, members: [{memberData, _docs, _corrs, ...}]}]
  let lastHH = {};
  let currentHHIndex = -1;

  for (let r = 4; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;

    if (row[4]) {
      lastHH = {
        id: crypto.randomUUID(), // Pre-generate household ID
        date: formatExcelDate(row[1]),
        staff_name: String(row[2] || '').trim(),
        hamlet_code: String(row[3] || '').trim(),
        household_number: String(row[4]).trim(),
        individual_number: String(row[5] || '').trim(),
        block: String(row[6] || '').trim(),
        village_panchayath: String(row[7] || '').trim(),
        village: String(row[8] || '').trim(),
        hamlet_name: String(row[9] || '').trim(),
        door_no: String(row[10] || '').trim(),
        street: String(row[11] || '').trim(),
        economic_status: fixEconomicStatus(String(row[12] || '').trim()),
        religion: String(row[13] || '').trim(),
        community: String(row[14] || '').trim(),
      };
      hhList.push({ hhData: { ...lastHH }, members: [] });
      currentHHIndex = hhList.length - 1;
    }

    const name = row[15];
    if (!name || currentHHIndex < 0) continue;

    const member = {
      id: crypto.randomUUID(), // Pre-generate member ID
      name: String(name).trim(),
      relationship: fixRel(String(row[16] || '').trim()),
      age: parseInt(row[17]) || null,
      gender: fixGender(String(row[18] || '').trim()),
      qualification: fixQual(String(row[19] || '').trim()),
      marital_status: fixMaritalStatus(String(row[20] || '').trim()),
      head_of_family: row[21] ? true : false,
      occupation: String(row[22] || '').trim(),
      category: String(row[23] || '').trim(),
      mbl_number: String(row[24] || '').trim(),
      different_aadhaar_linked_mobile: String(row[25] || '').trim(),
    };

    // Parse all checkbox sections
    const docs = {}, newDocs = {}, baseDocs = {}, schemesAccessed = {}, eligibleSchemes = {};
    colMapping.forEach(m => {
      const val = row[m.index];
      if (!val || !String(val).trim()) return;
      const dbCol = mapFieldToDbCol(m.field);
      if (!dbCol) return;
      if (m.category === 'DOCUMENTS AVAILABLE') docs[dbCol] = true;
      else if (m.category === 'NEW DOCUMENTS NEEDED' && !NEW_DOC_EXCLUDED.includes(dbCol)) newDocs[dbCol] = true;
      else if (m.category === 'BASE DOCUMENTS AVAILABLE') baseDocs[dbCol] = true;
      else if (m.category === 'SCHEMES ACCESSED') {
        const col = dbCol === 'society_card' ? 'saving_period_schemes' : dbCol;
        if (VALID_SCHEME_COLS.has(col)) schemesAccessed[col] = true;
      }
      else if (m.category === 'ELIGIBLE SCHEMES') {
        const col = dbCol === 'society_card' ? 'saving_period_schemes' : dbCol;
        if (VALID_ELIGIBLE_COLS.has(col)) eligibleSchemes[col] = true;
      }
    });

    const corrs = {};
    corrSubMap.forEach(m => {
      const val = row[m.index];
      if (val && String(val).trim()) { corrs[m.doc] = corrs[m.doc] || {}; corrs[m.doc][m.subId] = true; }
    });

    member._docs = docs;
    member._corrs = corrs;
    member._newDocs = newDocs;
    member._baseDocs = baseDocs;
    member._schemesAccessed = schemesAccessed;
    member._eligibleSchemes = eligibleSchemes;

    hhList[currentHHIndex].members.push(member);
  }

  const totalMembers = hhList.reduce((s, h) => s + h.members.length, 0);
  console.log(`Parsed ${hhList.length} households, ${totalMembers} total members.`);

  // ---- BATCH INSERT ----
  const BATCH = 100; // households per batch
  let hhCount = 0, memCount = 0, errCount = 0;

  for (let b = 0; b < hhList.length; b += BATCH) {
    const batch = hhList.slice(b, b + BATCH);

    // 1. Insert households
    const hhPayloads = batch.map(h => h.hhData);
    const { error: hhErr } = await supabase
      .from('households').insert(hhPayloads);
    
    if (hhErr) {
      console.error(`  HH batch ${b} error:`, hhErr.message);
      errCount += batch.length;
      continue;
    }

    // 2. Collect all members for this batch using pre-generated IDs
    const allMembers = [];
    const memberMeta = []; // parallel array to track metadata
    
    batch.forEach(h => {
      const hhId = h.hhData.id;
      h.members.forEach(m => {
        allMembers.push({
          id: m.id,
          household_id: hhId,
          name: m.name,
          relationship: m.relationship,
          age: m.age,
          gender: m.gender,
          qualification: m.qualification,
          marital_status: m.marital_status,
          head_of_family: m.head_of_family,
          occupation: m.occupation,
          category: m.category,
          mbl_number: m.mbl_number,
          different_aadhaar_linked_mobile: m.different_aadhaar_linked_mobile,
        });
        memberMeta.push(m);
      });
    });

    if (allMembers.length === 0) {
      hhCount += batch.length;
      continue;
    }

    // Insert members in sub-batches of 500
    let memBatchErr = false;
    for (let mi = 0; mi < allMembers.length; mi += 500) {
      const chunk = allMembers.slice(mi, mi + 500);
      const { error: mErr } = await supabase.from('members').insert(chunk);
      if (mErr) {
        console.error(`  Mem sub-batch error at ${b}+${mi}:`, mErr.message);
        memBatchErr = true;
        break;
      }
    }

    if (memBatchErr) {
      errCount += batch.length;
      continue;
    }

    // 3. Batch insert related tables using pre-generated IDs
    const docsArr = [], newDocsArr = [], baseDocsArr = [], schemesArr = [], eligArr = [], corrsArr = [];

    for (let mi = 0; mi < allMembers.length; mi++) {
      const m = memberMeta[mi];
      const memId = m.id;

      docsArr.push({ member_id: memId, ...m._docs });
      newDocsArr.push({ member_id: memId, ...m._newDocs });
      baseDocsArr.push({ member_id: memId, ...m._baseDocs });
      schemesArr.push({ member_id: memId, ...m._schemesAccessed });
      eligArr.push({ member_id: memId, ...m._eligibleSchemes });
      if (Object.keys(m._corrs).length > 0) corrsArr.push({ member_id: memId, corrections: m._corrs });
    }

    // Fire related inserts in parallel, in sub-batches of 500
    async function batchInsert(table, arr) {
      for (let i = 0; i < arr.length; i += 500) {
        const chunk = arr.slice(i, i + 500);
        const { error } = await supabase.from(table).insert(chunk);
        if (error) console.error(`  ${table} error at batch ${b}:`, error.message);
      }
    }

    await Promise.all([
      batchInsert('documents', docsArr),
      batchInsert('new_documents_needed', newDocsArr),
      batchInsert('base_documents_available', baseDocsArr),
      batchInsert('schemes_accessed', schemesArr),
      batchInsert('eligible_schemes', eligArr),
      batchInsert('corrections_required', corrsArr),
    ]);

    hhCount += batch.length;
    memCount += allMembers.length;
    console.log(`  Progress: ${hhCount}/${hhList.length} HH, ${memCount} members...`);
    
    await new Promise(r => setTimeout(r, 50));
  }

  console.log(`\nIMPORT COMPLETE!`);
  console.log(`  Households: ${hhCount}`);
  console.log(`  Members: ${memCount}`);
  console.log(`  Errors: ${errCount}`);
  process.exit(0);
}

main();
