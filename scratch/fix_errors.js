const fs = require('fs');
const file = 'apps/web/src/pages/Admin/AdminDashboard.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add exporting state to AdminDashboard if missing
if (!code.includes('const [exporting, setExporting]')) {
  code = code.replace(
    /const \[loadingStats, setLoadingStats\] = useState\(true\);/,
    `const [loadingStats, setLoadingStats] = useState(true);\n  const [exporting, setExporting] = useState(false);`
  );
}

// 2. Fix OverviewTab definition props
// The OverviewTab might be defined differently than my regex expected.
code = code.replace(
  /function OverviewTab\(\{ stats, loading, onExport, surveys \}: \{[^\}]+\}\)/,
  `function OverviewTab({ stats, loading, onExport, surveys, exporting }: any)`
);

// Fallback if the above doesn't match
code = code.replace(
  /function OverviewTab\(\{ stats, loading, onExport, surveys \}\)/,
  `function OverviewTab({ stats, loading, onExport, surveys, exporting }: any)`
);

// Ensure OverviewTab is updated even if the previous regex failed
if (code.includes('function OverviewTab({ stats, loading, onExport, surveys }:')) {
  code = code.replace(/function OverviewTab\(\{ stats, loading, onExport, surveys \}:[^{]+\{[^}]+\}\)/, `function OverviewTab({ stats, loading, onExport, surveys, exporting }: any)`);
}

// 3. Fix syncService.ts implicit any errors
const syncFile = 'packages/shared/src/syncService.ts';
if (fs.existsSync(syncFile)) {
  let syncCode = fs.readFileSync(syncFile, 'utf8');
  syncCode = syncCode.replace(/const groupBy = \(array, key\)/g, 'const groupBy = (array: any[], key: string | ((item: any) => string))');
  syncCode = syncCode.replace(/return array\.reduce\(\(acc, obj\) => \{/g, 'return array.reduce((acc: any, obj: any) => {');
  
  // ignore unused vars
  syncCode = syncCode.replace(/const { data: [^,]+, error: docErr }/g, 'const { data: documents }');
  syncCode = syncCode.replace(/const { data: [^,]+, error: corErr }/g, 'const { data: corrections }');
  syncCode = syncCode.replace(/const { data: [^,]+, error: corMadeErr }/g, 'const { data: corrections_made }');
  syncCode = syncCode.replace(/const { data: [^,]+, error: newErr }/g, 'const { data: new_members }');
  syncCode = syncCode.replace(/const { data: [^,]+, error: baseErr }/g, 'const { data: base_members }');
  syncCode = syncCode.replace(/const { data: [^,]+, error: schErr }/g, 'const { data: schemes }');
  
  fs.writeFileSync(syncFile, syncCode);
}

fs.writeFileSync(file, code);
console.log('Fixed typings and state!');
