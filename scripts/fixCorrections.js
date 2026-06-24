const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../apps/web/.env') });

async function main() {
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  await supabase.auth.signInWithPassword({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });

  let allMembers = [];
  let page = 0;
  while(true) {
    const { data: members, error } = await supabase
      .from('members')
      .select('id, name, relationship, households!inner(household_number, hamlet_code)')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (error || !members || members.length === 0) break;
    allMembers.push(...members);
    page++;
  }
  const memberMap = new Map();
  allMembers.forEach(m => {
    const key = `${m.households?.household_number || ''}-${m.households?.hamlet_code || ''}-${m.name || ''}-${m.relationship || ''}`.toLowerCase();
    memberMap.set(key, m.id);
  });

  const workbook = XLSX.readFile(path.join(__dirname, '../HOUSEHOLD_SURVEY.xlsx'));
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const row1 = rows[1];
  const row2 = rows[2];
  const row3 = rows[3]; // We need row 3 for subtypes!
  
  // Find the exact indices for TYPES OF CORRECTION
  let startIdx = -1;
  let endIdx = -1;
  for (let i = 0; i < row1.length; i++) {
    if (row1[i] === 'TYPES OF CORRECTION') {
      startIdx = i;
      break;
    }
  }
  for (let i = startIdx + 1; i < row1.length; i++) {
    if (row1[i] && !row1[i].startsWith('__EMPTY')) {
      endIdx = i;
      break;
    }
  }

  // Build column mapping for corrections
  const corrMapping = [];
  let currentDoc = null;

  for (let i = startIdx; i < endIdx; i++) {
    if (row2[i] && typeof row2[i] === 'string' && !row2[i].startsWith('__EMPTY')) {
      // Map Excel string to DB column name safely
      let dbCol = null;
      const f = row2[i].toLowerCase().replace(/[^a-z0-9]/g, '_');
      if (f.includes('aadhar')) dbCol = 'aadhaar_card';
      else if (f.includes('ration')) dbCol = 'ration_card';
      else if (f.includes('e_epic')) dbCol = 'e_epic';
      else if (f.includes('pan')) dbCol = 'pan_card';
      else if (f.includes('community')) dbCol = 'community_certificate';
      else if (f.includes('birth')) dbCol = 'birth_certificate';
      else if (f.includes('fisherman_id')) dbCol = 'fisherman_id_card';
      else if (f.includes('fisherman_welfare')) dbCol = 'fisherman_welfare_card';
      else if (f.includes('cmchis') || f.includes('comprehensive')) dbCol = 'cmchis';
      
      if (dbCol) currentDoc = dbCol;
    }

    if (currentDoc) {
      // Read the subtype from Row 3
      let subType = row3[i];
      if (!subType && row2[i] === 'Update') subType = 'Update'; // Some merged headers might be weird
      
      if (subType) {
        let subId = subType.trim();
        if (subId === 'Mobile Number') subId = 'Mobile_Number';
        if (subId === 'Guardian Name') subId = 'Guardian_Name';
        if (subId === 'Remove/Add Name') subId = 'Others'; // Map to others since no such ID
        corrMapping.push({ index: i, doc: currentDoc, subId });
      }
    }
  }

  const correctionsToUpsert = [];

  for (let r = 4; r < rows.length; r++) { // Data starts at row 4
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const key = `${row[4] || ''}-${row[3] || ''}-${row[15] || ''}-${row[16] || ''}`.toLowerCase();
    const memberId = memberMap.get(key);
    if (!memberId) continue;

    const corrs = { member_id: memberId, corrections: {} };

    corrMapping.forEach(m => {
      const val = row[m.index];
      const isChecked = val && String(val).trim().length > 0;
      if (isChecked) {
        corrs.corrections[m.doc] = corrs.corrections[m.doc] || {};
        corrs.corrections[m.doc][m.subId] = true;
      }
    });

    if (Object.keys(corrs.corrections).length > 0) {
      correctionsToUpsert.push(corrs);
    }
  }

  console.log(`Prepared ${correctionsToUpsert.length} correction records. Upserting...`);
  
  // Important: Wipe all old incorrect 'Update' keys first by overwriting everything
  for (let i = 0; i < correctionsToUpsert.length; i += 500) {
    const chunk = correctionsToUpsert.slice(i, i + 500);
    const { error } = await supabase.from('corrections_required').upsert(chunk, { onConflict: 'member_id' });
    if (error) console.error(`Batch ${i} error:`, error.message);
  }

  console.log('Finished fixing corrections!');
  process.exit(0);
}
main();
