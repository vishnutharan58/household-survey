const fs = require('fs');
const file = 'apps/web/src/pages/Admin/AdminDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /function OverviewTab\(\{ stats, loading, onExport, surveys, exporting \}: any\) \{/,
  "function OverviewTab({ stats, loading, onExport, surveys, exporting }: { stats: any, loading: boolean, onExport: (type: 'weekly' | 'monthly' | 'all') => void, surveys: DraftSurvey[], exporting: boolean }) {"
);

fs.writeFileSync(file, code);
console.log('Fixed OverviewTab props again!');
