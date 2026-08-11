const XLSX = require('xlsx');
const path = require('path');

const filepath = path.join(__dirname, '../Staff and Event details - CARE.xlsx');
const workbook = XLSX.readFile(filepath);

console.log("=== STAFF DETAILS SHEET ===");
const staffSheet = workbook.Sheets['STAFF DETAILS'];
const staffRows = XLSX.utils.sheet_to_json(staffSheet);
console.log(JSON.stringify(staffRows, null, 2));

console.log("=== EVENTS - CARE SHEET ===");
const eventsSheet = workbook.Sheets['EVENTS - CARE'];
const eventsRows = XLSX.utils.sheet_to_json(eventsSheet);
console.log(JSON.stringify(eventsRows, null, 2));
