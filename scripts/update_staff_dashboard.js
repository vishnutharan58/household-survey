const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../apps/web/src/pages/Staff/StaffDashboard.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Add lucide-react icon `Award`
content = content.replace(
  /Trash2 } from 'lucide-react';/,
  "Trash2, Award, Upload, Image } from 'lucide-react';"
);

// 2. Add Event states after `loadingCc`
const eventStates = `  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [eventFormData, setEventFormData] = useState({
    achieved_participants: '',
    event_date: '',
    place: '',
    start_time: '',
    end_time: '',
    resource_person: '',
    images: [] as string[]
  });
  const [eventUploading, setEventUploading] = useState(false);

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const supabase = getSupabase() as any;
      const { data } = await supabase.from('events').select('id, activity, sno').order('sno', { ascending: true });
      if (data) setEventsList(data);
    } catch (err) {
      console.error(err);
    }
    setLoadingEvents(false);
  };

  const handleEventImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setEventUploading(true);
    const supabase = getSupabase() as any;
    
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = \`\${Math.random()}-\${Date.now()}.\${fileExt}\`;
        const filePath = \`staff-uploads/\${fileName}\`;
        
        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage
          .from('event-images')
          .getPublicUrl(filePath);
          
        return data.publicUrl;
      } catch (err) {
        console.warn("Upload failed:", err);
        return null;
      }
    });

    const urls = (await Promise.all(uploadPromises)).filter(Boolean) as string[];
    setEventFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
    setEventUploading(false);
  };

  const handleSubmitEventReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) {
      alert("Please select an event");
      return;
    }
    
    try {
      const supabase = getSupabase() as any;
      const { error } = await supabase.from('event_reports').insert([{
        event_id: selectedEventId,
        staff_email: user?.email || '',
        achieved_participants: parseInt(eventFormData.achieved_participants) || 0,
        event_date: eventFormData.event_date || null,
        start_time: eventFormData.start_time,
        end_time: eventFormData.end_time,
        place: eventFormData.place,
        resource_person: eventFormData.resource_person,
        images: eventFormData.images
      }]);
      
      if (error) throw error;
      alert("Event details submitted successfully!");
      setIsEventModalOpen(false);
      setEventFormData({ achieved_participants: '', event_date: '', place: '', start_time: '', end_time: '', resource_person: '', images: [] });
      setSelectedEventId('');
    } catch(err) {
      console.error(err);
      alert("Failed to submit event details");
    }
  };
`;

content = content.replace(
  /const \[loadingCc, setLoadingCc\] = useState\(false\);\n/,
  `const [loadingCc, setLoadingCc] = useState(false);\n\n${eventStates}`
);


// 3. Add Quick Action Button
const quickActionBtn = `            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
              <button
                onClick={() => {
                  setIsEventModalOpen(true);
                  fetchEvents();
                }}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                  transition: 'all 0.2s ease',
                  flex: 1,
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Award size={18} />
                <span>Add Event Details</span>
              </button>
            </div>\n`;

content = content.replace(
  /<div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>\s*<button\s*onClick={\(\) => {\s*setIsCcModalOpen\(true\);/m,
  quickActionBtn + "            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>\n              <button\n                onClick={() => {\n                  setIsCcModalOpen(true);"
);

// 4. Add Modal UI
const modalUI = `
        {/* Events Modal */}
        {isEventModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '28px', maxWidth: '600px', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Add Event Details</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>Submit event details for assigned activities</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEventModalOpen(false)}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitEventReport} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Select Event</label>
                  <select 
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  >
                    <option value="">-- Select Event --</option>
                    {eventsList.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.sno} - {ev.activity}</option>
                    ))}
                  </select>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Number of Participants</label>
                    <input type="number" required value={eventFormData.achieved_participants} onChange={e => setEventFormData({...eventFormData, achieved_participants: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Event Date</label>
                    <input type="date" required value={eventFormData.event_date} onChange={e => setEventFormData({...eventFormData, event_date: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Start Time</label>
                    <input type="time" required value={eventFormData.start_time} onChange={e => setEventFormData({...eventFormData, start_time: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>End Time</label>
                    <input type="time" required value={eventFormData.end_time} onChange={e => setEventFormData({...eventFormData, end_time: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Place</label>
                  <input type="text" required value={eventFormData.place} onChange={e => setEventFormData({...eventFormData, place: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="E.g. Community Hall" />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Resource Person</label>
                  <input type="text" required value={eventFormData.resource_person} onChange={e => setEventFormData({...eventFormData, resource_person: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="E.g. Dr. John Doe" />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Add Images</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}>
                      <Upload size={16} /> Upload Image
                      <input type="file" multiple accept="image/*" onChange={handleEventImageUpload} style={{ display: 'none' }} />
                    </label>
                    {eventUploading && <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>Uploading...</span>}
                  </div>
                  {eventFormData.images.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                      {eventFormData.images.map((url, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          <img src={url} alt="upload" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                          <button
                            type="button"
                            onClick={() => setEventFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                            style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'white', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="button" onClick={() => setIsEventModalOpen(false)} style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,0.4)' }}>Submit Details</button>
                </div>
              </form>
            </div>
          </div>
        )}
`;

content = content.replace(
  /\{\/\* CC Meetings Modal \*\/\}/,
  modalUI + "\n        {/* CC Meetings Modal */}"
);

fs.writeFileSync(targetFile, content, 'utf8');
console.log("Updated StaffDashboard.tsx successfully.");
