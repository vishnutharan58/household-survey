const fs = require('fs');
const seed = JSON.parse(fs.readFileSync('scratch/cc_seed.json', 'utf8'));

let sql = 'ALTER TABLE public.community_collectives ADD COLUMN IF NOT EXISTS membership_count INTEGER DEFAULT 0;\n\n';

seed.forEach(c => {
  sql += `UPDATE public.community_collectives SET membership_count = ${c.membership_count}, meetings_conducted = ${c.meetings_conducted}, participants_count = ${c.participants_count} WHERE sno = '${c.sno}';\n`;
});

fs.writeFileSync('scratch/db_update.sql', sql);
console.log('Update SQL generated.');
