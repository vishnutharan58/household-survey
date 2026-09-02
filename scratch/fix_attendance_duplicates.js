const fs = require('fs');
let txt = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8');

// Replacement 1: Monthly Report
const monthlyBad = `                        attendanceList.forEach(log => {
                          if (!log.email) return;
                          const emailKey = log.email.toLowerCase();
                          // Ensure they are in the map even if not in staffList
                          if (!staffMap.has(emailKey)) {
                            staffMap.set(emailKey, { sno: staffMap.size + 1, name: log.email.split('@')[0], email: log.email, logs: {} });
                          }
                          const date = new Date(log.login_time || log.loginTime);
                          if (date.getMonth() === m && date.getFullYear() === y) {
                            const d = date.getDate();
                            staffMap.get(emailKey).logs[d] = true;
                          }
                        });`;
const monthlyGood = `                        attendanceList.forEach(log => {
                          if (!log.email && !log.staff_name) return;
                          
                          let keyFound = null;
                          if (log.email && staffMap.has(log.email.toLowerCase())) {
                            keyFound = log.email.toLowerCase();
                          } else if (log.staff_name) {
                            const nameLower = log.staff_name.toLowerCase();
                            const entry = Array.from(staffMap.entries()).find(([k, v]) => v.name.toLowerCase() === nameLower || v.name.toLowerCase().includes(nameLower) || nameLower.includes(v.name.toLowerCase()));
                            if (entry) keyFound = entry[0];
                          }
                          
                          const finalKey = keyFound || (log.email ? log.email.toLowerCase() : (log.staff_name || '').toLowerCase());
                          
                          if (!staffMap.has(finalKey)) {
                            staffMap.set(finalKey, { sno: staffMap.size + 1, name: log.staff_name || (log.email ? log.email.split('@')[0] : 'Unknown'), email: log.email || '', logs: {} });
                          }
                          const date = new Date(log.login_time || log.loginTime);
                          if (date.getMonth() === m && date.getFullYear() === y) {
                            const d = date.getDate();
                            staffMap.get(finalKey).logs[d] = true;
                          }
                        });`;
txt = txt.replace(monthlyBad, monthlyGood);


// Replacement 2: Date Wise Report
const datewiseBad = `                        attendanceList.forEach(log => {
                          if (!log.email) return;
                          const emailKey = log.email.toLowerCase();
                          if (!staffMap.has(emailKey)) {
                            staffMap.set(emailKey, { sno: staffMap.size + 1, name: log.email.split('@')[0], email: log.email, in: null, out: null });
                          }
                          const date = new Date(log.login_time || log.loginTime);
                          if (date.toDateString() === selDate.toDateString()) {
                            staffMap.get(emailKey).in = new Date(log.login_time || log.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            if (log.logout_time || log.logoutTime) {
                              staffMap.get(emailKey).out = new Date(log.logout_time || log.logoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            }
                          }
                        });`;
const datewiseGood = `                        attendanceList.forEach(log => {
                          if (!log.email && !log.staff_name) return;
                          
                          let keyFound = null;
                          if (log.email && staffMap.has(log.email.toLowerCase())) {
                            keyFound = log.email.toLowerCase();
                          } else if (log.staff_name) {
                            const nameLower = log.staff_name.toLowerCase();
                            const entry = Array.from(staffMap.entries()).find(([k, v]) => v.name.toLowerCase() === nameLower || v.name.toLowerCase().includes(nameLower) || nameLower.includes(v.name.toLowerCase()));
                            if (entry) keyFound = entry[0];
                          }
                          
                          const finalKey = keyFound || (log.email ? log.email.toLowerCase() : (log.staff_name || '').toLowerCase());
                          
                          if (!staffMap.has(finalKey)) {
                            staffMap.set(finalKey, { sno: staffMap.size + 1, name: log.staff_name || (log.email ? log.email.split('@')[0] : 'Unknown'), email: log.email || '', in: null, out: null });
                          }
                          const date = new Date(log.login_time || log.loginTime);
                          if (date.toDateString() === selDate.toDateString()) {
                            staffMap.get(finalKey).in = new Date(log.login_time || log.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            if (log.logout_time || log.logoutTime) {
                              staffMap.get(finalKey).out = new Date(log.logout_time || log.logoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            }
                          }
                        });`;
txt = txt.replace(datewiseBad, datewiseGood);


// Replacement 3: Staff options filter list
const staffListBad = `                    attendanceList.forEach(log => {
                      if (log.email && !allStaffKeys.has(log.email.toLowerCase())) {
                        allStaffKeys.add(log.email.toLowerCase());
                        allStaffOptions.push({ email: log.email, name: log.email.split('@')[0], filterKey: log.email.toLowerCase() });
                      }
                    });`;
const staffListGood = `                    attendanceList.forEach(log => {
                      if (!log.email && !log.staff_name) return;
                      let keyFound = null;
                      if (log.email && allStaffKeys.has(log.email.toLowerCase())) {
                         keyFound = log.email.toLowerCase();
                      } else if (log.staff_name) {
                         const nameLower = log.staff_name.toLowerCase();
                         const entry = allStaffOptions.find(o => o.name.toLowerCase() === nameLower || o.name.toLowerCase().includes(nameLower) || nameLower.includes(o.name.toLowerCase()));
                         if (entry) keyFound = entry.filterKey;
                      }
                      const finalKey = keyFound || (log.email ? log.email.toLowerCase() : (log.staff_name || '').toLowerCase());
                      
                      if (!allStaffKeys.has(finalKey)) {
                        allStaffKeys.add(finalKey);
                        allStaffOptions.push({ email: log.email || '', name: log.staff_name || (log.email ? log.email.split('@')[0] : 'Unknown'), filterKey: finalKey });
                      }
                    });`;
txt = txt.replace(staffListBad, staffListGood);


fs.writeFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', txt);
console.log('Done replacement');
