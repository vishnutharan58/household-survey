const fs = require('fs');
let txt = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8');

// Regex to find the block
// Replace the exact buggy logic in attendanceList.forEach
// We'll replace the body of attendanceList.forEach for both staffMap (Monthly and Date-wise) and allStaffKeys (Staff-wise)

const monthlyRegex = /let keyFound = null;[\s\S]*?if \(!staffMap\.has\(finalKey\)\) \{/g;
const monthlyGood = `const logEmail = (log.email || '').toLowerCase();
                          const logNamePrefix = logEmail.split('@')[0];
                          
                          let keyFound = null;
                          if (logEmail && staffMap.has(logEmail)) {
                            keyFound = logEmail;
                          } else {
                            const sName = (log.staff_name || '').toLowerCase();
                            const entry = Array.from(staffMap.entries()).find(([k, v]) => {
                              const vName = (v.name || '').toLowerCase();
                              if (logNamePrefix && vName.includes(logNamePrefix)) return true;
                              if (sName && (vName === sName || vName.includes(sName) || sName.includes(vName))) return true;
                              return false;
                            });
                            if (entry) keyFound = entry[0];
                          }
                          
                          const finalKey = keyFound || logEmail || (log.staff_name || '').toLowerCase();
                          
                          if (!staffMap.has(finalKey)) {`;

txt = txt.replace(monthlyRegex, monthlyGood);

const staffWiseRegex = /let keyFound = null;[\s\S]*?if \(!allStaffKeys\.has\(finalKey\)\) \{/g;
const staffWiseGood = `const logEmail = (log.email || '').toLowerCase();
                      const logNamePrefix = logEmail.split('@')[0];
                      
                      let keyFound = null;
                      if (logEmail && allStaffKeys.has(logEmail)) {
                         keyFound = logEmail;
                      } else {
                         const sName = (log.staff_name || '').toLowerCase();
                         const entry = allStaffOptions.find(o => {
                           const oName = (o.name || '').toLowerCase();
                           if (logNamePrefix && oName.includes(logNamePrefix)) return true;
                           if (sName && (oName === sName || oName.includes(sName) || sName.includes(oName))) return true;
                           return false;
                         });
                         if (entry) keyFound = entry.filterKey;
                      }
                      
                      const finalKey = keyFound || logEmail || (log.staff_name || '').toLowerCase();
                      
                      if (!allStaffKeys.has(finalKey)) {`;

txt = txt.replace(staffWiseRegex, staffWiseGood);

fs.writeFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', txt);
console.log('Replaced using regex.');
