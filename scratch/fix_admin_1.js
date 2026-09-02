const fs = require('fs');
let txt = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8');

// 1. Exclude Regin Mary
txt = txt.replace(/const tableStaff = Array\.from\(staffMap\.values\(\)\)\.sort\(\(a, b\) => a\.sno - b\.sno\);/g, 
  "const tableStaff = Array.from(staffMap.values()).filter((s: any) => s.name.toUpperCase().trim() !== 'REGIN MARY').sort((a, b) => a.sno - b.sno);");

// allStaffOptions filtering for Staff Wise report
const allStaffOptionsMatch = `const allStaffOptions = Array.from(allStaffKeys).map(key => {
                        const s = staffMap.get(key);`;
const allStaffOptionsReplacement = `const allStaffOptions = Array.from(allStaffKeys).map(key => {
                        const s = staffMap.get(key);
                      }).filter(s => s && s.name && s.name.toUpperCase().trim() !== 'REGIN MARY').filter(Boolean); // Temporary fix, let's do a better replace below`;
// Wait, the above is messy. I will use exact string replace for allStaffOptions
let allStaffBlockOld = `                      const allStaffOptions = Array.from(allStaffKeys).map(key => {
                        const s = staffMap.get(key);
                        if (s) return { filterKey: key, ...s };
                        return { filterKey: key, name: key.split('@')[0], logs: {} };
                      }).sort((a: any, b: any) => (a.sno || 999) - (b.sno || 999));`;

let allStaffBlockNew = `                      const allStaffOptions = Array.from(allStaffKeys).map(key => {
                        const s = staffMap.get(key);
                        if (s) return { filterKey: key, ...s };
                        return { filterKey: key, name: key.split('@')[0], logs: {} };
                      }).filter((s: any) => s.name.toUpperCase().trim() !== 'REGIN MARY').sort((a: any, b: any) => (a.sno || 999) - (b.sno || 999));`;

txt = txt.replace(allStaffBlockOld, allStaffBlockNew);

// 2. Remove Total Working Days
const totalWorkingDaysStr = `<div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem', marginTop: '10px' }}>
                          Total Working Days: 
                        </div>`;
txt = txt.replace(new RegExp(totalWorkingDaysStr.replace(/[.*+?^$\{key\}()|[\\]\\\\]/g, '\\\\$&'), 'g'), '');
const totalWorkingDaysStr2 = `<div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem', marginTop: '10px' }}>
                          Total Working Days:
                        </div>`;
txt = txt.replace(new RegExp(totalWorkingDaysStr2.replace(/[.*+?^$\{key\}()|[\\]\\\\]/g, '\\\\$&'), 'g'), '');


// 3. Overview Dashboard Fetch from Supabase
const overviewSignatureOld = `function OverviewTab({ stats, loading, onExport, surveys, exporting }: { stats: any, loading: boolean, onExport: (type: "weekly" | "monthly" | "all") => void, surveys: DraftSurvey[], exporting: boolean }) {`;
const overviewSignatureNew = `function OverviewTab({ stats, loading, onExport, surveys, exporting, attendanceLogs = [] }: { stats: any, loading: boolean, onExport: (type: "weekly" | "monthly" | "all") => void, surveys: DraftSurvey[], exporting: boolean, attendanceLogs?: any[] }) {`;
txt = txt.replace(overviewSignatureOld, overviewSignatureNew);

const overviewRenderOld = `{activeTab === 'overview'    && <OverviewTab stats={dashboardStats} loading={loadingStats} onExport={exportData} surveys={submittedSurveys} exporting={exporting} />}`;
const overviewRenderNew = `{activeTab === 'overview'    && <OverviewTab stats={dashboardStats} loading={loadingStats} onExport={exportData} surveys={submittedSurveys} exporting={exporting} attendanceLogs={attendanceList} />}`;
txt = txt.replace(overviewRenderOld, overviewRenderNew);

const overviewLogsOld = `  const todayStr = new Date().toISOString().split('T')[0];
  let activeAttendanceToday = 0;
  try {
    const localLogs = localStorage.getItem('care_attendance_logs');
    if (localLogs) {
      const logs = JSON.parse(localLogs);
      const today = new Date().toISOString().split('T')[0];
      const uniqueCheckedInToday = new Set();
      logs.forEach((log: any) => {
        if (log.staff_name === 'Regin Mary') return;
        if (log.login_time && log.login_time.startsWith(today)) uniqueCheckedInToday.add(log.staff_id);
      });
      activeAttendanceToday = uniqueCheckedInToday.size;
    }
  } catch(e) {}`;

const overviewLogsNew = `  const todayStr = new Date().toISOString().split('T')[0];
  let activeAttendanceToday = 0;
  try {
    const today = new Date().toISOString().split('T')[0];
    const uniqueCheckedInToday = new Set();
    attendanceLogs.forEach((log: any) => {
      const logName = (log.staff_name || '').toUpperCase().trim();
      if (logName === 'REGIN MARY') return;
      if (log.login_time && log.login_time.startsWith(today)) {
        uniqueCheckedInToday.add(log.email || log.staff_name);
      }
    });
    activeAttendanceToday = uniqueCheckedInToday.size;
  } catch(e) {}`;

txt = txt.replace(overviewLogsOld, overviewLogsNew);

fs.writeFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', txt);
console.log('Done script 1');
