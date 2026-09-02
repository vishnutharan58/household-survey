const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'apps/web/src/pages/Admin/AdminDashboard.tsx',
  'apps/web/src/pages/Staff/StaffDashboard.tsx',
  'apps/web/src/pages/Staff/SurveyForm.tsx'
];

for (const file of filesToUpdate) {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add formatDateDDMMYYYY to the import from '@pro-vision-care/shared'
  if (content.includes('@pro-vision-care/shared') && !content.includes('formatDateDDMMYYYY')) {
    content = content.replace(/(import\s+{[\s\S]*?)(\s*}\s*from\s*['"]@pro-vision-care\/shared['"];)/, '$1, formatDateDDMMYYYY$2');
  }
  
  // Replace .toLocaleDateString()
  content = content.replace(/new Date\(([^)]+)\)\.toLocaleDateString\(\)/g, 'formatDateDDMMYYYY($1)');
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
}
