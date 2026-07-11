import { useState, useEffect } from 'react';
import { useAuthStore, useDraftStore, useEditRequestStore, fetchAdminSurveys, fetchDashboardStats, fetchSurveyDetail, getSupabase } from '@pro-vision-care/shared';
import type { DraftSurvey } from '@pro-vision-care/shared';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Download, Users, Home, AlertTriangle, TrendingUp,
  LayoutDashboard, ClipboardList, Search, Eye, X, MapPin,
  CalendarDays, User2, FileCheck2, ChevronDown, ChevronUp,
  Pencil, CheckCheck, XCircle, Clock, Bell, ChevronLeft, ChevronRight,
  PlusCircle, Trash2, UploadCloud
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import * as XLSX from 'xlsx';

// ─── Chart Colors ────────────────────────────────────────────────
const COLORS = ['#1B3A5C', '#2A9D8F', '#FFB703', '#E76F51', '#8b5cf6', '#3b82f6'];

// ─── CARE Staff and Event dataset ────────────────────────────────
const STAFF_DETAILS = [
  {
    sno: 1,
    name: "REGIN MARY",
    bloodGroup: "B+",
    qualification: "M.S.W, B.Ed, M.A",
    phone: "9443728367",
    designation: "Executive Director",
    experience: "—",
    email: "reginmary08@gmail.com"
  },
  {
    sno: 2,
    name: "BENIT SHINY E",
    bloodGroup: "A1+",
    qualification: "M.A, B.Ed, M.S.W",
    phone: "7598088250",
    designation: "Project Manager",
    experience: "5 years",
    email: "shinybenit77@gmail.com"
  },
  {
    sno: 3,
    name: "BENISHA",
    bloodGroup: "0+",
    qualification: "M.Com, MBA",
    phone: "6385774471",
    designation: "Finance Manager",
    experience: "—",
    email: "benisharaj7@gmail.com"
  },
  {
    sno: 4,
    name: "ANISHA P",
    bloodGroup: "A1+",
    qualification: "B.E",
    phone: "8778634689",
    designation: "MIS",
    experience: "—",
    email: "anishasha0493@gmail.com"
  },
  {
    sno: 5,
    name: "SUGANYA D",
    bloodGroup: "B+",
    qualification: "B.Com",
    phone: "9080534735",
    designation: "Community Organizer",
    experience: "—",
    email: "vv6569568@gmail.com"
  },
  {
    sno: 6,
    name: "FREEDA A",
    bloodGroup: "B+",
    qualification: "GNM",
    phone: "9486320020",
    designation: "Community Organizer",
    experience: "—",
    email: "freedastarjanfreedastarjan6@gmail.com"
  },
  {
    sno: 7,
    name: "BERDINA",
    bloodGroup: "0+",
    qualification: "B.A, B.Ed",
    phone: "9659492732",
    designation: "Community Organizer",
    experience: "—",
    email: "aguvino@gmail.com"
  },
  {
    sno: 8,
    name: "SAHAYA FERNISHA P",
    bloodGroup: "A+",
    qualification: "B.C.A",
    phone: "9043118227",
    designation: "Community Organizer",
    experience: "—",
    email: "Nofiabiferni@gmail.com"
  },
  {
    sno: 9,
    name: "RAKSHA",
    bloodGroup: "B+",
    qualification: "Dt.Ed, B.A",
    phone: "8825770973",
    designation: "Community Organizer",
    experience: "—",
    email: "ifanaadvika@gmail.com"
  }
];

const EVENT_DETAILS = [
  {
    sno: "1.1",
    activity: "Baseline Study and Line Listing",
    plannedPrograms: 1,
    plannedParticipants: 6000,
    achievedPrograms: 1,
    achievedParticipants: 6528
  },
  {
    sno: "1.2",
    activity: "Formation of Community Collectives",
    plannedPrograms: 30,
    plannedParticipants: null,
    achievedPrograms: 8,
    achievedParticipants: null
  },
  {
    sno: "1.3",
    activity: "Monthly Meeting of Community Collectives",
    plannedPrograms: 900,
    plannedParticipants: null,
    achievedPrograms: 13,
    achievedParticipants: null
  },
  {
    sno: "2.1",
    activity: "Training to Social Entitlement Animators",
    plannedPrograms: 12,
    plannedParticipants: 360,
    achievedPrograms: 0,
    achievedParticipants: 0
  },
  {
    sno: "2.2",
    activity: "Experience Sharing & Peer Learning Meeting",
    plannedPrograms: 3,
    plannedParticipants: null,
    achievedPrograms: 0,
    achievedParticipants: null
  },
  {
    sno: "3.1",
    activity: "Convergence with Existing Structures & Stakeholders",
    plannedPrograms: 18,
    plannedParticipants: null,
    achievedPrograms: 0,
    achievedParticipants: null
  },
  {
    sno: "3.2",
    activity: "Interface Meetings with Administrative Heads & Elected Representatives",
    plannedPrograms: 6,
    plannedParticipants: null,
    achievedPrograms: 0,
    achievedParticipants: null
  },
  {
    sno: "4.1",
    activity: "Hand Bills and Wall Painting",
    plannedPrograms: 3,
    plannedParticipants: null,
    achievedPrograms: 0,
    achievedParticipants: null
  },
  {
    sno: "4.2",
    activity: "Mass Community Awareness Event (Rally & People’s Assembly)",
    plannedPrograms: 2,
    plannedParticipants: null,
    achievedPrograms: 0,
    achievedParticipants: null
  },
  {
    sno: "4.3",
    activity: "Inclusive Social Entitlement Camps",
    plannedPrograms: 84,
    plannedParticipants: null,
    achievedPrograms: 0,
    achievedParticipants: null
  },
  {
    sno: "4.4",
    activity: "Disaster Response / Relief to Most Marginalised",
    plannedPrograms: 300,
    plannedParticipants: null,
    achievedPrograms: 0,
    achievedParticipants: null
  },
  {
    sno: "5.1",
    activity: "Staff Capacity Building Training",
    plannedPrograms: 8,
    plannedParticipants: null,
    achievedPrograms: 2,
    achievedParticipants: null
  },
  {
    sno: "5.2",
    activity: "Inter-State Staff Exposure Visit – Karnataka",
    plannedPrograms: 1,
    plannedParticipants: null,
    achievedPrograms: 0,
    achievedParticipants: null
  },
  {
    sno: "5.3",
    activity: "Staff Review & Planning Meeting",
    plannedPrograms: 36,
    plannedParticipants: null,
    achievedPrograms: 25,
    achievedParticipants: null
  }
];
// ─── Image Upload Utility with Base64 Fallback ──────────────────────
const uploadEventImage = async (file: File, eventId: string): Promise<string> => {
  try {
    const supabase = getSupabase() as any;
    const fileExt = file.name.split('.').pop();
    const filePath = `event-${eventId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  } catch (err) {
    console.warn("Supabase storage upload failed, falling back to Base64:", err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};

// ─── DB & UI Entity Mapping Helpers ─────────────────────────────────
const mapDbEventToUi = (db: any) => ({
  id: db.id,
  sno: db.sno,
  activity: db.activity,
  plannedPrograms: db.planned_programs,
  achievedPrograms: db.achieved_programs,
  plannedParticipants: db.planned_participants,
  achievedParticipants: db.achieved_participants,
  images: db.images || []
});

const mapUiEventToDb = (ui: any) => ({
  sno: ui.sno,
  activity: ui.activity,
  planned_programs: ui.plannedPrograms || 0,
  achieved_programs: ui.achievedPrograms || 0,
  planned_participants: ui.plannedParticipants || 0,
  achieved_participants: ui.achievedParticipants || 0,
  images: ui.images || []
});

// ─── Sub-Modal: EditEventModal ──────────────────────────────────────
interface EditEventModalProps {
  event: any | null;
  onClose: () => void;
  onSave: (data: any) => void;
}

function EditEventModal({ event, onClose, onSave }: EditEventModalProps) {
  const [sno, setSno] = useState(event?.sno || '');
  const [activity, setActivity] = useState(event?.activity || '');
  const [plannedPrograms, setPlannedPrograms] = useState(event?.plannedPrograms?.toString() || '0');
  const [achievedPrograms, setAchievedPrograms] = useState(event?.achievedPrograms?.toString() || '0');
  const [plannedParticipants, setPlannedParticipants] = useState(event?.plannedParticipants?.toString() || '');
  const [achievedParticipants, setAchievedParticipants] = useState(event?.achievedParticipants?.toString() || '');
  const [images, setImages] = useState<string[]>(event?.images || []);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const remainingSlots = 3 - images.length;
    if (remainingSlots <= 0) {
      alert("Maximum 3 images can be uploaded.");
      return;
    }

    setUploading(true);
    try {
      const newImages = [...images];
      const eventId = event?.id || 'temp-' + Date.now();
      
      const uploadCount = Math.min(files.length, remainingSlots);
      for (let i = 0; i < uploadCount; i++) {
        const url = await uploadEventImage(files[i], eventId);
        newImages.push(url);
      }
      setImages(newImages);
    } catch (err) {
      console.error("Failed to upload image:", err);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sno || !activity) {
      alert("Sl.no and Programme / Activity are required.");
      return;
    }
    
    onSave({
      ...event,
      sno,
      activity,
      plannedPrograms: parseInt(plannedPrograms, 10) || 0,
      achievedPrograms: parseInt(achievedPrograms, 10) || 0,
      plannedParticipants: plannedParticipants !== '' ? parseInt(plannedParticipants, 10) : null,
      achievedParticipants: achievedParticipants !== '' ? parseInt(achievedParticipants, 10) : null,
      images,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15,23,42,0.4)',
        backdropFilter: 'blur(10px)',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <form
        onSubmit={handleFormSubmit}
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'scaleInModal 200ms ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg,#1B3A5C,#2A9D8F)',
            padding: '18px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white',
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
            {event ? '📝 Edit Programme / Activity' : '➕ Add Programme / Activity'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', maxHeight: '70vh' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Sl. No</label>
              <input
                type="text"
                placeholder="1.1"
                value={sno}
                onChange={e => setSno(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px',
                  fontSize: '0.86rem', outline: 'none', background: '#f8fafc',
                }}
                onFocus={e => (e.target.style.borderColor = '#2A9D8F')}
                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Programme / Activity Name</label>
              <input
                type="text"
                placeholder="Enter event or activity description..."
                value={activity}
                onChange={e => setActivity(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px',
                  fontSize: '0.86rem', outline: 'none',
                }}
                onFocus={e => (e.target.style.borderColor = '#2A9D8F')}
                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Planned Programs</label>
              <input
                type="number"
                value={plannedPrograms}
                onChange={e => setPlannedPrograms(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px',
                  fontSize: '0.86rem', outline: 'none',
                }}
                onFocus={e => (e.target.style.borderColor = '#2A9D8F')}
                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Achieved Programs</label>
              <input
                type="number"
                value={achievedPrograms}
                onChange={e => setAchievedPrograms(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px',
                  fontSize: '0.86rem', outline: 'none',
                }}
                onFocus={e => (e.target.style.borderColor = '#2A9D8F')}
                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Planned Participants</label>
              <input
                type="number"
                placeholder="e.g. 6000 (optional)"
                value={plannedParticipants}
                onChange={e => setPlannedParticipants(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px',
                  fontSize: '0.86rem', outline: 'none',
                }}
                onFocus={e => (e.target.style.borderColor = '#2A9D8F')}
                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Achieved Participants</label>
              <input
                type="number"
                placeholder="e.g. 6528 (optional)"
                value={achievedParticipants}
                onChange={e => setAchievedParticipants(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px',
                  fontSize: '0.86rem', outline: 'none',
                }}
                onFocus={e => (e.target.style.borderColor = '#2A9D8F')}
                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>
          </div>

          {/* Image Upload Area */}
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Event Images (Max 3)
            </label>
            
            {/* Gallery of Uploaded Images */}
            {images.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                {images.map((url, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <img src={url} alt="Event" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      style={{
                        position: 'absolute', top: '4px', right: '4px',
                        background: 'rgba(239, 68, 68, 0.9)', color: 'white',
                        border: 'none', borderRadius: '50%',
                        width: '20px', height: '20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {images.length < 3 && (
              <div style={{ position: 'relative' }}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                  id="event-image-input"
                />
                <label
                  htmlFor="event-image-input"
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '20px', border: '2px dashed #cbd5e1', borderRadius: '12px',
                    cursor: uploading ? 'not-allowed' : 'pointer', background: '#f8fafc',
                    transition: 'all 150ms', gap: '6px'
                  }}
                  onMouseOver={e => !uploading && (e.currentTarget.style.borderColor = '#2A9D8F')}
                  onMouseOut={e => !uploading && (e.currentTarget.style.borderColor = '#cbd5e1')}
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin" style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(42,157,143,0.2)', borderTopColor: '#2A9D8F' }} />
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={24} color="#64748b" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
                        Click to upload images
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        Up to {3 - images.length} more image{3 - images.length > 1 ? 's' : ''} (JPG, PNG)
                      </span>
                    </>
                  )}
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: '#f8fafc', padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0',
              background: 'white', color: '#64748b', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: '8px 20px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg,#1B3A5C,#2A9D8F)', color: 'white',
              fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(42,157,143,0.2)',
            }}
          >
            Save Event
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Staff & Event Details Modal ───────────────────────────────────
function StaffDetailsModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'staff' | 'events'>('staff');
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [isUsingDb, setIsUsingDb] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      setLoadingEvents(true);
      try {
        const supabase = getSupabase() as any;
        const { data, error } = await supabase.from('events').select('*').order('created_at', { ascending: true });
        if (error) throw error;
        
        if (data && data.length > 0) {
          setEventsList(data.map(mapDbEventToUi));
          setIsUsingDb(true);
        } else {
          console.log("Database events table is empty. Seeding it...");
          try {
            const seedData = EVENT_DETAILS.map(e => ({
              sno: e.sno,
              activity: e.activity,
              planned_programs: e.plannedPrograms || 0,
              achieved_programs: e.achievedPrograms || 0,
              planned_participants: e.plannedParticipants || 0,
              achieved_participants: e.achievedParticipants || 0,
              images: []
            }));
            const { error: seedError } = await supabase.from('events').insert(seedData);
            if (seedError) throw seedError;
            
            const { data: refetched } = await supabase.from('events').select('*').order('created_at', { ascending: true });
            setEventsList((refetched || []).map(mapDbEventToUi));
          } catch (seedErr) {
            console.error("Failed to seed database events:", seedErr);
            setEventsList(EVENT_DETAILS);
          }
          setIsUsingDb(true);
        }
      } catch (err) {
        console.warn("Supabase events table check failed, falling back to localStorage:", err);
        const local = localStorage.getItem('care_portal_events');
        if (local) {
          setEventsList(JSON.parse(local));
        } else {
          setEventsList(EVENT_DETAILS);
          localStorage.setItem('care_portal_events', JSON.stringify(EVENT_DETAILS));
        }
        setIsUsingDb(false);
      } finally {
        setLoadingEvents(false);
      }
    };

    loadEvents();
  }, []);

  const handleSaveEvent = async (eventData: any) => {
    let updatedList;
    if (isUsingDb) {
      const supabase = getSupabase() as any;
      if (eventData.id) {
        const { error } = await supabase
          .from('events')
          .update(mapUiEventToDb(eventData))
          .eq('id', eventData.id);
        if (error) {
          console.error("Error updating event in db:", error);
          alert("Error saving event: " + error.message);
          return;
        }
        updatedList = eventsList.map(e => e.id === eventData.id ? eventData : e);
      } else {
        const { data, error } = await supabase
          .from('events')
          .insert([mapUiEventToDb(eventData)])
          .select('*')
          .single();
        if (error) {
          console.error("Error inserting event in db:", error);
          alert("Error saving event: " + error.message);
          return;
        }
        updatedList = [...eventsList, mapDbEventToUi(data)];
      }
    } else {
      if (eventData.id) {
        updatedList = eventsList.map(e => e.id === eventData.id ? eventData : e);
      } else {
        const newEvent = {
          ...eventData,
          id: Math.random().toString(36).substring(2) + Date.now().toString(36)
        };
        updatedList = [...eventsList, newEvent];
      }
      localStorage.setItem('care_portal_events', JSON.stringify(updatedList));
    }
    setEventsList(updatedList);
    setIsEditModalOpen(false);
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    
    let updatedList;
    if (isUsingDb) {
      const supabase = getSupabase() as any;
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      if (error) {
        console.error("Error deleting event in db:", error);
        alert("Error deleting event: " + error.message);
        return;
      }
      updatedList = eventsList.filter(e => e.id !== id);
    } else {
      updatedList = eventsList.filter(e => (e.id || e.sno) !== id);
      localStorage.setItem('care_portal_events', JSON.stringify(updatedList));
    }
    setEventsList(updatedList);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15,23,42,0.3)',
        backdropFilter: 'blur(8px)',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '85vh',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'scaleInModal 200ms ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg,#1B3A5C,#2A9D8F)',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              CARE Project Details
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', margin: '4px 0 0' }}>
              Staff directory & program achievements tracking
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              transition: 'background 150ms',
            }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
            onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #f1f5f9',
            background: '#f8fafc',
            padding: '10px 20px',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => setActiveTab('staff')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'staff' ? '#1B3A5C' : 'transparent',
              color: activeTab === 'staff' ? 'white' : '#64748b',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 150ms',
            }}
          >
            <Users size={15} />
            Active Staff ({STAFF_DETAILS.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'events' ? '#1B3A5C' : 'transparent',
              color: activeTab === 'events' ? 'white' : '#64748b',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 150ms',
            }}
          >
            <ClipboardList size={15} />
            Events & Achievements
          </button>

          {activeTab === 'events' && (
            <div style={{ marginLeft: 'auto' }}>
              <button
                onClick={() => { setEditingEvent(null); setIsEditModalOpen(true); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#2A9D8F',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'background 150ms',
                  boxShadow: '0 2px 4px rgba(42,157,143,0.2)',
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#227f74')}
                onMouseOut={e => (e.currentTarget.style.background = '#2A9D8F')}
              >
                <PlusCircle size={14} /> Add Event
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#fafafa' }}>
          {activeTab === 'staff' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
              {STAFF_DETAILS.map(s => (
                <div
                  key={s.sno}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '16px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                      {s.name}
                    </h3>
                    <span
                      style={{
                        background: '#eff6ff',
                        color: '#1e40af',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                      }}
                    >
                      BG: {s.bloodGroup}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '0.78rem',
                      color: '#64748b',
                      fontWeight: 600,
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {s.designation}
                  </p>

                  <div
                    style={{
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Qualification:</span>
                      <span style={{ color: '#334155', fontWeight: 500 }}>{s.qualification}</span>
                    </div>
                    {s.experience !== '—' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8' }}>Experience:</span>
                        <span style={{ color: '#334155', fontWeight: 500 }}>{s.experience}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Phone:</span>
                      <a href={`tel:${s.phone}`} style={{ color: '#2A9D8F', fontWeight: 600, textDecoration: 'none' }}>
                        {s.phone}
                      </a>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                      <span style={{ color: '#94a3b8' }}>Email:</span>
                      <a
                        href={`mailto:${s.email}`}
                        style={{
                          color: '#2A9D8F',
                          fontWeight: 600,
                          textDecoration: 'none',
                          wordBreak: 'break-all',
                        }}
                      >
                        {s.email}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : loadingEvents ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px' }}>
              <div className="animate-spin" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid rgba(42,157,143,0.1)', borderTopColor: '#2A9D8F' }} />
              <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>Loading achievements...</p>
            </div>
          ) : (
            <div
              style={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700 }}>
                      <th style={{ padding: '12px 16px', width: '60px' }}>Sl.no</th>
                      <th style={{ padding: '12px 16px' }}>Programme / Activity</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', width: '100px' }}>Planned Prog</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', width: '100px' }}>Achieved Prog</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', width: '100px' }}>Planned Part</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', width: '100px' }}>Achieved Part</th>
                      <th style={{ padding: '12px 16px', width: '140px' }}>Status / Progress</th>
                      <th style={{ padding: '12px 16px', width: '90px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventsList.map((e, idx) => {
                      const hasPlanned = e.plannedPrograms != null;
                      const hasAchieved = e.achievedPrograms != null;
                      const plannedVal = e.plannedPrograms || 0;
                      const achievedVal = e.achievedPrograms || 0;

                      let pct = 0;
                      if (hasPlanned && plannedVal > 0) {
                        pct = Math.min(Math.round((achievedVal / plannedVal) * 100), 100);
                      }

                      const isComplete = pct === 100;
                      const isStarted = pct > 0;

                      const plannedPart = e.plannedParticipants;
                      const achievedPart = e.achievedParticipants;

                      return (
                        <tr
                          key={e.id || e.sno || idx}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            background: idx % 2 === 0 ? 'white' : '#fafafa',
                          }}
                        >
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: '#64748b' }}>{e.sno}</td>
                          <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 500 }}>
                            <div>{e.activity}</div>
                            {e.images && e.images.length > 0 && (
                              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                                {e.images.map((img: string, imgIdx: number) => (
                                  <img
                                    key={imgIdx}
                                    src={img}
                                    alt={`Event image ${imgIdx + 1}`}
                                    style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '4px',
                                      objectFit: 'cover',
                                      cursor: 'pointer',
                                      border: '1px solid #e2e8f0',
                                    }}
                                    onClick={() => window.open(img, '_blank')}
                                  />
                                ))}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>
                            {hasPlanned ? plannedVal : '—'}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', color: hasAchieved ? '#0f172a' : '#94a3b8', fontWeight: 700 }}>
                            {hasAchieved ? achievedVal : '—'}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>
                            {plannedPart != null ? plannedPart : '—'}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center', color: achievedPart != null ? '#0f172a' : '#94a3b8', fontWeight: 700 }}>
                            {achievedPart != null ? achievedPart : '—'}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {hasPlanned ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    color: isComplete ? '#10b981' : isStarted ? '#3b82f6' : '#64748b',
                                  }}
                                >
                                  <span>{pct}%</span>
                                  <span>
                                    {achievedVal}/{plannedVal}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    width: '100%',
                                    height: '6px',
                                    background: '#e2e8f0',
                                    borderRadius: '3px',
                                    overflow: 'hidden',
                                  }}
                                >
                                  <div
                                    style={{
                                      width: `${pct}%`,
                                      height: '100%',
                                      background: isComplete
                                        ? 'linear-gradient(90deg,#10b981,#34d399)'
                                        : 'linear-gradient(90deg,#3b82f6,#60a5fa)',
                                      borderRadius: '3px',
                                    }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button
                                onClick={() => { setEditingEvent(e); setIsEditModalOpen(true); }}
                                style={{
                                  background: 'rgba(59,130,246,0.1)', border: 'none', borderRadius: '6px',
                                  width: '28px', height: '28px', display: 'flex', alignItems: 'center',
                                  justifyContent: 'center', cursor: 'pointer', color: '#3b82f6',
                                  transition: 'all 150ms',
                                }}
                                title="Edit Event"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(e.id || e.sno)}
                                style={{
                                  background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '6px',
                                  width: '28px', height: '28px', display: 'flex', alignItems: 'center',
                                  justifyContent: 'center', cursor: 'pointer', color: '#ef4444',
                                  transition: 'all 150ms',
                                }}
                                title="Delete Event"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEvent}
        />
      )}

      <style>{`
        @keyframes scaleInModal {
          from { transform: scale(0.95); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}


// ─── Survey Detail Panel ────────────────────────────────────────────
function SurveyDetailPanel({ survey, onClose }: { survey: DraftSurvey; onClose: () => void }) {
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ household: true });

  const toggle = (key: string) => setOpenSections(s => ({ ...s, [key]: !s[key] }));

  const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
      <button
        onClick={() => toggle(id)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: openSections[id] ? '#f8fafc' : 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', color: '#1e293b' }}
      >
        {title}
        {openSections[id] ? <ChevronUp size={15} color="#64748b" /> : <ChevronDown size={15} color="#64748b" />}
      </button>
      {openSections[id] && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', background: 'white' }}>
          {children}
        </div>
      )}
    </div>
  );

  const Field = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div style={{ marginBottom: '8px' }}>
      <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      <p style={{ margin: '2px 0 0', fontSize: '0.88rem', color: value ? '#1e293b' : '#cbd5e1', fontWeight: value ? 500 : 400 }}>
        {value || '—'}
      </p>
    </div>
  );

  const checkedDocs = (map: Record<string, boolean> = {}) =>
    Object.entries(map)
      .filter(([k, v]) => v && k !== 'id' && k !== 'member_id' && k !== 'created_at' && k !== 'updated_at')
      .map(([k]) => k.replace(/_/g, ' '))
      .join(', ') || '—';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', justifyContent: 'flex-end',
      background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(4px)',
    }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: '480px', height: '100%',
          background: 'white', overflowY: 'auto',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.2)',
          animation: 'slideInRight 240ms ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Panel header */}
        <div style={{
          background: 'linear-gradient(135deg,#1B3A5C,#0f3d38)',
          padding: '20px 24px',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>
                Household {survey.household.household_number || 'N/A'}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', margin: '4px 0 0' }}>
                {survey.household.hamlet_code} · {survey.household.staff_name}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
            >
              <X size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(42,157,143,0.25)', color: '#34d399', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px' }}>
              ✓ Submitted
            </span>
            <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', borderRadius: '999px', fontSize: '0.72rem', padding: '2px 10px' }}>
              {survey.members.length} member{survey.members.length !== 1 ? 's' : ''}
            </span>
            <span style={{ background: 'rgba(255,183,3,0.2)', color: '#FFB703', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600, padding: '2px 10px' }}>
              {survey.household.economic_status || 'Status N/A'}
            </span>
          </div>

          {/* Admin edit button */}
          <button
            onClick={() => { onClose(); navigate(`/staff/survey/${survey.id}`, { state: { survey } }); }}
            style={{
              marginTop: '14px', display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: 'rgba(255,255,255,0.18)',
              color: 'white', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
              transition: 'background 200ms',
            }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.28)')}
            onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
          >
            <Pencil size={13} /> Edit This Survey
          </button>
        </div>

        {/* Panel body */}
        <div style={{ padding: '16px' }}>

          <Section id="household" title="📋 Household Information">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <Field label="Date" value={survey.household.date} />
              <Field label="Staff" value={survey.household.staff_name} />
              <Field label="Hamlet Code" value={survey.household.hamlet_code} />
              <Field label="Household No." value={survey.household.household_number} />
              <Field label="Economic Status" value={survey.household.economic_status} />
              <Field label="Religion" value={survey.household.religion} />
              <Field label="Community" value={survey.household.community} />
              <Field label="Block" value={survey.household.block} />
              <Field label="Village" value={survey.household.village} />
              <Field label="Panchayath" value={survey.household.village_panchayath} />
              <Field label="Door No." value={survey.household.door_no} />
            </div>
            {survey.household.remarks && (
              <div style={{ marginTop: '8px', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.84rem', color: '#475569' }}>
                <strong>Remarks:</strong> {survey.household.remarks}
              </div>
            )}
          </Section>

          <Section id="other_services" title="🛠️ Other Services">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: '#475569' }}>Lamination</span>
                <span style={{ fontWeight: 600, color: survey.household.lamination ? '#10b981' : '#94a3b8' }}>
                  {survey.household.lamination ? 'Yes' : 'No'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: '#475569' }}>E-Sevai Service Charges</span>
                <span style={{ fontWeight: 600, color: survey.household.e_sevai_service_charges ? '#10b981' : '#64748b' }}>
                  {survey.household.e_sevai_service_charges ? 'Yes' : 'No'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: '#475569' }}>Digital Safety Measures</span>
                <span style={{ fontWeight: 600, color: survey.household.digital_safety_measures ? '#10b981' : '#64748b' }}>
                  {survey.household.digital_safety_measures ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </Section>

          {survey.members.map((member, i) => (
            <Section key={member.id} id={`member-${i}`} title={`👤 ${member.name || `Member ${i + 1}`}`}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px', marginBottom: '10px' }}>
                <Field label="Relationship" value={member.relationship} />
                <Field label="Age" value={member.age?.toString()} />
                <Field label="Gender" value={member.gender} />
                <Field label="Marital Status" value={member.marital_status} />
                <Field label="Occupation" value={member.occupation} />
                <Field label="Qualification" value={member.qualification} />
                <Field label="Mobile" value={member.mbl_number} />
                <Field label="Head of Family" value={member.head_of_family ? 'Yes' : 'No'} />
              </div>

              {/* Documents for this member */}
              {survey.documents[member.id!] && (
                <div style={{ marginTop: '8px' }}>
                  <p style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Documents Available</p>
                  <p style={{ fontSize: '0.82rem', color: '#334155' }}>
                    {checkedDocs(survey.documents[member.id!] as Record<string, boolean>)}
                  </p>
                </div>
              )}

              {/* Corrections for this member */}
              {survey.corrections[member.id!] && Object.keys(survey.corrections[member.id!]).length > 0 && (
                <div style={{ marginTop: '8px', padding: '8px 12px', background: '#fff7ed', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                  <p style={{ fontSize: '0.72rem', color: '#c2410c', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>Corrections Required</p>
                  {Object.entries(survey.corrections[member.id!]).map(([docId, subtypes]) => {
                    if (!subtypes || typeof subtypes !== 'object') return null;
                    const checkedTypes = Object.entries(subtypes as Record<string, boolean>).filter(([, v]) => v).map(([k]) => k.replace(/_/g, ' '));
                    if (checkedTypes.length === 0) return null;
                    return (
                      <div key={docId} style={{ fontSize: '0.8rem', color: '#9a3412', marginBottom: '4px' }}>
                        <strong>{docId.replace(/_/g, ' ')}:</strong> {checkedTypes.join(', ')}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Schemes */}
              {survey.schemes[member.id!] && (
                <div style={{ marginTop: '8px' }}>
                  <p style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Schemes</p>
                  <p style={{ fontSize: '0.82rem', color: '#334155' }}>
                    {checkedDocs(survey.schemes[member.id!] as Record<string, boolean>)}
                  </p>
                </div>
              )}
            </Section>
          ))}

          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#cbd5e1', marginTop: '16px' }}>
            Submitted {new Date(survey.lastSavedAt).toLocaleString()}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Edit Requests Tab ──────────────────────────────────────────────
function EditRequestsTab() {
  const { requests, approveRequest, rejectRequest } = useEditRequestStore();
  const { drafts } = useDraftStore();
  const navigate = useNavigate();
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [loadingEdit, setLoadingEdit] = useState(false);

  const handleEditSurvey = async (surveyId: string) => {
    setLoadingEdit(true);
    try {
      const fullDetail = await fetchSurveyDetail(surveyId);
      navigate(`/staff/survey/${surveyId}`, { state: { survey: fullDetail } });
    } catch (err) {
      console.error("Failed to load survey for editing:", err);
      alert("Failed to load survey details from the server.");
    } finally {
      setLoadingEdit(false);
    }
  };

  const allRequests = Object.values(requests).sort(
    (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  );
  const pendingCount = allRequests.filter(r => r.status === 'pending').length;

  const statusStyle: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
    pending:  { bg: '#fef9c3', color: '#854d0e',  icon: <Clock size={13} /> },
    approved: { bg: '#dcfce7', color: '#14532d',  icon: <CheckCheck size={13} /> },
    rejected: { bg: '#fee2e2', color: '#991b1b',  icon: <XCircle size={13} /> },
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Edit Requests</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            {pendingCount > 0 ? `${pendingCount} pending request${pendingCount > 1 ? 's' : ''} awaiting your review` : 'No pending requests'}
          </p>
        </div>
      </div>

      {allRequests.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '16px', padding: '60px 24px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
          <Bell size={48} color="#e2e8f0" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500 }}>No edit requests yet</p>
          <p style={{ color: '#cbd5e1', fontSize: '0.82rem', marginTop: '4px' }}>Staff requests to edit submitted surveys will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {allRequests.map(req => {
            const survey = drafts[req.surveyId];
            const st = statusStyle[req.status];
            return (
              <div
                key={req.surveyId}
                style={{
                  background: 'white', borderRadius: '14px', border: '1px solid #f1f5f9',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden',
                }}
              >
                {/* Card header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg,#1B3A5C,#2A9D8F)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Home size={17} color="white" />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b', margin: 0 }}>
                        Household {req.householdNumber || 'N/A'}
                      </p>
                      <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '2px 0 0' }}>
                        <User2 size={11} style={{ display: 'inline', marginRight: '3px' }} />
                        {req.staffEmail} &nbsp;·&nbsp;
                        <MapPin size={11} style={{ display: 'inline', marginRight: '3px' }} />
                        {req.hamletCode || '—'}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: st.bg, color: st.color, borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px' }}>
                      {st.icon} {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                    {/* Admin can always edit the survey directly */}
                    <button
                      onClick={() => handleEditSurvey(req.surveyId)}
                      disabled={loadingEdit}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(42,157,143,0.1)', color: '#2A9D8F', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', opacity: loadingEdit ? 0.6 : 1 }}
                    >
                      <Pencil size={13} /> {loadingEdit ? 'Loading...' : 'Edit Survey'}
                    </button>
                  </div>
                </div>

                {/* Request details + actions */}
                <div style={{ padding: '12px 20px' }}>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px' }}>
                    Requested: {new Date(req.requestedAt).toLocaleString()}
                    {req.reviewedAt && <> &nbsp;·&nbsp; Reviewed: {new Date(req.reviewedAt).toLocaleString()}</>}
                    {req.reviewNote && <> &nbsp;·&nbsp; Note: <em>{req.reviewNote}</em></>}
                  </p>

                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => approveRequest(req.surveyId)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 18px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        <CheckCheck size={14} /> Approve
                      </button>
                      <input
                        type="text"
                        placeholder="Optional rejection note…"
                        value={rejectNotes[req.surveyId] || ''}
                        onChange={e => setRejectNotes(n => ({ ...n, [req.surveyId]: e.target.value }))}
                        style={{ flex: 1, minWidth: '160px', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '7px 12px', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none' }}
                        onFocus={e => (e.target.style.borderColor = '#ef4444')}
                        onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                      />
                      <button
                        onClick={() => rejectRequest(req.surveyId, rejectNotes[req.surveyId])}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', padding: '8px 18px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  )}

                  {req.status === 'approved' && survey && (
                    <p style={{ fontSize: '0.78rem', color: '#065f46', margin: 0 }}>
                      ✓ Staff can now edit this survey. Survey last updated: {new Date(survey.lastSavedAt).toLocaleString()}
                    </p>
                  )}

                  {req.status === 'rejected' && (
                    <p style={{ fontSize: '0.78rem', color: '#991b1b', margin: 0 }}>
                      ✗ Request rejected. Staff has been notified.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Submitted Surveys Tab ──────────────────────────────────────────
function SubmittedSurveysTab({ surveys }: { surveys: DraftSurvey[] }) {
  const [search, setSearch] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSurvey, setSelectedSurvey] = useState<DraftSurvey | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleViewDetails = async (surveySummary: DraftSurvey) => {
    setLoadingDetail(true);
    try {
      const fullDetail = await fetchSurveyDetail(surveySummary.id);
      setSelectedSurvey(fullDetail);
    } catch (err) {
      console.error("Failed to load details:", err);
      alert("Failed to load survey details from the server.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const submitted = surveys;

  // Extract unique staff names from the surveys
  const uniqueStaff = Array.from(
    new Set(submitted.map(s => s.household.staff_name).filter(Boolean))
  ).sort() as string[];

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedStaff]);

  const filtered = submitted.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch = (
      s.household.household_number?.toLowerCase().includes(q) ||
      s.household.staff_name?.toLowerCase().includes(q) ||
      s.household.hamlet_code?.toLowerCase().includes(q) ||
      s.household.economic_status?.toLowerCase().includes(q)
    );
    const matchesStaff = selectedStaff === 'All' || s.household.staff_name === selectedStaff;
    return matchesSearch && matchesStaff;
  });

  // Pagination calculations
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);
  const startIdx = (activePage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedSurveys = filtered.slice(startIdx, endIdx);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (activePage > 3) {
        pages.push('...');
      }
      const start = Math.max(2, activePage - 1);
      const end = Math.min(totalPages - 1, activePage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (activePage < totalPages - 2) {
        pages.push('...');
      }
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const exportSurveys = () => {
    const rows = submitted.map(s => ({
      'Household No.': s.household.household_number || '',
      'Staff': s.household.staff_name || '',
      'Hamlet Code': s.household.hamlet_code || '',
      'Date': s.household.date || '',
      'Economic Status': s.household.economic_status || '',
      'Members': s.members.length,
      'Lamination': s.household.lamination ? 'Yes' : 'No',
      'E-Sevai Charges': s.household.e_sevai_service_charges ? 'Yes' : 'No',
      'Digital Safety': s.household.digital_safety_measures ? 'Yes' : 'No',
      'Submitted At': new Date(s.lastSavedAt).toLocaleString(),
      'Remarks': s.household.remarks || '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Submitted Surveys');
    XLSX.writeFile(wb, 'Submitted_Surveys.xlsx');
  };

  const statusBadge = (status?: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      BPL: { bg: '#fef9c3', color: '#854d0e' },
      APL: { bg: '#dbeafe', color: '#1e40af' },
      Others: { bg: '#f3f4f6', color: '#374151' },
    };
    const style = map[status || ''] || { bg: '#f3f4f6', color: '#374151' };
    return (
      <span style={{ background: style.bg, color: style.color, borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, padding: '2px 9px' }}>
        {status || 'N/A'}
      </span>
    );
  };

  return (
    <div className="animate-fade-in">
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Submitted Surveys
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            {submitted.length} survey{submitted.length !== 1 ? 's' : ''} submitted
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              id="surveys-search"
              type="text"
              placeholder="Search by household, hamlet, staff…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                paddingLeft: '32px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px',
                border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.84rem',
                fontFamily: 'inherit', outline: 'none', width: '240px',
                background: 'white', color: '#1e293b',
              }}
              onFocus={e => (e.target.style.borderColor = '#2A9D8F')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>

          {/* Staff Filter */}
          <div style={{ position: 'relative' }}>
            <select
              id="surveys-staff-filter"
              value={selectedStaff}
              onChange={e => setSelectedStaff(e.target.value)}
              style={{
                paddingLeft: '12px', paddingRight: '32px', paddingTop: '8px', paddingBottom: '8px',
                border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.84rem',
                fontFamily: 'inherit', outline: 'none', width: '180px',
                background: 'white', color: '#1e293b',
                cursor: 'pointer',
                appearance: 'none',
              }}
              onFocus={e => (e.target.style.borderColor = '#2A9D8F')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            >
              <option value="All">All Staff</option>
              {uniqueStaff.map(staff => (
                <option key={staff} value={staff}>{staff}</option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          </div>

          <button
            id="surveys-export"
            onClick={exportSurveys}
            className="btn-accent"
            style={{ padding: '9px 18px', fontSize: '0.84rem' }}
          >
            <Download size={15} /> Export Excel
          </button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '16px', padding: '60px 24px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
          <ClipboardList size={48} color="#e2e8f0" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500 }}>
            {search || selectedStaff !== 'All' ? 'No surveys match your filters.' : 'No surveys submitted yet.'}
          </p>
          <p style={{ color: '#cbd5e1', fontSize: '0.82rem', marginTop: '4px' }}>
            Submitted surveys from staff will appear here.
          </p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 100px 80px 120px 48px',
            padding: '10px 20px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            fontSize: '0.72rem', fontWeight: 700, color: '#64748b',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            <span>Household</span>
            <span>Staff / Hamlet</span>
            <span>Submitted</span>
            <span>Status</span>
            <span>Members</span>
            <span>Date</span>
            <span></span>
          </div>

          {/* Rows */}
          {paginatedSurveys.map((survey, i) => (
            <div
              key={survey.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 100px 80px 120px 48px',
                padding: '14px 20px',
                borderBottom: i < paginatedSurveys.length - 1 ? '1px solid #f8fafc' : 'none',
                alignItems: 'center',
                transition: 'background 150ms',
                cursor: 'pointer',
                background: 'white',
              }}
              onMouseOver={e => (e.currentTarget.style.background = '#f8fafc')}
              onMouseOut={e => (e.currentTarget.style.background = 'white')}
              onClick={() => handleViewDetails(survey)}
            >
              {/* Household */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
                  background: 'linear-gradient(135deg,#1B3A5C,#2A9D8F)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Home size={15} color="white" />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', margin: 0 }}>
                    {survey.household.household_number || 'N/A'}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0 }}>
                    ID: {survey.id.slice(0, 8)}…
                  </p>
                </div>
              </div>

              {/* Staff / Hamlet */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: '#374151', fontWeight: 500 }}>
                  <User2 size={12} color="#94a3b8" />
                  {survey.household.staff_name || '—'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                  <MapPin size={11} color="#2A9D8F" />
                  {survey.household.hamlet_code || '—'}
                </div>
              </div>

              {/* Submitted at */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#374151' }}>
                  <CalendarDays size={12} color="#94a3b8" />
                  {new Date(survey.lastSavedAt).toLocaleDateString()}
                </div>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0 16px' }}>
                  {new Date(survey.lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* Status */}
              {statusBadge(survey.household.economic_status)}

              {/* Members */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#374151' }}>
                <Users size={14} color="#94a3b8" />
                {survey.members.length}
              </div>

              {/* Survey date */}
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileCheck2 size={12} color="#2A9D8F" />
                  {survey.household.date || '—'}
                </div>
              </div>

              {/* View button */}
              <button
                onClick={e => { e.stopPropagation(); handleViewDetails(survey); }}
                title="View details"
                style={{
                  background: 'rgba(42,157,143,0.1)', border: 'none', borderRadius: '8px',
                  width: '32px', height: '32px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', color: '#2A9D8F',
                  transition: 'all 150ms',
                }}
                onMouseOver={e => { e.currentTarget.style.background = '#2A9D8F'; e.currentTarget.style.color = 'white'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(42,157,143,0.1)'; e.currentTarget.style.color = '#2A9D8F'; }}
              >
                <Eye size={15} />
              </button>
            </div>
          ))}

          {/* Pagination Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            background: '#f8fafc',
            borderTop: '1px solid #f1f5f9',
            fontSize: '0.8rem',
            color: '#64748b',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              Showing <span style={{ fontWeight: 600, color: '#1e293b' }}>{startIdx + 1}</span> to{' '}
              <span style={{ fontWeight: 600, color: '#1e293b' }}>{Math.min(endIdx, filtered.length)}</span> of{' '}
              <span style={{ fontWeight: 600, color: '#1e293b' }}>{filtered.length}</span> surveys
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={activePage === 1}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '32px', height: '32px', borderRadius: '6px',
                  border: '1.5px solid #e2e8f0', background: 'white',
                  color: activePage === 1 ? '#cbd5e1' : '#64748b',
                  cursor: activePage === 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 150ms',
                }}
                onMouseOver={e => {
                  if (activePage !== 1) {
                    e.currentTarget.style.borderColor = '#2A9D8F';
                    e.currentTarget.style.color = '#2A9D8F';
                  }
                }}
                onMouseOut={e => {
                  if (activePage !== 1) {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.color = '#64748b';
                  }
                }}
              >
                <ChevronLeft size={16} />
              </button>
              
              {/* Page numbers */}
              {getPageNumbers().map((n, idx) => {
                if (n === '...') {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '32px', height: '32px', color: '#94a3b8',
                      }}
                    >
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={n}
                    onClick={() => setCurrentPage(n as number)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      minWidth: '32px', height: '32px', borderRadius: '6px',
                      border: '1.5px solid',
                      borderColor: activePage === n ? '#2A9D8F' : '#e2e8f0',
                      background: activePage === n ? '#2A9D8F' : 'white',
                      color: activePage === n ? 'white' : '#64748b',
                      fontWeight: activePage === n ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 150ms',
                      padding: '0 4px',
                    }}
                    onMouseOver={e => {
                      if (activePage !== n) {
                        e.currentTarget.style.borderColor = '#2A9D8F';
                        e.currentTarget.style.color = '#2A9D8F';
                      }
                    }}
                    onMouseOut={e => {
                      if (activePage !== n) {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.color = '#64748b';
                      }
                    }}
                  >
                    {n}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={activePage === totalPages}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '32px', height: '32px', borderRadius: '6px',
                  border: '1.5px solid #e2e8f0', background: 'white',
                  color: activePage === totalPages ? '#cbd5e1' : '#64748b',
                  cursor: activePage === totalPages ? 'not-allowed' : 'pointer',
                  transition: 'all 150ms',
                }}
                onMouseOver={e => {
                  if (activePage !== totalPages) {
                    e.currentTarget.style.borderColor = '#2A9D8F';
                    e.currentTarget.style.color = '#2A9D8F';
                  }
                }}
                onMouseOut={e => {
                  if (activePage !== totalPages) {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.color = '#64748b';
                  }
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail panel */}
      {selectedSurvey && (
        <SurveyDetailPanel survey={selectedSurvey} onClose={() => setSelectedSurvey(null)} />
      )}

      {/* Loading Detail Overlay */}
      {loadingDetail && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 110,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(15,23,42,0.35)', backdropFilter: 'blur(5px)', gap: '16px'
        }}>
          <div className="animate-spin" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.2)', borderTopColor: '#2A9D8F' }} />
          <p style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Fetching survey details...</p>
        </div>
      )}
    </div>
  );
}

// ─── Overview Tab ───────────────────────────────────────────────────
function OverviewTab({ onExport, stats, loading, surveys }: { onExport: () => void, stats: any, loading: boolean, surveys: DraftSurvey[] }) {
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  if (loading || !stats) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '16px' }}>
        <div className="animate-spin" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid rgba(42,157,143,0.1)', borderTopColor: '#2A9D8F' }} />
        <p style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 500 }}>Loading overview statistics...</p>
      </div>
    );
  }

  // Calculate other services count dynamically from synced surveys as fallback
  let otherServicesCount = stats.total_other_services_needed || 0;
  if (otherServicesCount === 0 && surveys && surveys.length > 0) {
    surveys.forEach(s => {
      if (s.household?.lamination) otherServicesCount++;
      if (s.household?.e_sevai_service_charges) otherServicesCount++;
      if (s.household?.digital_safety_measures) otherServicesCount++;
    });
  }

  const progressData = [
    { name: 'Corrections', Required: stats.total_corrections_required, Completed: stats.total_corrections_made },
    { name: 'New Docs', Required: stats.total_new_docs_needed, Completed: stats.total_new_docs_obtained },
    { name: 'Other Services', Required: otherServicesCount, Completed: stats.total_other_services_obtained || 0 },
  ];

  // Dynamic calculations
  const totalHouseholds = stats.total_households;
  const totalMembers = stats.total_members;
  const bplCount = stats.bpl_count;
  const bplPercent = totalHouseholds > 0 ? ((bplCount / totalHouseholds) * 100).toFixed(1) : 0;
  const hamletsCovered = stats.hamlets_covered_count;

  const statCards = [
    { label: 'Total Households', value: totalHouseholds.toString(), icon: Home, colorClass: 'blue', iconBg: 'linear-gradient(135deg,#3b82f6,#60a5fa)', trend: 'Overall' },
    { label: 'Total Members', value: totalMembers.toString(), icon: Users, colorClass: 'green', iconBg: 'linear-gradient(135deg,#10b981,#34d399)', trend: 'Overall' },
    { label: 'BPL Count', value: bplCount.toString(), icon: AlertTriangle, colorClass: 'amber', iconBg: 'linear-gradient(135deg,#f59e0b,#fbbf24)', trend: `${bplPercent}% of total` },
    { label: 'Staff', value: STAFF_DETAILS.length.toString(), icon: Users, colorClass: 'purple', iconBg: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', trend: `${hamletsCovered} hamlets covered`, clickable: true },
  ];

  // Helper to sort by hamlet code in increasing numeric order (e.g. 1.1 -> 2.1 -> 10.1)
  const sortHamlets = (a: { name: string }, b: { name: string }) => {
    if (a.name === 'Unknown' || a.name === 'No Data') return 1;
    if (b.name === 'Unknown' || b.name === 'No Data') return -1;
    const aParts = a.name.split('.').map(Number);
    const bParts = b.name.split('.').map(Number);
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aVal = aParts[i] ?? 0;
      const bVal = bParts[i] ?? 0;
      if (aVal !== bVal) return aVal - bVal;
    }
    return 0;
  };

  const hamletDataRaw = stats.hamlet_counts || [];
  const hamletData = [...hamletDataRaw].sort(sortHamlets);
  if (hamletData.length === 0) hamletData.push({ name: 'No Data', count: 0 });

  const docData = (stats.document_counts || []).map((d: any) => ({ name: d.name.replace(/_/g, ' '), value: d.value }));
  if (docData.length === 0) docData.push({ name: 'No Data', value: 1 });

  // Calculate hamlet-wise individual counts dynamically from synced surveys
  const hamletIndividualsMap: Record<string, number> = {};
  if (surveys && surveys.length > 0) {
    surveys.forEach(s => {
      const hamlet = s.household?.hamlet_code || 'Unknown';
      const memberCount = s.members?.length || 0;
      hamletIndividualsMap[hamlet] = (hamletIndividualsMap[hamlet] || 0) + memberCount;
    });
  } else if (stats?.hamlet_individual_counts && stats.hamlet_individual_counts.length > 0) {
    // Fallback to database statistics
    stats.hamlet_individual_counts.forEach((hc: any) => {
      hamletIndividualsMap[hc.name] = hc.count;
    });
  }

  const hamletIndividualData = Object.entries(hamletIndividualsMap)
    .map(([name, count]) => ({ name, count }))
    .sort(sortHamlets);

  if (hamletIndividualData.length === 0) {
    hamletIndividualData.push({ name: 'No Data', count: 0 });
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Overview</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Survey dashboard — Tamil Nadu Coastal Communities</p>
        </div>
        <button id="admin-export" onClick={onExport} className="btn-accent">
          <Download size={17} /> Export Data
        </button>
      </div>

      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {statCards.map(({ label, value, icon: Icon, colorClass, iconBg, trend, clickable }) => (
          <div
            key={label}
            className={`stat-card ${colorClass} animate-fade-in-up`}
            style={clickable ? { cursor: 'pointer', transition: 'transform 200ms ease, box-shadow 200ms ease' } : {}}
            onClick={clickable ? () => setIsStaffModalOpen(true) : undefined}
            onMouseOver={clickable ? e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)'; } : undefined}
            onMouseOut={clickable ? e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; } : undefined}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                <Icon size={22} color="white" />
              </div>
              <TrendingUp size={14} color="#10b981" />
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 4px', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>{trend}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div className="chart-card">
          <h2 className="section-title">
            <span style={{ width: '6px', height: '22px', borderRadius: '3px', background: 'linear-gradient(#1B3A5C,#2A9D8F)', display: 'inline-block' }} />
            Task Progress
          </h2>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressData} margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} iconType="circle" />
                <Bar dataKey="Required" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={60} />
                <Bar dataKey="Completed" fill="#2A9D8F" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h2 className="section-title">
            <span style={{ width: '6px', height: '22px', borderRadius: '3px', background: 'linear-gradient(#1B3A5C,#2A9D8F)', display: 'inline-block' }} />
            Hamlet-wise Households
          </h2>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hamletData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', fontSize: '13px' }} cursor={{ fill: 'rgba(42,157,143,0.06)' }} />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2A9D8F" />
                    <stop offset="100%" stopColor="#1B3A5C" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h2 className="section-title">
            <span style={{ width: '6px', height: '22px', borderRadius: '3px', background: 'linear-gradient(#FFB703,#E76F51)', display: 'inline-block' }} />
            Document Availability
          </h2>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={docData} cx="50%" cy="45%" innerRadius={70} outerRadius={96} paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {docData.map((_e: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', fontSize: '13px' }} />
                <Legend verticalAlign="bottom" height={40} iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: '0.8rem', color: '#475569' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h2 className="section-title">
            <span style={{ width: '6px', height: '22px', borderRadius: '3px', background: 'linear-gradient(#8b5cf6,#3b82f6)', display: 'inline-block' }} />
            Hamlet-wise Individuals
          </h2>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hamletIndividualData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', fontSize: '13px' }} cursor={{ fill: 'rgba(139,92,246,0.06)' }} />
                <Bar dataKey="count" fill="url(#individualBarGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="individualBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {isStaffModalOpen && (
        <StaffDetailsModal onClose={() => setIsStaffModalOpen(false)} />
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, signOut } = useAuthStore();
  const { drafts } = useDraftStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'surveys' | 'requests'>('overview');
  const [remoteSurveys, setRemoteSurveys] = useState<DraftSurvey[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchAdminSurveys()
      .then(data => setRemoteSurveys(data))
      .catch(err => {
        console.warn("Failed to fetch from Supabase. Falling back to local.", err);
        setRemoteSurveys(Object.values(drafts).filter(d => d.status === 'synced'));
      });
  }, [drafts]);

  useEffect(() => {
    setLoadingStats(true);
    fetchDashboardStats()
      .then(data => setDashboardStats(data))
      .catch(err => {
        console.error("Failed to fetch dashboard stats:", err);
      })
      .finally(() => {
        setLoadingStats(false);
      });
  }, [drafts]);

  const submittedSurveys = remoteSurveys.length > 0 ? remoteSurveys : Object.values(drafts).filter(d => d.status === 'synced');
  const submittedCount = submittedSurveys.length;
  const { requests } = useEditRequestStore();
  const pendingRequestCount = Object.values(requests).filter(r => r.status === 'pending').length;

  const handleSignOut = () => { signOut(); navigate('/login'); };

  const exportData = () => {
    const ws = XLSX.utils.json_to_sheet([
      { Household: 'H001', Staff: 'staff1@test.com', Hamlet: 'Hamlet A', Status: 'BPL' },
      { Household: 'H002', Staff: 'staff2@test.com', Hamlet: 'Hamlet B', Status: 'APL' }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Surveys');
    XLSX.writeFile(wb, 'Survey_Export.xlsx');
  };

  const TABS: Array<{ id: 'overview' | 'surveys' | 'requests', label: string, icon: any, badge?: number }> = [
    { id: 'overview',  label: 'Overview',           icon: LayoutDashboard },
    { id: 'surveys',   label: 'Submitted Surveys',  icon: ClipboardList,   badge: submittedCount },
    { id: 'requests',  label: 'Edit Requests',       icon: Bell,            badge: pendingRequestCount },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>

      {/* Navbar */}
      <nav className="navbar-glass">
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.jpeg" alt="Logo" style={{ height: '36px', width: 'auto', borderRadius: '50%', background: 'white', padding: '2px', border: '2px solid rgba(42,157,143,0.5)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'white', letterSpacing: '-0.01em', lineHeight: 1.1 }}>PRO-VISION CARE</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin Portal</div>
            </div>
          </div>

          {/* Tab navigation — inside navbar */}
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '4px' }}>
            {TABS.map(({ id, label, icon: Icon, badge }) => (
              <button
                key={id}
                id={`admin-tab-${id}`}
                onClick={() => setActiveTab(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px', borderRadius: '8px', border: 'none',
                  background: activeTab === id ? 'rgba(255,255,255,0.18)' : 'transparent',
                  color: activeTab === id ? 'white' : 'rgba(255,255,255,0.6)',
                  fontWeight: activeTab === id ? 700 : 500,
                  fontSize: '0.82rem', cursor: 'pointer',
                  transition: 'all 200ms ease', fontFamily: 'inherit',
                  position: 'relative',
                }}
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
                {badge != null && badge > 0 && (
                  <span style={{
                    background: '#2A9D8F', color: 'white',
                    borderRadius: '999px', fontSize: '0.65rem', fontWeight: 800,
                    padding: '0 6px', minWidth: '18px', height: '18px',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', padding: '5px 14px 5px 5px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#2A9D8F,#1B3A5C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>
                {user?.email?.[0]?.toUpperCase() ?? 'A'}
              </div>
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="hidden sm:inline">
                {user?.email}
              </span>
            </div>
            <button
              id="admin-signout"
              onClick={handleSignOut}
              title="Sign out"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', transition: 'all 220ms ease' }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
              onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        {activeTab === 'overview'  && <OverviewTab stats={dashboardStats} loading={loadingStats} onExport={exportData} surveys={submittedSurveys} />}
        {activeTab === 'surveys'   && <SubmittedSurveysTab surveys={submittedSurveys} />}
        {activeTab === 'requests'  && <EditRequestsTab />}
      </main>
    </div>
  );
}
