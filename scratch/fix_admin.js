const fs = require('fs');
let txt = fs.readFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', 'utf8');

// 1. Exclude 'Regin Mary' from Daily/Monthly/Date-Wise tables
const staffListAssignBad = `setStaffList(mappedStaff);`;
const staffListAssignGood = `setStaffList(mappedStaff.filter(s => s.name.toUpperCase() !== 'REGIN MARY'));`;
txt = txt.replace(staffListAssignBad, staffListAssignGood);

const localStaffAssignBad = `setStaffList(localStaff ? JSON.parse(localStaff) : INITIAL_STAFF_DETAILS);`;
const localStaffAssignGood = `setStaffList(localStaff ? JSON.parse(localStaff).filter(s => s.name.toUpperCase() !== 'REGIN MARY') : INITIAL_STAFF_DETAILS);`;
txt = txt.replace(localStaffAssignBad, localStaffAssignGood);

// Wait, the plan says: "Exclude Regin Mary: Add a filter condition (staff.name !== 'Regin Mary') when rendering the Daily Attendance and Monthly/Date-Wise tables"
// That means we don't remove her from staffList, we remove her from the attendance table renders ONLY.
// Let's undo that logic...
