const fs = require('fs');

function replaceRobust(txt, targetContent, replacementContent) {
  const normTxt = txt.replace(/\r\n/g, '\n');
  const normTarget = targetContent.replace(/\r\n/g, '\n');
  
  if (normTxt.includes(normTarget)) {
    return normTxt.replace(normTarget, replacementContent.replace(/\r\n/g, '\n'));
  }
  return txt;
}

let txt = fs.readFileSync('apps/web/src/pages/Staff/StaffDashboard.tsx', 'utf8');

const saveTarget = `      const { error: logError } = await supabase.from('cc_meetings_log').insert([{
        collective_id: cc.id,
        collective_name: cc.name,
        staff_email: user?.email,
        meeting_date: dateStr,
        participants_added: participantsAdded
      }]);`;

const saveReplace = `      const { error: logError } = await supabase.from('cc_meetings_log').insert([{
        collective_id: cc.id,
        collective_name: cc.name,
        staff_email: user?.email,
        meeting_date: dateStr,
        participants_added: participantsAdded,
        start_date: ccFormData.start_date,
        end_date: ccFormData.end_date,
        village: ccFormData.village
      }]);`;

let r1 = replaceRobust(txt, saveTarget, saveReplace);
if (r1 !== txt) console.log('Replaced save logic'); else console.log('Failed save logic');
txt = r1;

const uiTarget = `                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Membership Count</label>`;

const uiReplace = `                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Start Date</label>
                      <input type="date" value={ccFormData.start_date} onChange={e => setCcFormData({...ccFormData, start_date: e.target.value})} style={{ padding: '10px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>End Date</label>
                      <input type="date" value={ccFormData.end_date} onChange={e => setCcFormData({...ccFormData, end_date: e.target.value})} style={{ padding: '10px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '16px', marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Village</label>
                    <select value={ccFormData.village} onChange={e => setCcFormData({...ccFormData, village: e.target.value})} style={{ padding: '10px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', background: 'white' }}>
                      <option value="">Select Village</option>
                      <option value="Agasteeswaram">Agasteeswaram</option>
                      <option value="Thovalai">Thovalai</option>
                      <option value="Kalkulam">Kalkulam</option>
                      <option value="Vilavancode">Vilavancode</option>
                      <option value="Killiyoor">Killiyoor</option>
                      <option value="Thiruvattar">Thiruvattar</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Membership Count</label>`;

let r2 = replaceRobust(txt, uiTarget, uiReplace);
if (r2 !== txt) console.log('Replaced UI'); else console.log('Failed UI logic');
txt = r2;

fs.writeFileSync('apps/web/src/pages/Staff/StaffDashboard.tsx', txt);
