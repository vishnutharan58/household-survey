const fs = require('fs');
const txt = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8');
const match = txt.match(/const EVENT_DETAILS = (\[[\s\S]*?\]);\n/);
let EVENT_DETAILS;
eval('EVENT_DETAILS = ' + match[1]);

const sqlSeed = EVENT_DETAILS.map(e => {
  const safeActivity = e.activity.replace(/'/g, "''");
  const pp = e.plannedPrograms || 0;
  const ap = e.achievedPrograms || 0;
  const ppa = e.plannedParticipants || 0;
  const apa = e.achievedParticipants || 0;
  return `  ('${e.sno}', '${safeActivity}', ${pp}, ${ap}, ${ppa}, ${apa})`;
}).join(',\n');

const query = `-- Seed initial events
INSERT INTO public.events (sno, activity, planned_programs, achieved_programs, planned_participants, achieved_participants)
VALUES
${sqlSeed}
ON CONFLICT DO NOTHING;

`;

let migrationText = fs.readFileSync('supabase/migration_care_modifications.sql', 'utf8');
const insertPoint = migrationText.indexOf('-- 7. Update get_dashboard_stats');
if (insertPoint !== -1) {
  migrationText = migrationText.slice(0, insertPoint) + query + '\n' + migrationText.slice(insertPoint);
  fs.writeFileSync('supabase/migration_care_modifications.sql', migrationText);
  console.log('Migration script updated successfully.');
}
