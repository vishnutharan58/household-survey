const XLSX = require('xlsx');
const path = require('path');

const filepath = path.join(__dirname, '../HOUSEHOLD_SURVEY.xlsx');
const workbook = XLSX.readFile(filepath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { range: 1 });

console.log(`Total rows parsed: ${rows.length}`);

let totalBplIndividuals = 0;
const uniqueHouseholds = new Set();
const bplHouseholds = new Set();
const statusCounts = {};

rows.forEach((row, i) => {
  const status = String(row['ECONOMIC STATUS'] || '').trim().toUpperCase();
  const hhNum = String(row['HOUSE HOLD  NUMBER'] || '').trim();

  if (hhNum) {
    uniqueHouseholds.add(hhNum);
  }

  if (status) {
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  }

  if (status === 'BPL') {
    totalBplIndividuals++;
    if (hhNum) {
      bplHouseholds.add(hhNum);
    }
  }
});

console.log("\n=== ECONOMIC STATUS ANALYSIS ===");
console.log(`Total unique households in Excel: ${uniqueHouseholds.size}`);
console.log(`Total rows (individuals) in Excel: ${rows.length}`);
console.log(`\nRaw Status Counts (for individuals):`, statusCounts);
console.log(`\nTotal BPL Individuals (Rows): ${totalBplIndividuals}`);
console.log(`Total BPL Households (Unique HH Numbers): ${bplHouseholds.size}`);
