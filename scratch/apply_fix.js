const fs = require('fs');
let txt = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8');

const badLogic = `                          let keyFound = null;
                          if (log.email && staffMap.has(log.email.toLowerCase())) {
                            keyFound = log.email.toLowerCase();
                          } else if (log.staff_name) {
                            const nameLower = log.staff_name.toLowerCase();
                            const entry = Array.from(staffMap.entries()).find(([k, v]) => v.name.toLowerCase() === nameLower || v.name.toLowerCase().includes(nameLower) || nameLower.includes(v.name.toLowerCase()));
                            if (entry) keyFound = entry[0];
                          }
                          
                          const finalKey = keyFound || (log.email ? log.email.toLowerCase() : (log.staff_name || '').toLowerCase());`;

const goodLogic = `                          const logEmail = (log.email || '').toLowerCase();
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
                          
                          const finalKey = keyFound || logEmail || (log.staff_name || '').toLowerCase();`;

// Replace in Date Wise and Monthly reports
txt = txt.split(badLogic).join(goodLogic);


// For Staff Wise Report, the logic uses allStaffKeys and allStaffOptions
const staffWiseBadLogic = `                      let keyFound = null;
                      if (log.email && allStaffKeys.has(log.email.toLowerCase())) {
                         keyFound = log.email.toLowerCase();
                      } else if (log.staff_name) {
                         const nameLower = log.staff_name.toLowerCase();
                         const entry = allStaffOptions.find(o => o.name.toLowerCase() === nameLower || o.name.toLowerCase().includes(nameLower) || nameLower.includes(o.name.toLowerCase()));
                         if (entry) keyFound = entry.filterKey;
                      }
                      const finalKey = keyFound || (log.email ? log.email.toLowerCase() : (log.staff_name || '').toLowerCase());`;

const staffWiseGoodLogic = `                      const logEmail = (log.email || '').toLowerCase();
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
                      
                      const finalKey = keyFound || logEmail || (log.staff_name || '').toLowerCase();`;

txt = txt.split(staffWiseBadLogic).join(staffWiseGoodLogic);

fs.writeFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', txt);
console.log('Replaced occurrences.');
