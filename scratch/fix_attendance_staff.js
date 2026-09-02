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

const filterLogic = `                  {/* --- ATTENDANCE TABS CONTENT --- */}
                  {(() => {
                    const attendanceStaffList = staffList.filter(s => !(s.name || '').toLowerCase().includes('regin mary'));
                    return (
                      <>
`;

const filterLogicEnd = `                      </>
                    );
                  })()}
`;

// Insert the wrapper around the tabs content
const wrapperTarget = `                  {attendanceSubTab === 'date_wise' && (`;
const wrapperReplace = `                  {(() => {
                    const attendanceStaffList = staffList.filter(s => !(s.name || '').toLowerCase().includes('regin mary'));
                    return (
                      <>
                  {attendanceSubTab === 'date_wise' && (`

txt = txt.replace(wrapperTarget, wrapperReplace);

const endTarget = `                </div>
              )}

              {/* ===== SEA MEMBERS LOG ===== */}`;
const endReplace = `                        </>
                      );
                    })()}
                </div>
              )}

              {/* ===== SEA MEMBERS LOG ===== */}`;

txt = txt.replace(endTarget, endReplace);

// Now replace staffList with attendanceStaffList in the attendance section
// 1. Date wise (line 2696 originally)
const dateWiseTarget = `staffList.forEach(s => staffMap.set((s.email || '').toLowerCase(), { sno: s.sno, name: s.name, email: s.email, logs: {} }));`;
const dateWiseReplace = `attendanceStaffList.forEach(s => staffMap.set((s.email || '').toLowerCase(), { sno: s.sno, name: s.name, email: s.email, logs: {} }));`;
txt = txt.replace(dateWiseTarget, dateWiseReplace);

// 2. Monthly (line 2808 originally)
const monthlyTarget = `staffList.forEach(s => staffMap.set((s.email || s.name || '').toLowerCase(), { sno: s.sno, name: s.name, email: s.email, in: null, out: null }));`;
const monthlyReplace = `attendanceStaffList.forEach(s => staffMap.set((s.email || s.name || '').toLowerCase(), { sno: s.sno, name: s.name, email: s.email, in: null, out: null }));`;
txt = txt.replace(monthlyTarget, monthlyReplace);

// 3. Staff Wise (line 2952 originally)
const staffWiseTarget = `                    const allStaffOptions: any[] = [];
                    
                    staffList.forEach(s => {`;
const staffWiseReplace = `                    const allStaffOptions: any[] = [];
                    
                    attendanceStaffList.forEach(s => {`;
txt = txt.replace(staffWiseTarget, staffWiseReplace);

fs.writeFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', txt);
console.log('Updated staffList to attendanceStaffList in attendance tabs');
