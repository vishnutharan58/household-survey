const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../apps/web/.env') });

async function main() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Logging in as admin...');
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  });

  if (authError) {
    console.error('Login failed:', authError.message);
    process.exit(1);
  }
  console.log('Login successful.');

  console.log('Downloading member mapping from Supabase...');
  
  let allMembers = [];
  let page = 0;
  while(true) {
    const { data: members, error } = await supabase
      .from('members')
      .select('id, name, relationship, households!inner(household_number, hamlet_code)')
      .range(page * 1000, (page + 1) * 1000 - 1);
    
    if (error) {
      console.error('Error fetching members:', error.message);
      process.exit(1);
    }
    if (!members || members.length === 0) break;
    allMembers.push(...members);
    page++;
  }
  
  console.log(`Fetched ${allMembers.length} members from Supabase.`);

  // Create a lookup map: "HouseholdNumber-HamletCode-Name-Relationship" -> MemberID
  const memberMap = new Map();
  allMembers.forEach(m => {
    const hhNum = m.households?.household_number || '';
    const hamlet = m.households?.hamlet_code || '';
    const name = m.name || '';
    const rel = m.relationship || '';
    const key = `${hhNum}-${hamlet}-${name}-${rel}`.toLowerCase();
    memberMap.set(key, m.id);
  });

  console.log('Reading Excel file...');
  const workbook = XLSX.readFile(path.join(__dirname, '../HOUSEHOLD_SURVEY.xlsx'));
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Map JSON logic generated earlier
  const row1 = rows[1];
  const row2 = rows[2];
  let currentCategory = '';
  const colMapping = [];

  for (let i = 0; i < Math.max(row1.length, row2.length); i++) {
    if (row1[i] && typeof row1[i] === 'string' && !row1[i].startsWith('__EMPTY')) {
      currentCategory = row1[i].trim();
    }
    if (row2[i]) {
      colMapping.push({ index: i, category: currentCategory, field: row2[i].trim() });
    }
  }

  // Helper to map Excel string to DB column name safely
  function mapFieldToDbCol(field) {
    const f = field.toLowerCase().replace(/[^a-z0-9]/g, '_');
    // Mappings based on schema.sql
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
    
    // Schemes
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
    
    return null;
  }

  const documentsToUpsert = [];
  const correctionsToUpsert = [];
  const newDocsToUpsert = [];
  const baseDocsToUpsert = [];
  const schemesToUpsert = [];
  const eligibleSchemesToUpsert = [];

  let matchCount = 0;

  for (let r = 3; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const hhNum = row[4] || '';
    const hamlet = row[3] || '';
    const name = row[15] || '';
    const rel = row[16] || '';

    const key = `${hhNum}-${hamlet}-${name}-${rel}`.toLowerCase();
    const memberId = memberMap.get(key);

    if (!memberId) continue;
    matchCount++;

    const docs = { member_id: memberId };
    const corrs = { member_id: memberId, corrections: {} };
    const newDocs = { member_id: memberId };
    const baseDocs = { member_id: memberId };
    const schemes = { member_id: memberId };
    const eligSchemes = { member_id: memberId };

    colMapping.forEach(m => {
      const val = row[m.index];
      const isChecked = val && String(val).trim().length > 0;
      if (!isChecked) return;

      const dbCol = mapFieldToDbCol(m.field);
      
      if (m.category === 'DOCUMENTS AVAILABLE' && dbCol) {
        docs[dbCol] = true;
      } else if (m.category === 'CORRECTION REQURED' && dbCol) {
        corrs.corrections[dbCol] = corrs.corrections[dbCol] || {};
      } else if (m.category === 'TYPES OF CORRECTION') {
        if (dbCol) {
          corrs.corrections[dbCol] = corrs.corrections[dbCol] || {};
          corrs.corrections[dbCol]['Update'] = true;
        }
      } else if (m.category === 'NEW DOCUMENTS NEEDED' && dbCol) {
        // new_documents_needed table doesn't have aadhaar and ration
        if (dbCol !== 'aadhaar_card' && dbCol !== 'ration_card') {
          newDocs[dbCol] = true;
        }
      } else if (m.category === 'BASE DOCUMENTS AVAILABLE' && dbCol) {
        baseDocs[dbCol] = true;
      } else if (m.category === 'SCHEMES ACCESSED' && dbCol) {
        if (dbCol === 'society_card') schemes['saving_period_schemes'] = true;
        else schemes[dbCol] = true;
      } else if (m.category === 'ELIGIBLE SCHEMES' && dbCol) {
        if (dbCol === 'society_card') eligSchemes['saving_period_schemes'] = true;
        else eligSchemes[dbCol] = true;
      }
    });

    // Push to arrays only if we found some data (or just push defaults to make sure record exists)
    documentsToUpsert.push(docs);
    if (Object.keys(corrs.corrections).length > 0) correctionsToUpsert.push(corrs);
    newDocsToUpsert.push(newDocs);
    baseDocsToUpsert.push(baseDocs);
    schemesToUpsert.push(schemes);
    eligibleSchemesToUpsert.push(eligSchemes);
  }

  console.log(`Matched ${matchCount} rows with DB members. Preparing upserts...`);

  async function batchUpsert(table, dataArray) {
    const BATCH_SIZE = 500;
    for (let i = 0; i < dataArray.length; i += BATCH_SIZE) {
      const chunk = dataArray.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from(table).upsert(chunk, { onConflict: 'member_id' });
      if (error) {
        console.error(`Error upserting ${table} batch ${i}:`, error.message);
      } else {
        console.log(`Upserted ${i + chunk.length} records into ${table}...`);
      }
      await new Promise(res => setTimeout(res, 50));
    }
  }

  console.log('Upserting Documents...');
  await batchUpsert('documents', documentsToUpsert);

  console.log('Upserting Corrections...');
  await batchUpsert('corrections_required', correctionsToUpsert);

  console.log('Upserting New Documents Needed...');
  await batchUpsert('new_documents_needed', newDocsToUpsert);

  console.log('Upserting Base Documents...');
  await batchUpsert('base_documents_available', baseDocsToUpsert);

  console.log('Upserting Schemes...');
  await batchUpsert('schemes_accessed', schemesToUpsert);

  console.log('Upserting Eligible Schemes...');
  await batchUpsert('eligible_schemes', eligibleSchemesToUpsert);

  console.log('All missing data has been successfully imported!');
  process.exit(0);
}

main();
