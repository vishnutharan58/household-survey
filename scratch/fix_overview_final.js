const fs = require('fs');
const file = 'apps/web/src/pages/Admin/AdminDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "function OverviewTab({ stats, loading, onExport, surveys }: { stats: any, loading: boolean, onExport: (type: 'weekly' | 'monthly' | 'all') => void, surveys: DraftSurvey[] }) {",
  "function OverviewTab({ stats, loading, onExport, surveys, exporting }: any) {"
);

fs.writeFileSync(file, code);
console.log('Fixed OverviewTab props!');
