const XLSX = require('xlsx');
const path = require('path');

const filepath = path.join(__dirname, '../Staff and Event details - CARE.xlsx');
const workbook = XLSX.readFile(filepath);
const sheet = workbook.Sheets['EVENTS - CARE'];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
rows.forEach((r, i) => {
  if (r && r.length > 0) {
    console.log(`Row ${i+1}:`, r);
  }
});
