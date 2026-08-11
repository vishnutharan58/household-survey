const fs = require('fs');
const seed = JSON.parse(fs.readFileSync('scratch/cc_seed.json', 'utf8'));

// Generate new SQL seed
const sqlRows = seed.map(c => 
  `  ('${c.sno}', '${c.name.replace(/'/g, "''")}', ${c.membership_count}, ${c.meetings_conducted}, ${c.participants_count})`
).join(',\n');

const newSeedSQL = `-- Seed initial collectives
INSERT INTO public.community_collectives (sno, name, membership_count, meetings_conducted, participants_count)
VALUES
${sqlRows}
ON CONFLICT DO NOTHING;`;

// Read migration script
let txt = fs.readFileSync('supabase/migration_care_modifications.sql', 'utf8');

// Add membership_count to CREATE TABLE
txt = txt.replace('name TEXT NOT NULL,\n  meetings_conducted INTEGER DEFAULT 0,', 'name TEXT NOT NULL,\n  membership_count INTEGER DEFAULT 0,\n  meetings_conducted INTEGER DEFAULT 0,');

// Find the old seed query and replace it
const startIdx = txt.indexOf('-- Seed initial collectives');
const endIdx = txt.indexOf('-- 7. Update get_dashboard_stats');
if (startIdx !== -1 && endIdx !== -1) {
  txt = txt.substring(0, startIdx) + newSeedSQL + '\n\n' + txt.substring(endIdx);
  fs.writeFileSync('supabase/migration_care_modifications.sql', txt);
  console.log('Migration script updated successfully with membership details!');
} else {
  console.log('Could not find seed section to replace.');
}
