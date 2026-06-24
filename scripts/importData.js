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

  if (!supabaseUrl || !supabaseKey || !adminEmail || !adminPassword) {
    console.error("Missing credentials in apps/web/.env (Ensure VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, ADMIN_EMAIL, ADMIN_PASSWORD are set)");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Logging in as admin...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  });

  if (authError) {
    console.error('Login failed:', authError.message);
    process.exit(1);
  }
  console.log('Login successful.');

  console.log('Reading Excel file...');
  const workbook = XLSX.readFile(path.join(__dirname, '../HOUSEHOLD_SURVEY.xlsx'));
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  // Skip the first row (the main title) and use the second row as headers
  const rows = XLSX.utils.sheet_to_json(sheet, { range: 1 });

  console.log(`Found ${rows.length} rows. Grouping by Household Number...`);

  function formatExcelDate(excelDate) {
    if (!excelDate) return null;
    if (typeof excelDate === 'string') return excelDate;
    // Excel epoch is 1899-12-30
    const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }

  const householdsMap = new Map();

  rows.forEach(row => {
    const hhNum = row['HOUSE HOLD  NUMBER'];
    if (!hhNum) return;

    if (!householdsMap.has(hhNum)) {
      householdsMap.set(hhNum, {
        date: formatExcelDate(row['DATE']),
        staff_name: row['STAFF NAME'] || '',
        hamlet_code: row['HAMLET CODE'] || '',
        household_number: String(hhNum),
        block: row['BLOCK'] || '',
        village_panchayath: row['VILLAGE PANCHAYATH'] || '',
        village: row['VILLAGE'] || '',
        door_no: String(row['DOOR NO'] || ''),
        economic_status: row['ECONOMIC STATUS'] || '',
        religion: row['RELIGION'] || '',
        community: row['COMMUNITY'] || '',
        members: []
      });
    }

    const member = {
      name: row['NAME  OF THE FAMILY MEMBER'] || '',
      relationship: row['RELATIONSHIP'] || '',
      age: parseInt(row['AGE']) || null,
      gender: row['GENDER'] || '',
      qualification: row['QUALIFICATION'] || '',
      marital_status: row['MARITAL STATUS'] || '',
      head_of_family: row['HEAD OF THE FAMILY'] ? true : false,
      occupation: row['OCCUPATION'] || '',
      mbl_number: String(row['MBL NUMBER'] || ''),
    };

    if (member.name) {
      householdsMap.get(hhNum).members.push(member);
    }
  });

  const households = Array.from(householdsMap.values());
  console.log(`Grouped into ${households.length} unique households.`);
  console.log('Fetching existing households to prevent duplicates...');
  
  const { data: existingHh, error: extErr } = await supabase.from('households').select('household_number, hamlet_code').limit(10000);
  const existingSet = new Set(existingHh?.map(h => `${h.household_number}-${h.hamlet_code}`) || []);
  
  const householdsToImport = households.filter(h => !existingSet.has(`${h.household_number}-${h.hamlet_code}`));
  
  console.log(`Found ${existingSet.size} already imported.`);
  console.log(`Starting upload to Supabase for the remaining ${householdsToImport.length} households...`);

  let successCount = 0;
  let failCount = 0;

  for (const hh of householdsToImport) {
    // 1. Insert household
    const { data: hhData, error: hhError } = await supabase
      .from('households')
      .insert({
        date: hh.date,
        staff_name: hh.staff_name,
        hamlet_code: hh.hamlet_code,
        household_number: hh.household_number,
        block: hh.block,
        village_panchayath: hh.village_panchayath,
        village: hh.village,
        door_no: hh.door_no,
        economic_status: hh.economic_status,
        religion: hh.religion,
        community: hh.community
      })
      .select('id')
      .single();

    if (hhError) {
      console.error(`Failed to insert HH ${hh.household_number}:`, hhError.message);
      failCount++;
      continue;
    }

    // 2. Insert members
    const membersToInsert = hh.members.map(m => ({
      ...m,
      household_id: hhData.id
    }));

    if (membersToInsert.length > 0) {
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .insert(membersToInsert)
        .select('id');

      if (memberError) {
        console.error(`Failed to insert members for HH ${hh.household_number}:`, memberError.message);
      } else {
        // 3. Insert empty documents record for each member
        const docsToInsert = memberData.map(md => ({
          member_id: md.id,
          documents: {}
        }));
        await supabase.from('documents').insert(docsToInsert);
      }
    }

    successCount++;
    if (successCount % 10 === 0) {
      console.log(`Imported ${successCount} households...`);
    }

    // Small delay to prevent API rate limits / socket exhaustion
    await new Promise(r => setTimeout(r, 20));
  }

  console.log('=============================');
  console.log('Migration Complete!');
  console.log(`Successfully imported: ${successCount} households`);
  console.log(`Failed: ${failCount} households`);
  process.exit(0);
}

main();
