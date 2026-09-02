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

const renderTarget = `{ccMeetingsLog.length === 0 ? (`;
const renderReplace = `{filteredCcMeetings.length === 0 ? (`;

let r2 = replaceRobust(txt, renderTarget, renderReplace);
if (r2 !== txt) console.log('Replaced cc logic 1'); else console.log('Failed cc logic 1');
txt = r2;

const mapTarget = `) : ccMeetingsLog.map((log, i) => (`;
const mapReplace = `) : filteredCcMeetings.map((log, i) => (`;

let r3 = replaceRobust(txt, mapTarget, mapReplace);
if (r3 !== txt) console.log('Replaced cc logic 2'); else console.log('Failed cc logic 2');
txt = r3;

fs.writeFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', txt);
