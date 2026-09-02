const fs = require('fs');

function replaceRobust(txt, targetContent, replacementContent) {
  const normTxt = txt.replace(/\r\n/g, '\n');
  const normTarget = targetContent.replace(/\r\n/g, '\n');
  
  if (normTxt.includes(normTarget)) {
    return normTxt.replace(normTarget, replacementContent.replace(/\r\n/g, '\n'));
  }
  return txt;
}

let txt = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8');

const targetStr = `  const getFilteredEvents = () => {`;
const insertText = `  const getFilteredCcMeetings = () => {
    let filtered = ccMeetingsLog;
    if (ccSubTab === 'month' || ccSubTab === 'year') {
      if (ccYearFilter) {
        filtered = filtered.filter(l => l.meeting_date && l.meeting_date.startsWith(ccYearFilter));
      }
      if (ccSubTab === 'month' && ccMonthFilter) {
        const monthStr = ccMonthFilter.padStart(2, '0');
        filtered = filtered.filter(l => l.meeting_date && l.meeting_date.includes('-' + monthStr + '-'));
      }
    } else if (ccSubTab === 'staff') {
      if (ccStaffFilter && ccStaffFilter !== 'all') {
        const staffObj = staffList.find(s => s.id === ccStaffFilter);
        if (staffObj) {
          filtered = filtered.filter(l => l.staff_email === staffObj.email);
        }
      }
    }
    return filtered;
  };

  const filteredCcMeetings = getFilteredCcMeetings();

  const getFilteredEvents = () => {`;

const newTxt = replaceRobust(txt, targetStr, insertText);
if (newTxt !== txt) {
  fs.writeFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', newTxt);
  console.log('Inserted filteredCcMeetings definition');
} else {
  console.log('Failed to insert definition');
}
