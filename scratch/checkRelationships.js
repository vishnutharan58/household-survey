const XLSX = require('xlsx');
const path = require('path');

// Load the workbook
const wb = XLSX.readFile('d:/HOUSEHOLDSURVEY/HOUSEHOLD_SURVEY.xlsx');
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

const relCounts = {};

data.forEach((row, i) => {
  // Let's find the relationship column
  // Let's search for keys containing 'rel'
  const relKey = Object.keys(row).find(k => k.toLowerCase().includes('relation'));
  if (relKey) {
    const val = row[relKey];
    relCounts[val] = (relCounts[val] || 0) + 1;
  }
});

console.log('Unique Relationship values in Excel:', relCounts);
