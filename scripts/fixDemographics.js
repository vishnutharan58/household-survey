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

  console.log('Reading Excel file...');
  const workbook = XLSX.readFile(path.join(__dirname, '../HOUSEHOLD_SURVEY.xlsx'));
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const householdsToUpdate = new Map(); // hhNum -> { street, individual_number }

  for (let r = 3; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const hhNum = String(row[4] || '');
    const hamlet = String(row[3] || '');
    if (!hhNum) continue;

    const indNum = String(row[5] || '');
    const street = String(row[11] || '');

    const key = `${hhNum}-${hamlet}`;
    if (!householdsToUpdate.has(key)) {
      householdsToUpdate.set(key, { hhNum, hamlet, individual_number: indNum, street: street });
    }
  }

  console.log(`Parsed ${householdsToUpdate.size} unique households from Excel. Fetching DB households...`);
  
  let dbHouseholds = [];
  let page = 0;
  while(true) {
    const { data: hhs, error } = await supabase
      .from('households')
      .select('id, household_number, hamlet_code')
      .range(page * 1000, (page + 1) * 1000 - 1);
    
    if (error) {
      console.error('Error fetching households:', error.message);
      break;
    }
    if (!hhs || hhs.length === 0) break;
    dbHouseholds.push(...hhs);
    page++;
  }

  const hhUpdates = [];
  dbHouseholds.forEach(dbHh => {
    const key = `${dbHh.household_number}-${dbHh.hamlet_code}`;
    if (householdsToUpdate.has(key)) {
      const { individual_number, street } = householdsToUpdate.get(key);
      hhUpdates.push({
        id: dbHh.id,
        individual_number,
        street
      });
    }
  });

  console.log(`Updating ${hhUpdates.length} households with street and individual_number...`);
  for (let i = 0; i < hhUpdates.length; i += 500) {
    const chunk = hhUpdates.slice(i, i + 500);
    const { error } = await supabase.from('households').upsert(chunk);
    if (error) console.error(`Batch ${i} error:`, error.message);
  }

  console.log('Fixing relationships and qualifications in DB...');
  
  let dbMembers = [];
  page = 0;
  while(true) {
    const { data: mems, error } = await supabase
      .from('members')
      .select('id, relationship, qualification, household_id, name')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (error) break;
    if (!mems || mems.length === 0) break;
    dbMembers.push(...mems);
    page++;
  }

  function fixRel(r) {
    if (!r) return r;
    const l = r.trim().toLowerCase();
    if (['husband', 'wife'].includes(l)) return 'Spouse';
    if (['son'].includes(l)) return 'Son';
    if (['daughter'].includes(l)) return 'Daughter';
    if (['father'].includes(l)) return 'Father';
    if (['mother'].includes(l)) return 'Mother';
    if (['brother'].includes(l)) return 'Brother';
    if (['sister'].includes(l)) return 'Sister';
    if (['self', 'head'].includes(l)) return 'Head of Family';
    if (['mother in law'].includes(l)) return 'Mother-in-law';
    if (['father in law'].includes(l)) return 'Father-in-law';
    if (['daughter in law'].includes(l)) return 'Daughter-in-law';
    if (['son in law'].includes(l)) return 'Son-in-law';
    return 'Other'; // default fallback for Grand Mother, etc.
  }

  function fixQual(q) {
    if (!q) return q;
    const l = q.trim().toLowerCase();
    if (l.includes('primary')) return 'Primary (1st to 5th)';
    if (l.includes('middle')) return 'Middle (6th to 8th)';
    if (l.includes('high school')) return 'High School (10th)';
    if (l.includes('higher secondary')) return 'Higher Secondary (12th)';
    if (l.includes('uneducated') || l.includes('illiterate')) return 'Illiterate';
    if (l === 'ug') return "Graduate / Bachelor's Degree";
    if (l === 'pg') return "Post Graduate / Master's Degree";
    if (l.includes('diploma')) return 'Diploma';
    if (l.includes('iti')) return 'ITI';
    return 'Other';
  }

  const memUpdates = [];
  dbMembers.forEach(m => {
    const newR = fixRel(m.relationship);
    const newQ = fixQual(m.qualification);
    if (newR !== m.relationship || newQ !== m.qualification) {
      memUpdates.push({
        id: m.id,
        household_id: m.household_id,
        name: m.name,
        relationship: newR,
        qualification: newQ
      });
    }
  });

  console.log(`Updating ${memUpdates.length} members with normalized strings...`);
  for (let i = 0; i < memUpdates.length; i += 500) {
    const chunk = memUpdates.slice(i, i + 500);
    const { error } = await supabase.from('members').upsert(chunk);
    if (error) console.error(`Batch mem ${i} error:`, error.message);
  }

  console.log('All demographics successfully fixed!');
  process.exit(0);
}

main();
