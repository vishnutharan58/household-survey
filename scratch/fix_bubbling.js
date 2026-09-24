const fs = require('fs');
const path = 'apps/web/src/pages/Admin/AdminDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `backdropFilter: 'blur(10px)', padding: '20px' }} onClick={onClose}>`;
const replaceStr = `backdropFilter: 'blur(10px)', padding: '20px' }} onClick={(e) => { e.stopPropagation(); onClose(); }}>`;

let occurrences = content.split(targetStr).length - 1;
content = content.replaceAll(targetStr, replaceStr);

console.log(`Replaced ${occurrences} occurrences in AdminDashboard.tsx`);

fs.writeFileSync(path, content, 'utf8');
