const xlsx = require('xlsx');
const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.startsWith('Household_Survey_all'));
const file = files[0];
const wb = xlsx.readFile(file);
const ws = wb.Sheets[wb.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(ws, {header: 1});

console.log('Row 5 (data row 1):', data[4].slice(0, 30));
console.log('Row 5 docs (cols 26-28):', data[4].slice(26, 29));
