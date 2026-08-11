const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

function inspectFile(filepath) {
  console.log(`=== Inspecting ${path.basename(filepath)} ===`);
  const workbook = XLSX.readFile(filepath);
  console.log("Sheets:", workbook.SheetNames);
  workbook.SheetNames.forEach(sheetname => {
    console.log(`  Sheet: ${sheetname}`);
    const sheet = workbook.Sheets[sheetname];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    // Print first 5 rows
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      const row = rows[i];
      if (row && row.length > 0) {
        console.log(`    Row ${i+1}:`, row.slice(0, 8).map(x => String(x).substring(0, 30)));
      }
    }
  });
}

const files = [
  path.join(__dirname, '../Staff and Event details - CARE.xlsx'),
  path.join(__dirname, '../H.Survey Master File - CARE.xlsx')
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    inspectFile(f);
  } else {
    console.log(`File not found: ${f}`);
  }
});
