const XLSX = require('xlsx');
const wb = XLSX.readFile('../HOUSEHOLD_SURVEY.xlsx');
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

const row1 = data[1]; // Categories like 'DOCUMENTS AVAILABLE'
const row2 = data[2]; // Specific checkboxes like 'Aadhar Card'

let currentCategory = '';
const mapping = [];

for (let i = 0; i < Math.max(row1.length, row2.length); i++) {
  if (row1[i] && typeof row1[i] === 'string' && !row1[i].startsWith('__EMPTY')) {
    currentCategory = row1[i].trim();
  }
  
  if (row2[i]) {
    mapping.push({ index: i, category: currentCategory, field: row2[i].trim() });
  } else if (row1[i] && !row1[i].startsWith('__EMPTY')) {
    mapping.push({ index: i, category: currentCategory, field: 'MainField' });
  }
}

console.log(JSON.stringify(mapping, null, 2));
