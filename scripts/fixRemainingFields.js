const path = require('path');
const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../apps/web/.env') });

async function main() {
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  });
  if (authError) { console.error('Login failed:', authError.message); process.exit(1); }
  console.log('Logged in.');

  // Read Excel as 2D array (the ONLY reliable way with this file)
  const workbook = XLSX.readFile(path.join(__dirname, '../HOUSEHOLD_SURVEY.xlsx'));
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Column layout (verified from Row 1 headers):
  // 0=SNO, 1=DATE, 2=STAFF, 3=HAMLET CODE, 4=HH NUMBER, 5=INDV NUMBER
  // 6=BLOCK, 7=PANCHAYATH, 8=VILLAGE, 9=HAMLET NAME, 10=DOOR NO, 11=STREET
  // 12=ECO STATUS, 13=RELIGION, 14=COMMUNITY
  // 15=NAME, 16=RELATIONSHIP, 17=AGE, 18=GENDER, 19=QUALIFICATION
  // 20=MARITAL STATUS, 21=HEAD OF FAMILY, 22=OCCUPATION, 23=CATEGORY
  // 24=MBL NUMBER, 25=AADHAAR LINKED MBL

  // ---- STEP 1: Fix missing household fields (hamlet_name) ----
  console.log('Step 1: Fixing household hamlet_name...');
  
  // Fetch all households from DB
  let dbHouseholds = [];
  let page = 0;
  while (true) {
    const { data, error } = await supabase
      .from('households')
      .select('id, household_number, hamlet_code')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (error || !data || data.length === 0) break;
    dbHouseholds.push(...data);
    page++;
  }
  console.log(`  Fetched ${dbHouseholds.length} households from DB.`);

  // Build Excel lookup: "hhNum-hamletCode" -> hamlet_name
  const hhExcelMap = new Map();
  for (let r = 4; r < rows.length; r++) {
    const row = rows[r];
    if (!row || !row[4]) continue;
    const key = `${row[4]}-${row[3]}`;
    if (!hhExcelMap.has(key)) {
      hhExcelMap.set(key, {
        hamlet_name: String(row[9] || ''),
      });
    }
  }

  const hhUpdates = [];
  dbHouseholds.forEach(dbHh => {
    const key = `${dbHh.household_number}-${dbHh.hamlet_code}`;
    const excelData = hhExcelMap.get(key);
    if (excelData && excelData.hamlet_name) {
      hhUpdates.push({
        id: dbHh.id,
        hamlet_name: excelData.hamlet_name,
      });
    }
  });

  console.log(`  Updating ${hhUpdates.length} households with hamlet_name...`);
  for (let i = 0; i < hhUpdates.length; i += 500) {
    const chunk = hhUpdates.slice(i, i + 500);
    const { error } = await supabase.from('households').upsert(chunk);
    if (error) console.error(`  Batch ${i} error:`, error.message);
    else console.log(`  Updated ${Math.min(i + 500, hhUpdates.length)}/${hhUpdates.length}`);
    await new Promise(r => setTimeout(r, 50));
  }

  // ---- STEP 2: Fix missing member fields (category, different_aadhaar_linked_mobile) ----
  console.log('Step 2: Fixing member category & aadhaar mobile...');

  // Fetch all members with their household info for matching
  let allMembers = [];
  page = 0;
  while (true) {
    const { data, error } = await supabase
      .from('members')
      .select('id, name, relationship, household_id, category, different_aadhaar_linked_mobile, households!inner(household_number, hamlet_code)')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (error || !data || data.length === 0) break;
    allMembers.push(...data);
    page++;
  }
  console.log(`  Fetched ${allMembers.length} members from DB.`);

  // Build member lookup
  const memberMap = new Map();
  allMembers.forEach(m => {
    const key = `${m.households?.household_number || ''}-${m.households?.hamlet_code || ''}-${m.name || ''}`.toLowerCase();
    memberMap.set(key, m);
  });

  const memUpdates = [];
  for (let r = 4; r < rows.length; r++) {
    const row = rows[r];
    if (!row || !row[4] || !row[15]) continue;

    const key = `${row[4]}-${row[3]}-${row[15]}`.toLowerCase();
    const dbMem = memberMap.get(key);
    if (!dbMem) continue;

    const category = String(row[23] || '').trim();
    const aadhaarMobile = String(row[25] || '').trim();

    const update = { id: dbMem.id, household_id: dbMem.household_id, name: dbMem.name };
    let needsUpdate = false;

    if (category && !dbMem.category) {
      update.category = category;
      needsUpdate = true;
    }
    if (aadhaarMobile && !dbMem.different_aadhaar_linked_mobile) {
      update.different_aadhaar_linked_mobile = aadhaarMobile;
      needsUpdate = true;
    }

    if (needsUpdate) memUpdates.push(update);
  }

  console.log(`  Updating ${memUpdates.length} members with category & aadhaar mobile...`);
  for (let i = 0; i < memUpdates.length; i += 500) {
    const chunk = memUpdates.slice(i, i + 500);
    const { error } = await supabase.from('members').upsert(chunk);
    if (error) console.error(`  Batch ${i} error:`, error.message);
    else console.log(`  Updated ${Math.min(i + 500, memUpdates.length)}/${memUpdates.length}`);
    await new Promise(r => setTimeout(r, 50));
  }

  console.log('All missing fields have been fixed!');
  process.exit(0);
}

main();
