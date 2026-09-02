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

const target = `                                    {days.map(d => {
                                      const isSunday = new Date(y, m, d).getDay() === 0;
                                      const isPresent = s.logs[d];
                                      let cellText = isSunday ? 'S' : (isPresent ? 'X' : 'A');
                                      let color = isSunday ? '#eab308' : (isPresent ? '#22c55e' : '#ef4444');
                                      return (
                                        <td key={d} style={{ padding: '8px 4px', borderRight: '1px solid #94a3b8', fontWeight: 800, color: color }}>
                                          {cellText}
                                        </td>
                                      );
                                    })}`;
                                    
const replace = `                                    {days.map(d => {
                                      const currentDateStr = \`\${y}-\${(m+1).toString().padStart(2, '0')}-\${d.toString().padStart(2, '0')}\`;
                                      const holiday = holidays.find(h => h.holiday_date === currentDateStr);
                                      const isHoliday = !!holiday;
                                      const isSunday = new Date(y, m, d).getDay() === 0;
                                      const isPresent = s.logs[d];
                                      let cellText = isHoliday ? 'H' : isSunday ? 'S' : (isPresent ? 'X' : 'A');
                                      let color = isHoliday ? '#3b82f6' : isSunday ? '#eab308' : (isPresent ? '#22c55e' : '#ef4444');
                                      let bgColor = isHoliday ? '#eff6ff' : 'transparent';
                                      return (
                                        <td key={d} style={{ padding: '8px 4px', borderRight: '1px solid #94a3b8', fontWeight: 800, color: color, background: bgColor }} title={isHoliday ? holiday.description : ''}>
                                          {cellText}
                                        </td>
                                      );
                                    })}`;

let result = replaceRobust(txt, target, replace);
fs.writeFileSync('apps/web/src/pages/Admin/AdminDashboard.tsx', result);
console.log('Replaced cell logic');
