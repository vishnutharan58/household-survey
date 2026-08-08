const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../apps/web/src/pages/Admin/AdminDashboard.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Add state for event_reports
content = content.replace(
  /const \[detailedEvent, setDetailedEvent\] = useState<any \| null>\(null\);/,
  `const [detailedEvent, setDetailedEvent] = useState<any | null>(null);
  const [eventReportsList, setEventReportsList] = useState<any[]>([]);`
);

// 2. Fetch event_reports in loadData
const fetchReportsCode = `
        const { data: dbEventReports, error: evRepErr } = await supabase.from('event_reports').select('*');
        if (evRepErr) console.warn("Failed to fetch event reports:", evRepErr);
        else setEventReportsList(dbEventReports || []);
`;
content = content.replace(
  /const \{ data: dbSeaMembers \} = await supabase\.from\('sea_members_list'\)\.select\('\*'\);/,
  `const { data: dbSeaMembers } = await supabase.from('sea_members_list').select('*');\n${fetchReportsCode}`
);

// 3. Pass eventReportsList to EventDetailModal
content = content.replace(
  /event=\{detailedEvent\}\n\s*onClose=\{\(\) => setDetailedEvent\(null\)\}/,
  `event={detailedEvent}\n            reports={eventReportsList.filter((r: any) => r.event_id === detailedEvent.id)}\n            onClose={() => setDetailedEvent(null)}`
);

// 4. Update EventDetailModal props and UI
content = content.replace(
  /interface EventDetailModalProps \{\n\s*event: any;\n\s*onClose: \(\) => void;\n\s*\}/,
  `interface EventDetailModalProps {
    event: any;
    reports: any[];
    onClose: () => void;
  }`
);

content = content.replace(
  /function EventDetailModal\(\{ event, onClose \}: EventDetailModalProps\) \{/,
  `function EventDetailModal({ event, reports, onClose }: EventDetailModalProps) {`
);

const submissionsUI = `
              {reports && reports.length > 0 && (
                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '1rem', fontWeight: 800 }}>Staff Submissions</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {reports.map((report: any) => (
                      <div key={report.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{report.staff_email}</span>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(report.created_at).toLocaleDateString()}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem', color: '#475569' }}>
                          <div><strong style={{color:'#1e293b'}}>Date:</strong> {report.event_date || '-'}</div>
                          <div><strong style={{color:'#1e293b'}}>Place:</strong> {report.place || '-'}</div>
                          <div><strong style={{color:'#1e293b'}}>Time:</strong> {report.start_time || '-'} to {report.end_time || '-'}</div>
                          <div><strong style={{color:'#1e293b'}}>Participants:</strong> {report.achieved_participants || 0}</div>
                          <div style={{ gridColumn: '1 / -1' }}><strong style={{color:'#1e293b'}}>Resource Person:</strong> {report.resource_person || '-'}</div>
                        </div>
                        {report.images && report.images.length > 0 && (
                          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                            {report.images.map((img: string, idx: number) => (
                              <a key={idx} href={img} target="_blank" rel="noreferrer">
                                <img src={img} alt="submission" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
`;

content = content.replace(
  /\{\/\* Report Download Section \*\/\}/,
  submissionsUI + "\n              {/* Report Download Section */}"
);

fs.writeFileSync(targetFile, content, 'utf8');
console.log("Updated AdminDashboard.tsx successfully.");
