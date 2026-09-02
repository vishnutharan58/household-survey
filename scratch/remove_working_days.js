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

const target1 = `<div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem', marginTop: '10px' }}>
                          Total Working Days: 
                        </div>`;
const replace1 = ``;

txt = replaceRobust(txt, target1, replace1);

fs.writeFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', txt);
console.log('Removed Total Working Days');
