const fs = require('fs');

const path = 'd:\\HOUSEHOLDSURVEY\\apps\\web\\src\\pages\\Admin\\AdminDashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// The exact strings to replace
const modalOuterStart = `<div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', padding: '20px' }}>`;
const modalOuterReplace = `<div onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', padding: '20px' }}>`;

const modalInnerStart = `<div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px' }}>`;
const modalInnerReplace = `<div onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px' }}>`;

if(content.includes(modalOuterStart)) {
  content = content.replace(modalOuterStart, modalOuterReplace);
}

if(content.includes(modalInnerStart)) {
  content = content.replace(modalInnerStart, modalInnerReplace);
}

fs.writeFileSync(path, content, 'utf8');
console.log("AdminDashboard.tsx successfully updated with stopPropagation!");
