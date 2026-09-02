const fs = require('fs');
let txt = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8');

function replaceDates(txt) {
  txt = txt.replace(/{log.meeting_date}/g, '{formatDateDDMMYYYY(log.meeting_date)}');
  txt = txt.replace(/{log\.start_date\s*\|\|\s*'—'}/g, "{log.start_date ? formatDateDDMMYYYY(log.start_date) : '—'}");
  txt = txt.replace(/{log\.end_date\s*\|\|\s*'—'}/g, "{log.end_date ? formatDateDDMMYYYY(log.end_date) : '—'}");
  return txt;
}

const newTxt = replaceDates(txt);
if (newTxt !== txt) {
  fs.writeFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', newTxt);
  console.log('Updated dates in AdminDashboard');
} else {
  console.log('No dates to update');
}
