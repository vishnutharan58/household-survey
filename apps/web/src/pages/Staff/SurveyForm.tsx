import { useState } from 'react';
import { useAuthStore, useDraftStore, useEditRequestStore } from '@pro-vision-care/shared';
import type { DraftSurvey } from '@pro-vision-care/shared';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Send, Eye, Pencil, Lock, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid'; // we need to install uuid if not already

// Hamlet codes per staff — mirrors Login.tsx
const STAFF_HAMLET_MAP: Record<string, string[]> = {
  'suganya@staff.com': ['1.1', '1.2', '1.3', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7'],
  'freeda@staff.com': ['3.1', '3.2', '3.3', '4.1', '4.2', '4.3', '4.4', '4.5', '6.1', '6.2', '6.3'],
  'berdina@staff.com': ['5.1', '5.2', '5.3', '7.1', '7.2', '7.3', '8.1', '8.2', '8.3', '9.1', '9.2', '9.3'],
  'fernisha@staff.com': ['10.1', '10.2', '11.1', '11.2', '11.3', '11.4', '11.5', '11.6', '11.7'],
  'vijini@staff.com': ['12.1', '12.2', '12.3', '12.4', '12.5', '12.6', '12.7', '13.1', '13.2', '13.3'],
  'raksha@staff.com': ['14.1', '14.2', '15.1', '15.2', '15.3', '15.4', '15.5', '16.1', '16.2', '17.1', '17.2', '17.3'],
};

const HAMLET_CODE_TO_NAME: Record<string, string> = {
  "1.1": "Community Hall",
  "1.2": "Primary School",
  "1.3": "Near CSI Church",
  "2.1": "Arockya Nather Kurusadi",
  "2.2": "D.C Nagar",
  "2.3": "Anthoniyar Kurusadi",
  "2.4": "Claret I, Claret II",
  "2.5": "Pillar Nagar",
  "2.6": "Murugan Kuntam",
  "2.7": "Fathima Matha",
  "3.1": "Old Church",
  "3.2": "Kalarai Thottam",
  "4.1": "St. Antony",
  "4.2": "Visenthiyappar Kurusadi",
  "4.3": "Anthirayar Kurusadi",
  "4.4": "YMCA Colony",
  "4.5": "Lurthu Nager",
  "5.1": "Convent Road",
  "5.2": "Arputha Matha Kurusadi",
  "5.3": "Tsunami Colony",
  "6.1": "St. Mathew Church",
  "6.2": "Tsunami Colony",
  "6.3": "Loorth Colony",
  "7.1": "Church Road",
  "7.2": "Antony Street",
  "7.3": "Georgiyar Street",
  "8.1": "Siluvaiyar",
  "9.1": "Sahaya Matha",
  "9.2": "Xavier Street",
  "9.3": "Antony Street",
  "10.1": "Siluvaiyar anbiyam",
  "10.2": "Thomaiyar Kurusadi",
  "11.1": "Madha Colony",
  "11.2": "Anthoniyar Street",
  "11.3": "Sahaya madha street",
  "11.4": "Xavier Street",
  "11.5": "Sebasthiyar",
  "11.6": "Tsunami Colony",
  "11.7": "Hospital",
  "12.1": "Anthoniyar Kurusadi",
  "12.2": "Alagara Matha Kurusadi",
  "12.3": "Ice Plant",
  "12.4": "Ponnam Thoppu",
  "12.5": "Lenal Kurusadi",
  "12.6": "Annal Street",
  "12.7": "Sivantha Man",
  "13.1": "Anthoniyar Street",
  "13.2": "Fathima Matha Street",
  "13.3": "Thomaiyar Kurusadi",
  "14.1": "Pandara Thopu",
  "14.2": "St. Jude's Church",
  "15.1": "Annammal Kurusadi",
  "15.2": "Lurthu Matha Kurusadi",
  "15.3": "Bartholamea Church",
  "15.4": "Kalarai Thottam",
  "15.5": "St. Micheal School Road",
  "16.1": "Yaggappar Kurusadi",
  "16.2": "St. James Church",
  "16.4": "Vaikal Theru",
  "17.1": "Siluvaiyar Street",
  "17.2": "Soosaiyapper Kurusadi",
  "17.3": "Sahaya Matha Kurusadi",
  "17.4": "Vayal Colony",
};

// Default blocks per staff
const STAFF_BLOCK_MAP: Record<string, string> = {
  'suganya@staff.com': 'Agastheeswaram',
  'freeda@staff.com': 'Rajakamangalam',
  'berdina@staff.com': 'Rajakamangalam',
  'fernisha@staff.com': 'Rajakamangalam',
  'vijini@staff.com': 'Kurunthancode',
  'raksha@staff.com': 'Kurunthancode',
};

// Villages per staff
const STAFF_VILLAGE_MAP: Record<string, string[]> = {
  'suganya@staff.com': ['Arockiapuram', 'Kovalam'],
  'freeda@staff.com': ['Kela Manakudy', 'Mela Manakudy', 'Pallam'],
  'berdina@staff.com': ['Annai Nagar', 'Puthanthurai', 'Kesavaputhanthurai'],
  'fernisha@staff.com': ['Periyakadu', 'Rajakamangalam Thurai'],
  'vijini@staff.com': ['Muttom', 'Kadiyapattanam'],
  'raksha@staff.com': ['Simon colony', 'Kodimunai', 'Vaniyakudy', 'Kurumpanai'],
};

// Panchayaths per staff
const STAFF_PANCHAYATH_MAP: Record<string, string[]> = {
  'suganya@staff.com': ['Leepuram', 'Kovalam'],
  'freeda@staff.com': ['Pallam', 'Manakudy'],
  'berdina@staff.com': ['Kesavaputhanthurai', 'Pallam'],
  'fernisha@staff.com': ['Dharmapuram', 'Rajakamangalam Thurai'],
  'vijini@staff.com': ['Muttom'],
  'raksha@staff.com': ['Simon colony'],
};

const TABS = [
  'Household Info',
  'Family Members',
  'Documents Available',
  'Corrections Required',
  'New Docs Needed',
  'Base Docs & Schemes',
  'Remarks',
  'Corrections Made'
];

const AVAILABLE_DOCS = [
  { id: 'aadhaar_card', label: 'Aadhaar Card' },
  { id: 'ration_card', label: 'Ration Card' },
  { id: 'e_epic', label: 'E-Epic' },
  { id: 'pan_card', label: 'PAN Card' },
  { id: 'bank_account', label: 'Bank Account' },
  { id: 'income_certificate', label: 'Income Certificate' },
  { id: 'community_certificate', label: 'Community Certificate' },
  { id: 'birth_certificate', label: 'Birth Certificate' },
  { id: 'death_certificate', label: 'Death Certificate' },
  { id: 'widow_certificate', label: 'Widow Certificate' },
  { id: 'udid', label: 'UDID' },
  { id: 'society_card', label: 'Society Card' },
  { id: 'fisherman_id_card', label: 'Fisherman ID Card' },
  { id: 'fisherman_welfare_card', label: 'Fisherman Welfare Card' },
  { id: 'vb_g_ram_g_act', label: 'VB G Ram G Act' },
  { id: 'cmchis', label: 'CMCHIS' },
  { id: 'legal_heir', label: 'Legal Heir' },
];

const BASE_DOCS = [
  { id: 'aadhaar_card', label: 'Aadhaar Card' },
  { id: 'ration_card', label: 'Ration Card' },
  { id: 'e_epic', label: 'E-Epic' },
  { id: 'pan_card', label: 'PAN Card' },
  { id: 'bank_account', label: 'Bank Account' },
  { id: 'birth_certificate', label: 'Birth Certificate' },
];

const SCHEMES = [
  { id: 'old_age_pension', label: 'Old Age Pension' },
  { id: 'widow_pension', label: 'Widow Pension' },
  { id: 'disability_pension', label: 'Disability Pension' },
  { id: 'cm_girl_child_protection_scheme', label: 'CM Girl Child Protection Scheme' },
  { id: 'death_relief_assistance', label: 'Death Relief Assistance' },
  { id: 'women_welfare_schemes', label: 'Women Welfare Schemes' },
  { id: 'puthumai_penn_schemes', label: 'Puthumai Penn Schemes' },
  { id: 'tamil_puthalvan_schemes', label: 'Tamil Puthalvan Schemes' },
  { id: 'widows_daughter_marriage_assistance', label: 'Widows Daughter Marriage Assistance' },
  { id: 'fishing_ban_period_relief', label: 'Fishing Ban Period Relief' },
  { id: 'short_term_relief', label: 'Short Term Relief' },
  { id: 'saving_period_schemes', label: 'Saving Period Schemes' },
  { id: 'vb_g_ram_g_act', label: 'VB G Ram G Act' },
  { id: 'cmchis', label: 'CMCHIS' },
];

// Correction sub-types — matches the JSONB structure in the DB
const CORRECTION_TYPES = [
  { id: 'Name', label: 'Name' },
  { id: 'DOB', label: 'Date of Birth' },
  { id: 'Address', label: 'Address' },
  { id: 'Mobile_Number', label: 'Mobile Number' },
  { id: 'Guardian_Name', label: 'Guardian Name' },
  { id: 'Photo', label: 'Photo' },
  { id: 'Update', label: 'General Update' },
  { id: 'Others', label: 'Others' },
];

export default function SurveyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hamlet_code, role } = useAuthStore();
  const { drafts, saveDraft, markAsPendingSync: _markAsPendingSync } = useDraftStore();
  const { requests, clearRequest } = useEditRequestStore();

  const existingDraft = location.state?.survey || (id ? drafts[id] : null);
  const isReviewMode = existingDraft?.status === 'synced';
  const [isEditing, setIsEditing] = useState(false);

  // For synced surveys: admin can always edit; staff needs an approved request
  const editRequest = id ? requests[id] : undefined;
  const isAdmin = role === 'admin';
  const isEditApproved = isAdmin || editRequest?.status === 'approved';

  const [activeTab, setActiveTab] = useState(0);

  // Load existing draft or create new
  const [draft, setDraft] = useState<DraftSurvey>(() => {
    if (location.state?.survey) {
      return location.state.survey;
    }
    if (id && drafts[id]) {
      return drafts[id];
    }
    const initialHamletCode = hamlet_code || '';
    const initialHamletName = HAMLET_CODE_TO_NAME[initialHamletCode] || '';
    return {
      id: id || uuidv4(),
      household: {
        date: new Date().toISOString().split('T')[0],
        staff_name: user?.email || '',
        hamlet_code: initialHamletCode,
        hamlet_name: initialHamletName,
        block: user?.email ? (STAFF_BLOCK_MAP[user.email] || '') : '',
      },
      members: [],
      documents: {},
      corrections: {},
      corrections_made: {},
      new_docs: {},
      base_docs: {},
      schemes: {},
      lastSavedAt: new Date().toISOString(),
      status: 'draft'
    };
  });

  const handleSaveDraft = () => {
    saveDraft({ ...draft, status: 'draft' });
  };

  const handleSubmit = () => {
    // Save the current draft state to the store with 'synced' status so it
    // appears in the "Recent Submissions" section on the Staff Dashboard.
    // (In a real app this would call the API first, then mark as synced.)
    saveDraft({ ...draft, status: 'synced' });
    // If this was an approved edit, clear the request so it resets
    if (id && editRequest?.status === 'approved') {
      clearRequest(id);
    }
    navigate(isAdmin ? '/admin' : '/staff');
  };

  const handleAddMember = () => {
    const newMemberId = uuidv4();
    setDraft(prev => ({
      ...prev,
      members: [...prev.members, { id: newMemberId, name: `Member ${prev.members.length + 1}` }],
      documents: { ...prev.documents, [newMemberId]: {} },
      corrections: { ...prev.corrections, [newMemberId]: {} },
      new_docs: { ...prev.new_docs, [newMemberId]: {} },
      base_docs: { ...prev.base_docs, [newMemberId]: {} },
      schemes: { ...prev.schemes, [newMemberId]: {} },
    }));
  };

  const handleDocToggle = (memberId: string, category: 'documents' | 'new_docs' | 'base_docs' | 'schemes', docId: string) => {
    setDraft(prev => {
      const categoryData = prev[category] || {};
      const memberDocs = (categoryData as any)[memberId] || {};
      return {
        ...prev,
        [category]: {
          ...categoryData,
          [memberId]: { ...memberDocs, [docId]: !memberDocs[docId] }
        }
      };
    });
  };

  // Toggle a correction sub-type (e.g. Name, DOB) for a given member+document
  // corrections structure: { [memberId]: { [docId]: { [subType]: boolean } } }
  const handleCorrectionDocToggle = (memberId: string, docId: string) => {
    setDraft(prev => {
      const memberCorrections = prev.corrections?.[memberId] || {};
      const docCorrections = memberCorrections[docId];
      // If the doc entry exists and has at least one sub-type checked, clear it
      // Otherwise initialise with an empty object to "open" the doc for correction
      const hasEntry = docCorrections && typeof docCorrections === 'object';
      return {
        ...prev,
        corrections: {
          ...prev.corrections,
          [memberId]: {
            ...memberCorrections,
            [docId]: hasEntry ? undefined : {},
          }
        }
      };
    });
  };

  const handleCorrectionSubToggle = (memberId: string, docId: string, subTypeId: string) => {
    setDraft(prev => {
      const memberCorrections = prev.corrections?.[memberId] || {};
      const docCorrections = (memberCorrections[docId] as Record<string, boolean>) || {};
      return {
        ...prev,
        corrections: {
          ...prev.corrections,
          [memberId]: {
            ...memberCorrections,
            [docId]: { ...docCorrections, [subTypeId]: !docCorrections[subTypeId] }
          }
        }
      };
    });
  };

  const handleCorrectionMadeToggle = (memberId: string, docId: string, subTypeId: string) => {
    setDraft(prev => {
      const newMade = { ...prev.corrections_made };
      if (!newMade[memberId]) newMade[memberId] = {};

      const key = `${docId}__${subTypeId}`;
      newMade[memberId][key] = !newMade[memberId][key];

      return { ...prev, corrections_made: newMade };
    });
  };

  // Helper: how many sub-types are checked for a given member+doc
  const correctionSubCount = (memberId: string, docId: string): number => {
    const docCorrections = draft.corrections?.[memberId]?.[docId];
    if (!docCorrections || typeof docCorrections !== 'object') return 0;
    return Object.values(docCorrections as Record<string, boolean>).filter(Boolean).length;
  };

  // Helper: is this doc marked for correction at all
  const isDocMarkedForCorrection = (memberId: string, docId: string): boolean => {
    const entry = draft.corrections?.[memberId]?.[docId];
    return entry !== undefined && entry !== null;
  };

  const nextTab = () => setActiveTab(prev => Math.min(prev + 1, TABS.length - 1));
  const prevTab = () => setActiveTab(prev => Math.max(prev - 1, 0));

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <nav className="bg-white border-b sticky top-0 z-10 px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(isAdmin ? '/admin' : '/staff')} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isReviewMode ? 'Review Submission' : 'Survey Entry'}
            </h1>
            {isReviewMode && (
              <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0 }}>
                Household: {draft.household.household_number || 'Unnamed'} &nbsp;·&nbsp; Submitted {new Date(draft.lastSavedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isReviewMode && !isEditing ? (
            <>
              {isEditApproved ? (
                // Admin or staff with approved request — show Edit button
                <button
                  id="survey-edit-btn"
                  onClick={() => setIsEditing(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '8px', border: 'none',
                    background: 'linear-gradient(135deg,#2A9D8F,#1B3A5C)',
                    color: 'white', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                  }}
                >
                  <Pencil size={15} /> Edit Submission
                </button>
              ) : (
                // Staff without permission — locked
                <button
                  id="survey-edit-locked-btn"
                  disabled
                  title="Request edit permission from admin on the Staff Dashboard"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', cursor: 'not-allowed',
                  }}
                >
                  <Lock size={15} /> Edit Locked
                </button>
              )}
            </>
          ) : (
            <>
              <button
                id="survey-save-draft"
                onClick={handleSaveDraft}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
              >
                <Save size={16} /> {isReviewMode ? 'Save as Draft' : 'Save Draft'}
              </button>
              <button
                id="survey-submit"
                onClick={handleSubmit}
                className="flex items-center gap-2 px-4 py-2 text-white bg-primary hover:bg-primary/90 rounded-md text-sm font-medium transition-colors"
              >
                <Send size={16} /> {isReviewMode ? 'Update Submission' : 'Submit'}
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Review mode banner — locked (no approved request) */}
      {isReviewMode && !isEditing && !isEditApproved && (
        <div style={{
          background: 'linear-gradient(135deg,rgba(239,68,68,0.07),rgba(245,158,11,0.05))',
          borderBottom: '1px solid rgba(239,68,68,0.18)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <Lock size={15} color="#ef4444" />
          <span style={{ fontSize: '0.82rem', color: '#991b1b', fontWeight: 500 }}>
            This survey is <strong>locked</strong>. Go back to the Staff Dashboard and click <strong>"Request Edit"</strong> on this submission. Admin must approve before you can edit.
          </span>
        </div>
      )}

      {/* Review mode banner — approved or admin */}
      {isReviewMode && !isEditing && isEditApproved && (
        <div style={{
          background: 'linear-gradient(135deg,rgba(42,157,143,0.12),rgba(27,58,92,0.08))',
          borderBottom: '1px solid rgba(42,157,143,0.2)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <Eye size={16} color="#2A9D8F" />
          <span style={{ fontSize: '0.82rem', color: '#1B3A5C', fontWeight: 500 }}>
            {isAdmin
              ? <>You are viewing this survey as <strong>Admin</strong>. Click <strong>"Edit Submission"</strong> to make changes.</>
              : <>Edit permission <strong>approved</strong>. Click <strong>"Edit Submission"</strong> to make changes.</>
            }
          </span>
        </div>
      )}

      {/* Edit mode banner — pending request (staff) */}
      {isReviewMode && !isEditing && editRequest?.status === 'pending' && !isAdmin && (
        <div style={{
          background: 'linear-gradient(135deg,rgba(245,158,11,0.1),rgba(253,186,116,0.06))',
          borderBottom: '1px solid rgba(245,158,11,0.25)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <AlertCircle size={15} color="#f59e0b" />
          <span style={{ fontSize: '0.82rem', color: '#92400e', fontWeight: 500 }}>
            Edit request is <strong>pending admin approval</strong>. You will be able to edit once approved.
          </span>
        </div>
      )}

      {/* Active edit-mode banner */}
      {isReviewMode && isEditing && (
        <div style={{
          background: 'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(231,111,81,0.06))',
          borderBottom: '1px solid rgba(245,158,11,0.25)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <Pencil size={15} color="#f59e0b" />
          <span style={{ fontSize: '0.82rem', color: '#92400e', fontWeight: 500 }}>
            Editing submitted survey. Click <strong>"Update Submission"</strong> to save changes, or <strong>"Save as Draft"</strong> to re-draft.
          </span>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 mt-6">
        {/* Progress Bar & Tabs */}
        <div className="mb-8">
          <div className="flex overflow-x-auto pb-2 hide-scrollbar gap-2">
            {TABS.map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setActiveTab(idx)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === idx
                    ? 'bg-accent text-white shadow'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
              >
                {idx + 1}. {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[400px]"
          style={isReviewMode && !isEditing ? { opacity: 0.85, pointerEvents: 'none', userSelect: 'none' } : {}}
        >
          {activeTab === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold border-b pb-2">Household Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* ── Auto-filled / Identity fields ── */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input type="date" className="mt-1 block w-full border rounded-md p-2" value={draft.household.date || ''} onChange={e => setDraft({ ...draft, household: { ...draft.household, date: e.target.value } })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Staff Name</label>
                  <input type="text" disabled className="mt-1 block w-full border rounded-md p-2 bg-gray-100" value={draft.household.staff_name || ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Block</label>
                  <input
                    type="text"
                    placeholder="Enter block name"
                    className="mt-1 block w-full border rounded-md p-2"
                    value={draft.household.block || ''}
                    onChange={e => setDraft({ ...draft, household: { ...draft.household, block: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Panchayath</label>
                  {isAdmin ? (
                    <input type="text" disabled className="mt-1 block w-full border rounded-md p-2 bg-gray-100" value={draft.household.village_panchayath || ''} />
                  ) : (() => {
                    const assignedPanchayaths = STAFF_PANCHAYATH_MAP[user?.email || ''] ?? [];
                    const storedPanchayath = draft.household.village_panchayath || '';
                    const optionList = storedPanchayath && !assignedPanchayaths.includes(storedPanchayath)
                      ? [storedPanchayath, ...assignedPanchayaths]
                      : assignedPanchayaths;

                    return (
                      <select
                        className="mt-1 block w-full border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-accent"
                        value={storedPanchayath}
                        onChange={e => setDraft({ ...draft, household: { ...draft.household, village_panchayath: e.target.value } })}
                      >
                        <option value="">Select panchayath...</option>
                        {optionList.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    );
                  })()}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Village</label>
                  {isAdmin ? (
                    <input type="text" disabled className="mt-1 block w-full border rounded-md p-2 bg-gray-100" value={draft.household.village || ''} />
                  ) : (() => {
                    const assignedVillages = STAFF_VILLAGE_MAP[user?.email || ''] ?? [];
                    const storedVillage = draft.household.village || '';
                    const optionList = storedVillage && !assignedVillages.includes(storedVillage)
                      ? [storedVillage, ...assignedVillages]
                      : assignedVillages;

                    return (
                      <select
                        className="mt-1 block w-full border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-accent"
                        value={storedVillage}
                        onChange={e => setDraft({ ...draft, household: { ...draft.household, village: e.target.value } })}
                      >
                        <option value="">Select village...</option>
                        {optionList.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    );
                  })()}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hamlet Name</label>
                  <input
                    type="text"
                    disabled={isAdmin}
                    placeholder="Hamlet name"
                    className={`mt-1 block w-full border rounded-md p-2 ${isAdmin ? 'bg-gray-100' : ''}`}
                    value={draft.household.hamlet_name || ''}
                    onChange={e => setDraft({ ...draft, household: { ...draft.household, hamlet_name: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hamlet Code</label>
                  {isAdmin ? (
                    // Admin sees a plain read-only field
                    <input type="text" disabled className="mt-1 block w-full border rounded-md p-2 bg-gray-100" value={draft.household.hamlet_code || ''} />
                  ) : (() => {
                    // Build option list: staff's assigned hamlets + any already-stored value
                    const assignedHamlets = STAFF_HAMLET_MAP[user?.email || ''] ?? [];
                    const storedCode = draft.household.hamlet_code || '';
                    // Fallback: if staff has no map entry, use auth hamlet_code as single option
                    const baseList = assignedHamlets.length > 0 ? assignedHamlets : (hamlet_code ? [hamlet_code] : []);
                    // Include stored value even if not in base list (old surveys)
                    const optionList = storedCode && !baseList.includes(storedCode)
                      ? [storedCode, ...baseList]
                      : baseList;
                    // Auto-set from auth store if draft has no hamlet yet
                    const currentValue = storedCode || hamlet_code || '';

                    return (
                      <select
                        className="mt-1 block w-full border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-accent"
                        value={currentValue}
                        onChange={e => {
                          const code = e.target.value;
                          const name = HAMLET_CODE_TO_NAME[code] || '';
                          setDraft(prev => ({
                            ...prev,
                            household: {
                              ...prev.household,
                              hamlet_code: code,
                              hamlet_name: name || prev.household.hamlet_name || ''
                            }
                          }));
                        }}
                      >
                        {currentValue === '' && <option value="">Select hamlet...</option>}
                        {optionList.map(code => (
                          <option key={code} value={code}>{code}</option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Household Number</label>
                  <input
                    type="text"
                    placeholder="Household No."
                    className="mt-1 block w-full border rounded-md p-2"
                    value={draft.household.household_number || ''}
                    onChange={e => setDraft({ ...draft, household: { ...draft.household, household_number: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Individual Number</label>
                  <input
                    type="text"
                    placeholder="Individual / Serial No."
                    className="mt-1 block w-full border rounded-md p-2"
                    value={draft.household.individual_number || ''}
                    onChange={e => setDraft({ ...draft, household: { ...draft.household, individual_number: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Door No.</label>
                  <input
                    type="text"
                    placeholder="Door / House No."
                    className="mt-1 block w-full border rounded-md p-2"
                    value={draft.household.door_no || ''}
                    onChange={e => setDraft({ ...draft, household: { ...draft.household, door_no: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Street</label>
                  <input
                    type="text"
                    placeholder="Street name"
                    className="mt-1 block w-full border rounded-md p-2"
                    value={draft.household.street || ''}
                    onChange={e => setDraft({ ...draft, household: { ...draft.household, street: e.target.value } })}
                  />
                </div>

                {/* ── Demographics ── */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Religion</label>
                  <select
                    className="mt-1 block w-full border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-accent"
                    value={draft.household.religion || ''}
                    onChange={e => setDraft({ ...draft, household: { ...draft.household, religion: e.target.value } })}
                  >
                    <option value="">Select religion...</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Christian">Christian</option>
                    <option value="Sikh">Sikh</option>
                    <option value="Buddhist">Buddhist</option>
                    <option value="Jain">Jain</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Community</label>
                  <select
                    className="mt-1 block w-full border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-accent"
                    value={draft.household.community || ''}
                    onChange={e => setDraft({ ...draft, household: { ...draft.household, community: e.target.value } })}
                  >
                    <option value="">Select community...</option>
                    <option value="BC">BC</option>
                    <option value="MBC">MBC</option>
                    <option value="SC">SC</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Economic Status</label>
                  <select
                    className="mt-1 block w-full border rounded-md p-2"
                    value={draft.household.economic_status || ''}
                    onChange={e => setDraft({ ...draft, household: { ...draft.household, economic_status: e.target.value as any } })}
                  >
                    <option value="">Select...</option>
                    <option value="BPL">BPL</option>
                    <option value="APL">APL</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div>
              <h2 className="text-lg font-bold border-b pb-2 mb-4">Family Members</h2>
              <p className="text-sm text-gray-500 mb-4">Add all members belonging to this household with their details.</p>
              <div className="space-y-4 mb-4">
                {draft.members.map((member, i) => (
                  <div key={member.id} className="border rounded-xl p-4 bg-gray-50 space-y-3">
                    {/* Member header */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-7 h-7 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                      <span className="text-sm font-semibold text-gray-600">Member {i + 1}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {/* Name */}
                      <div className="sm:col-span-2 md:col-span-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Full Name <span className="text-red-400">*</span></label>
                        <input
                          type="text"
                          className="block w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                          value={member.name || ''}
                          onChange={(e) => {
                            const newMembers = [...draft.members];
                            newMembers[i] = { ...newMembers[i], name: e.target.value };
                            setDraft({ ...draft, members: newMembers });
                          }}
                          placeholder="Enter full name"
                        />
                      </div>

                      {/* Relationship */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Relationship</label>
                        <select
                          className="block w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                          value={member.relationship || ''}
                          onChange={(e) => {
                            const newMembers = [...draft.members];
                            newMembers[i] = { ...newMembers[i], relationship: e.target.value };
                            setDraft({ ...draft, members: newMembers });
                          }}
                        >
                          <option value="">Select...</option>
                          <option value="Head of Family">Head of Family</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Husband">Husband</option>
                          <option value="Wife">Wife</option>
                          <option value="Son">Son</option>
                          <option value="Daughter">Daughter</option>
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Brother">Brother</option>
                          <option value="Sister">Sister</option>
                          <option value="Grandson">Grandson</option>
                          <option value="Granddaughter">Granddaughter</option>
                          <option value="Father-in-law">Father-in-law</option>
                          <option value="Mother-in-law">Mother-in-law</option>
                          <option value="Daughter-in-law">Daughter-in-law</option>
                          <option value="Son-in-law">Son-in-law</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Age */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Age</label>
                        <input
                          type="number"
                          min={0}
                          max={150}
                          className="block w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                          value={member.age ?? ''}
                          onChange={(e) => {
                            const newMembers = [...draft.members];
                            newMembers[i] = { ...newMembers[i], age: e.target.value === '' ? undefined : Number(e.target.value) };
                            setDraft({ ...draft, members: newMembers });
                          }}
                          placeholder="Age"
                        />
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Gender</label>
                        <select
                          className="block w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                          value={member.gender || ''}
                          onChange={(e) => {
                            const newMembers = [...draft.members];
                            newMembers[i] = { ...newMembers[i], gender: e.target.value as any };
                            setDraft({ ...draft, members: newMembers });
                          }}
                        >
                          <option value="">Select...</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Qualification */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Qualification</label>
                        <select
                          className="block w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                          value={member.qualification || ''}
                          onChange={(e) => {
                            const newMembers = [...draft.members];
                            newMembers[i] = { ...newMembers[i], qualification: e.target.value };
                            setDraft({ ...draft, members: newMembers });
                          }}
                        >
                          <option value="">Select...</option>
                          <option value="Illiterate">Illiterate</option>
                          <option value="Primary (1st to 5th)">Primary (1st to 5th)</option>
                          <option value="Middle (6th to 8th)">Middle (6th to 8th)</option>
                          <option value="High School (10th)">High School (10th)</option>
                          <option value="Higher Secondary (12th)">Higher Secondary (12th)</option>
                          <option value="Diploma">Diploma</option>
                          <option value="ITI">ITI</option>
                          <option value="Graduate / Bachelor's Degree">Graduate / Bachelor's Degree</option>
                          <option value="Post Graduate / Master's Degree">Post Graduate / Master's Degree</option>
                          <option value="Doctorate (Ph.D.)">Doctorate (Ph.D.)</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Marital Status */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Marital Status</label>
                        <select
                          className="block w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                          value={member.marital_status || ''}
                          onChange={(e) => {
                            const newMembers = [...draft.members];
                            newMembers[i] = { ...newMembers[i], marital_status: e.target.value as any };
                            setDraft({ ...draft, members: newMembers });
                          }}
                        >
                          <option value="">Select...</option>
                          <option value="Married">Married</option>
                          <option value="Unmarried">Unmarried</option>
                          <option value="Widow">Widow</option>
                          <option value="Child">Child</option>
                        </select>
                      </div>

                      {/* Occupation */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Occupation</label>
                        <input
                          type="text"
                          className="block w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                          value={member.occupation || ''}
                          onChange={(e) => {
                            const newMembers = [...draft.members];
                            newMembers[i] = { ...newMembers[i], occupation: e.target.value };
                            setDraft({ ...draft, members: newMembers });
                          }}
                          placeholder="e.g. Fisherman, Farmer"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={handleAddMember} className="text-accent text-sm font-medium hover:underline">+ Add Member</button>
            </div>
          )}

          {activeTab === 2 && (
            <div>
              <h2 className="text-lg font-bold border-b pb-2 mb-4">{TABS[activeTab]}</h2>
              {draft.members.length === 0 ? (
                <p className="text-sm text-gray-500">Please add family members in Tab 2 first.</p>
              ) : (
                <div className="space-y-6">
                  {draft.members.map(member => (
                    <div key={member.id} className="border rounded-xl p-4 bg-gray-50">
                      <h3 className="font-semibold text-primary mb-3 text-lg border-b pb-1">{member.name || 'Unnamed Member'}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {AVAILABLE_DOCS.map(doc => {
                          const isChecked = draft.documents[member.id!]?.[doc.id as keyof typeof draft.documents[string]] || false;
                          return (
                            <label key={doc.id} className="flex items-start gap-2 cursor-pointer group">
                              <div className="relative flex items-center mt-1">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                                  checked={isChecked as boolean}
                                  onChange={() => handleDocToggle(member.id!, 'documents', doc.id)}
                                />
                              </div>
                              <span className="text-sm text-gray-700 group-hover:text-gray-900 leading-tight pt-1">{doc.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 3 && (
            <div>
              <h2 className="text-lg font-bold border-b pb-2 mb-1">Corrections Required</h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '16px' }}>
                Only documents marked as available (in Tab 3) are shown here. Check a document and select the correction type(s) needed.
              </p>
              {draft.members.length === 0 ? (
                <p className="text-sm text-gray-500">Please add family members in Tab 2 first.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {draft.members.map(member => {
                    // Only show docs the member already has (checked in Documents Available)
                    const ownedDocs = AVAILABLE_DOCS.filter(
                      doc => !!(draft.documents[member.id!]?.[doc.id as keyof typeof draft.documents[string]])
                    );

                    return (
                      <div
                        key={member.id}
                        style={{ border: '1.5px solid #fed7aa', borderRadius: '12px', overflow: 'hidden' }}
                      >
                        {/* Member header */}
                        <div style={{ background: 'linear-gradient(135deg,#fff7ed,#ffedd5)', padding: '10px 16px', borderBottom: '1px solid #fed7aa' }}>
                          <h3 style={{ fontWeight: 700, color: '#9a3412', margin: 0, fontSize: '0.95rem' }}>
                            {member.name || 'Unnamed Member'}
                          </h3>
                        </div>

                        {/* Document list */}
                        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {ownedDocs.length === 0 ? (
                            <p style={{ fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
                              No documents selected in "Documents Available" for this member.
                            </p>
                          ) : (
                            ownedDocs.map(doc => {
                              const isMarked = isDocMarkedForCorrection(member.id!, doc.id);
                              const subCount = correctionSubCount(member.id!, doc.id);
                              const docCorrections = (draft.corrections?.[member.id!]?.[doc.id] as Record<string, boolean>) || {};

                              return (
                                <div
                                  key={doc.id}
                                  style={{
                                    border: isMarked ? '1.5px solid #f97316' : '1px solid #f1f5f9',
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                    background: isMarked ? '#fff7ed' : '#fafafa',
                                    transition: 'all 200ms ease',
                                  }}
                                >
                                  {/* Document row */}
                                  <label
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '10px',
                                      padding: '10px 14px',
                                      cursor: 'pointer',
                                      userSelect: 'none',
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isMarked}
                                      onChange={() => handleCorrectionDocToggle(member.id!, doc.id)}
                                      style={{ width: '16px', height: '16px', accentColor: '#f97316', flexShrink: 0 }}
                                    />
                                    <span style={{ fontWeight: isMarked ? 600 : 400, color: isMarked ? '#9a3412' : '#374151', fontSize: '0.88rem', flex: 1 }}>
                                      {doc.label}
                                    </span>
                                    {isMarked && subCount > 0 && (
                                      <span style={{
                                        background: '#f97316',
                                        color: 'white',
                                        borderRadius: '999px',
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        padding: '1px 8px',
                                        flexShrink: 0,
                                      }}>
                                        {subCount} type{subCount > 1 ? 's' : ''}
                                      </span>
                                    )}
                                    {isMarked && subCount === 0 && (
                                      <span style={{ fontSize: '0.72rem', color: '#f97316', fontStyle: 'italic', flexShrink: 0 }}>
                                        select type ↓
                                      </span>
                                    )}
                                  </label>

                                  {/* Correction sub-type menu — only shown when doc is checked */}
                                  {isMarked && (
                                    <div style={{
                                      borderTop: '1px dashed #fdba74',
                                      padding: '10px 14px 12px',
                                      background: 'rgba(255,237,213,0.5)',
                                    }}>
                                      <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#c2410c', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        What needs to be corrected?
                                      </p>
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {CORRECTION_TYPES.map(ct => {
                                          const isSubChecked = docCorrections[ct.id] === true;
                                          return (
                                            <label
                                              key={ct.id}
                                              style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '5px 12px',
                                                borderRadius: '999px',
                                                border: isSubChecked ? '1.5px solid #f97316' : '1.5px solid #e2e8f0',
                                                background: isSubChecked ? '#f97316' : 'white',
                                                color: isSubChecked ? 'white' : '#374151',
                                                cursor: 'pointer',
                                                fontSize: '0.78rem',
                                                fontWeight: isSubChecked ? 700 : 400,
                                                transition: 'all 150ms ease',
                                                userSelect: 'none',
                                              }}
                                            >
                                              <input
                                                type="checkbox"
                                                checked={isSubChecked}
                                                onChange={() => handleCorrectionSubToggle(member.id!, doc.id, ct.id)}
                                                style={{ display: 'none' }}
                                              />
                                              {isSubChecked && <span style={{ fontSize: '0.7rem' }}>✓</span>}
                                              {ct.label}
                                            </label>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 7 && (
            <div>
              <h2 className="text-lg font-bold border-b pb-2 mb-4">Corrections Made & New Docs Obtained</h2>
              {draft.members.length === 0 ? (
                <p className="text-sm text-gray-500">Please add family members in Tab 2 first.</p>
              ) : (
                <div className="space-y-6">
                  {draft.members.map(member => {
                    const memberCorrections = draft.corrections?.[member.id!] || {};
                    const docEntries = Object.entries(memberCorrections).filter(([_, subTypes]) => !!subTypes);

                    const memberNewDocs = draft.new_docs?.[member.id!] || {};
                    const newDocEntries = Object.entries(memberNewDocs).filter(([_, isNeeded]) => isNeeded);

                    if (docEntries.length === 0 && newDocEntries.length === 0) {
                      return (
                        <div key={member.id} className="border rounded-xl p-4 bg-gray-50">
                          <h3 className="font-semibold text-gray-800 mb-3">{member.name}</h3>
                          <p className="text-xs text-gray-400">No corrections or new documents required for this member.</p>
                        </div>
                      );
                    }

                    return (
                      <div key={member.id} className="border rounded-xl p-4 bg-gray-50">
                        <h3 className="font-semibold text-gray-800 mb-3">{member.name}</h3>
                        <div className="grid grid-cols-1 gap-5">
                          {docEntries.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-600 mb-2">Corrections Required:</h4>
                              <div className="grid grid-cols-1 gap-2">
                                {docEntries.map(([docId, subTypes]) => {
                                  const docLabel = AVAILABLE_DOCS.find(d => d.id === docId)?.label;
                                  return (
                                    <div key={docId} className="bg-white p-3 rounded border">
                                      <p className="text-sm font-semibold mb-2">{docLabel}</p>
                                      <div className="flex flex-wrap gap-2">
                                        {Object.entries(subTypes as Record<string, boolean>).filter(([_, checked]) => checked).map(([subId, _]) => {
                                          const made = draft.corrections_made?.[member.id!]?.[`${docId}__${subId}`] || false;
                                          return (
                                            <label key={subId} className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs cursor-pointer ${made ? 'bg-green-100 text-green-800' : 'bg-gray-100 hover:bg-gray-200'}`}>
                                              <input type="checkbox" checked={made} onChange={() => handleCorrectionMadeToggle(member.id!, docId, subId)} className="hidden" />
                                              {made && <span className="text-xs">✓</span>}
                                              {CORRECTION_TYPES.find(ct => ct.id === subId)?.label}
                                            </label>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {newDocEntries.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-600 mb-2">New Documents Needed:</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {newDocEntries.map(([docId, _]) => {
                                  const docLabel = AVAILABLE_DOCS.find(d => d.id === docId)?.label;
                                  const obtained = draft.corrections_made?.[member.id!]?.[`${docId}__new`] || false;
                                  return (
                                    <label key={docId} className={`flex items-center gap-2 p-3 rounded border cursor-pointer transition-colors ${obtained ? 'bg-green-50 border-green-200' : 'bg-white hover:bg-gray-50'}`}>
                                      <input type="checkbox" checked={obtained} onChange={() => handleCorrectionMadeToggle(member.id!, docId, 'new')} className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                                      <span className={`text-sm ${obtained ? 'text-green-800 font-medium' : 'text-gray-700'}`}>{docLabel}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 4 && (
            <div>
              <h2 className="text-lg font-bold border-b pb-2 mb-4">{TABS[activeTab]}</h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '16px' }}>
                Only documents <strong>not</strong> already marked as available (in Tab 3) are shown here.
              </p>
              {draft.members.length === 0 ? (
                <p className="text-sm text-gray-500">Please add family members in Tab 2 first.</p>
              ) : (
                <div className="space-y-6">
                  {draft.members.map(member => {
                    // Only show docs the member does NOT already have
                    const missingDocs = AVAILABLE_DOCS.filter(
                      doc => !(draft.documents[member.id!]?.[doc.id as keyof typeof draft.documents[string]])
                    );

                    return (
                      <div key={member.id} className="border rounded-xl p-4 bg-blue-50/50">
                        <h3 className="font-semibold text-blue-800 mb-3 text-lg border-b border-blue-100 pb-1">
                          {member.name || 'Unnamed Member'}
                        </h3>
                        {missingDocs.length === 0 ? (
                          <p style={{ fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
                            All documents are already marked as available for this member.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {missingDocs.map(doc => {
                              const isChecked = draft.new_docs?.[member.id!]?.[doc.id] || false;
                              return (
                                <label key={doc.id} className="flex items-start gap-2 cursor-pointer group">
                                  <div className="relative flex items-center mt-1">
                                    <input
                                      type="checkbox"
                                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                                      checked={isChecked as boolean}
                                      onChange={() => handleDocToggle(member.id!, 'new_docs', doc.id)}
                                    />
                                  </div>
                                  <span className="text-sm text-gray-700 group-hover:text-gray-900 leading-tight pt-1">{doc.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 5 && (
            <div>
              <h2 className="text-lg font-bold border-b pb-2 mb-4">{TABS[activeTab]}</h2>
              {draft.members.length === 0 ? (
                <p className="text-sm text-gray-500">Please add family members in Tab 2 first.</p>
              ) : (
                <div className="space-y-6">
                  {draft.members.map(member => (
                    <div key={member.id} className="border rounded-xl p-4 bg-purple-50/50">
                      <h3 className="font-semibold text-purple-800 mb-4 text-lg border-b border-purple-100 pb-1">{member.name || 'Unnamed Member'}</h3>

                      <div className="mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">Base Documents</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {BASE_DOCS.map(doc => {
                            const isChecked = draft.base_docs?.[member.id!]?.[doc.id] || false;
                            return (
                              <label key={doc.id} className="flex items-start gap-2 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 mt-1 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                                  checked={isChecked as boolean}
                                  onChange={() => handleDocToggle(member.id!, 'base_docs', doc.id)}
                                />
                                <span className="text-sm text-gray-700 group-hover:text-gray-900 pt-0.5">{doc.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Schemes Accessed</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {SCHEMES.map(scheme => {
                            const isChecked = draft.schemes?.[member.id!]?.[scheme.id] || false;
                            return (
                              <label key={scheme.id} className="flex items-start gap-2 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 mt-1 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                                  checked={isChecked as boolean}
                                  onChange={() => handleDocToggle(member.id!, 'schemes', scheme.id)}
                                />
                                <span className="text-sm text-gray-700 group-hover:text-gray-900 pt-0.5 leading-tight">{scheme.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 6 && (
            <div>
              <h2 className="text-lg font-bold border-b pb-2 mb-4">Remarks</h2>
              <textarea
                className="w-full border rounded-md p-3 h-32"
                placeholder="Enter any additional observations..."
                value={draft.household.remarks || ''}
                onChange={e => setDraft({ ...draft, household: { ...draft.household, remarks: e.target.value } })}
              ></textarea>
            </div>
          )}
        </div>

        {/* Footer Nav */}
        <div className="flex justify-between mt-6">
          <button
            onClick={prevTab}
            disabled={activeTab === 0}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={nextTab}
            disabled={activeTab === TABS.length - 1}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            Next Step
          </button>
        </div>
      </div>
    </div>
  );
}
