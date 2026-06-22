import { useState, useEffect } from 'react';
import { useAuthStore, useDraftStore, useEditRequestStore, fetchAdminSurveys } from '@pro-vision-care/shared';
import type { DraftSurvey } from '@pro-vision-care/shared';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Download, Users, Home, AlertTriangle, TrendingUp,
  LayoutDashboard, ClipboardList, Search, Eye, X, MapPin,
  CalendarDays, User2, FileCheck2, ChevronDown, ChevronUp,
  Pencil, CheckCheck, XCircle, Clock, Bell
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import * as XLSX from 'xlsx';

// ─── Chart mock data ───────────────────────────────────────────────
const hamletData = [
  { name: 'Hamlet A', count: 120 },
  { name: 'Hamlet B', count: 80 },
  { name: 'Hamlet C', count: 150 },
  { name: 'Hamlet D', count: 90 },
];
const docData = [
  { name: 'Aadhaar', value: 400 },
  { name: 'Ration Card', value: 300 },
  { name: 'Fisherman ID', value: 200 },
  { name: 'Missing Docs', value: 100 },
];
const COLORS = ['#1B3A5C', '#2A9D8F', '#FFB703', '#E76F51'];

const statCards = [
  { label: 'Total Households', value: '440', icon: Home, colorClass: 'blue', iconBg: 'linear-gradient(135deg,#3b82f6,#60a5fa)', trend: '+12 this week' },
  { label: 'Total Members', value: '1,820', icon: Users, colorClass: 'green', iconBg: 'linear-gradient(135deg,#10b981,#34d399)', trend: '+48 this week' },
  { label: 'BPL Count', value: '310', icon: AlertTriangle, colorClass: 'amber', iconBg: 'linear-gradient(135deg,#f59e0b,#fbbf24)', trend: '70.5% of total' },
  { label: 'Active Staff', value: '12', icon: Users, colorClass: 'purple', iconBg: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', trend: '4 hamlets covered' },
];

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
    Object.entries(map).filter(([, v]) => v).map(([k]) => k.replace(/_/g, ' ')).join(', ') || '—';

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
            onClick={() => { onClose(); navigate(`/staff/survey/${survey.id}`); }}
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
                      onClick={() => navigate(`/staff/survey/${req.surveyId}`)}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(42,157,143,0.1)', color: '#2A9D8F', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      <Pencil size={13} /> Edit Survey
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
function SubmittedSurveysTab() {
  const { drafts } = useDraftStore();
  const [search, setSearch] = useState('');
  const [selectedSurvey, setSelectedSurvey] = useState<DraftSurvey | null>(null);

  const submitted = Object.values(drafts).filter(d => d.status === 'synced');

  const filtered = submitted.filter(s => {
    const q = search.toLowerCase();
    return (
      s.household.household_number?.toLowerCase().includes(q) ||
      s.household.staff_name?.toLowerCase().includes(q) ||
      s.household.hamlet_code?.toLowerCase().includes(q) ||
      s.household.economic_status?.toLowerCase().includes(q)
    );
  });

  const exportSurveys = () => {
    const rows = submitted.map(s => ({
      'Household No.': s.household.household_number || '',
      'Staff': s.household.staff_name || '',
      'Hamlet Code': s.household.hamlet_code || '',
      'Date': s.household.date || '',
      'Economic Status': s.household.economic_status || '',
      'Members': s.members.length,
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
                fontFamily: 'inherit', outline: 'none', width: '260px',
                background: 'white', color: '#1e293b',
              }}
              onFocus={e => (e.target.style.borderColor = '#2A9D8F')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            />
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
            {search ? 'No surveys match your search.' : 'No surveys submitted yet.'}
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
          {filtered.map((survey, i) => (
            <div
              key={survey.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 100px 80px 120px 48px',
                padding: '14px 20px',
                borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none',
                alignItems: 'center',
                transition: 'background 150ms',
                cursor: 'pointer',
                background: 'white',
              }}
              onMouseOver={e => (e.currentTarget.style.background = '#f8fafc')}
              onMouseOut={e => (e.currentTarget.style.background = 'white')}
              onClick={() => setSelectedSurvey(survey)}
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
                onClick={e => { e.stopPropagation(); setSelectedSurvey(survey); }}
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
        </div>
      )}

      {/* Detail panel */}
      {selectedSurvey && (
        <SurveyDetailPanel survey={selectedSurvey} onClose={() => setSelectedSurvey(null)} />
      )}
    </div>
  );
}

// ─── Overview Tab ───────────────────────────────────────────────────
function OverviewTab({ onExport, surveys }: { onExport: () => void, surveys: DraftSurvey[] }) {
  // Calculate Progress Data
  let totalCorrectionsRequired = 0;
  let totalCorrectionsMade = 0;
  let totalNewDocsNeeded = 0;
  let totalNewDocsObtained = 0;

  surveys.forEach(survey => {
    survey.members.forEach(member => {
      // Corrections
      const memberCorrections = survey.corrections?.[member.id!] || {};
      Object.entries(memberCorrections).forEach(([docId, subTypes]) => {
        if (subTypes && typeof subTypes === 'object') {
          Object.entries(subTypes as Record<string, boolean>).forEach(([subId, checked]) => {
            if (checked) {
              totalCorrectionsRequired++;
              if (survey.corrections_made?.[member.id!]?.[`${docId}__${subId}`]) {
                totalCorrectionsMade++;
              }
            }
          });
        }
      });

      // New Docs
      const memberNewDocs = survey.new_docs?.[member.id!] || {};
      Object.entries(memberNewDocs).forEach(([docId, isNeeded]) => {
        if (isNeeded) {
          totalNewDocsNeeded++;
          if (survey.corrections_made?.[member.id!]?.[`${docId}__new`]) {
            totalNewDocsObtained++;
          }
        }
      });
    });
  });

  const progressData = [
    { name: 'Corrections', Required: totalCorrectionsRequired, Completed: totalCorrectionsMade },
    { name: 'New Docs', Required: totalNewDocsNeeded, Completed: totalNewDocsObtained },
  ];

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
        {statCards.map(({ label, value, icon: Icon, colorClass, iconBg, trend }) => (
          <div key={label} className={`stat-card ${colorClass} animate-fade-in-up`}>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
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
                  {docData.map((_e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', fontSize: '13px' }} />
                <Legend verticalAlign="bottom" height={40} iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: '0.8rem', color: '#475569' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
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

  useEffect(() => {
    fetchAdminSurveys()
      .then(data => setRemoteSurveys(data))
      .catch(err => {
        console.warn("Failed to fetch from Supabase. Falling back to local.", err);
        setRemoteSurveys(Object.values(drafts).filter(d => d.status === 'synced'));
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
                {label}
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
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
        {activeTab === 'overview'  && <OverviewTab onExport={exportData} surveys={submittedSurveys} />}
        {activeTab === 'surveys'   && <SubmittedSurveysTab />}
        {activeTab === 'requests'  && <EditRequestsTab />}
      </main>
    </div>
  );
}
