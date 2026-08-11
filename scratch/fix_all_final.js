const fs = require('fs');
const file = 'apps/web/src/pages/Admin/AdminDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Replace OverviewTab definition completely using regex up to ") {"
code = code.replace(
  /function OverviewTab\(\{[\s\S]*?\}\s*:\s*\{[\s\S]*?\}\s*\)\s*\{/,
  "function OverviewTab({ stats, loading, onExport, surveys, exporting }: any) {"
);

// 2. Fix the exporting undefined error in the button
// Because the button code used `exporting` before OverviewTab got the prop correctly.
// Oh wait, the button is INSIDE OverviewTab, right?
// Yes, line 3735 is inside OverviewTab. 
// Once the definition has `exporting` prop, line 3735 will be fine.

// 3. Fix syncService.ts implicit any array index error
const syncFile = 'packages/shared/src/syncService.ts';
let syncCode = fs.readFileSync(syncFile, 'utf8');
syncCode = syncCode.replace(/const groupBy = \(array: any\[\], key: string \| \(\(item: any\) => string\)\) => \{/g, 'const groupBy = (array: any[], key: any) => {');
fs.writeFileSync(syncFile, syncCode);

fs.writeFileSync(file, code);
console.log('Fixed completely!');
