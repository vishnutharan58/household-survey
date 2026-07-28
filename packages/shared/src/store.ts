import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Session } from '@supabase/supabase-js';
import type { Household, Member, Documents } from './schemas';

interface AuthState {
  user: User | null;
  session: Session | null;
  role: 'admin' | 'staff' | null;
  hamlet_code: string | null;
  setAuth: (session: Session | null) => void;
  setHamletCode: (code: string) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  role: null,
  hamlet_code: null,
  setAuth: (session) => {
    if (!session) {
      set({ user: null, session: null, role: null, hamlet_code: null });
      return;
    }
    const user = session.user;
    const role = user.user_metadata?.role || null;
    const hamlet_code = user.user_metadata?.hamlet_code || null;
    
    set({ user, session, role, hamlet_code });
  },
  setHamletCode: (code) => set({ hamlet_code: code }),
  signOut: () => {
    set({ user: null, session: null, role: null, hamlet_code: null });
  }
}));


// Draft Survey Types
export interface DraftSurvey {
  id: string; // local uuid
  household: Partial<Household>;
  members: Partial<Member>[];
  documents: Record<string, Partial<Documents>>; // keyed by member id
  corrections: Record<string, any>;
  corrections_made: Record<string, any>;
  new_docs: Record<string, Record<string, boolean>>;
  base_docs: Record<string, Record<string, boolean>>;
  schemes: Record<string, Record<string, boolean>>;
  lastSavedAt: string;
  status: 'draft' | 'pending_sync' | 'synced';
}

interface DraftStoreState {
  drafts: Record<string, DraftSurvey>;
  saveDraft: (draft: DraftSurvey) => void;
  removeDraft: (id: string) => void;
  markAsPendingSync: (id: string) => void;
  markAsSynced: (id: string) => void;
  clearSynced: () => void;
}

export const useDraftStore = create<DraftStoreState>()(
  persist(
    (set) => ({
      drafts: {},
      saveDraft: (draft) => set((state) => ({
        drafts: {
          ...state.drafts,
          [draft.id]: {
            ...draft,
            lastSavedAt: new Date().toISOString()
          }
        }
      })),
      removeDraft: (id) => set((state) => {
        const newDrafts = { ...state.drafts };
        delete newDrafts[id];
        return { drafts: newDrafts };
      }),
      markAsPendingSync: (id) => set((state) => {
        const draft = state.drafts[id];
        if (!draft) return state;
        return {
          drafts: {
            ...state.drafts,
            [id]: { ...draft, status: 'pending_sync' }
          }
        };
      }),
      markAsSynced: (id) => set((state) => {
        const draft = state.drafts[id];
        if (!draft) return state;
        return {
          drafts: {
            ...state.drafts,
            [id]: { ...draft, status: 'synced' }
          }
        };
      }),
      clearSynced: () => set((state) => {
        const newDrafts = { ...state.drafts };
        Object.keys(newDrafts).forEach(key => {
          if (newDrafts[key].status === 'synced') {
            delete newDrafts[key];
          }
        });
        return { drafts: newDrafts };
      }),
    }),
    {
      name: 'survey-draft-storage',
    }
  )
);

// ─── Edit Request Types & Store ─────────────────────────────────────
export interface EditRequest {
  id: string;                    // request uuid (= survey id for simplicity)
  surveyId: string;
  staffEmail: string;
  householdNumber?: string;
  hamletCode?: string;
  requestedAt: string;           // ISO timestamp
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt?: string;
  reviewNote?: string;
}

interface EditRequestStoreState {
  requests: Record<string, EditRequest>; // keyed by surveyId
  requestEdit: (req: Omit<EditRequest, 'requestedAt' | 'status'>) => void;
  approveRequest: (surveyId: string, note?: string) => void;
  rejectRequest: (surveyId: string, note?: string) => void;
  clearRequest: (surveyId: string) => void;
}

export const useEditRequestStore = create<EditRequestStoreState>()(
  persist(
    (set) => ({
      requests: {},
      requestEdit: (req) => set((state) => ({
        requests: {
          ...state.requests,
          [req.surveyId]: {
            ...req,
            requestedAt: new Date().toISOString(),
            status: 'pending',
          },
        },
      })),
      approveRequest: (surveyId, note) => set((state) => {
        const r = state.requests[surveyId];
        if (!r) return state;
        return {
          requests: {
            ...state.requests,
            [surveyId]: { ...r, status: 'approved', reviewedAt: new Date().toISOString(), reviewNote: note },
          },
        };
      }),
      rejectRequest: (surveyId, note) => set((state) => {
        const r = state.requests[surveyId];
        if (!r) return state;
        return {
          requests: {
            ...state.requests,
            [surveyId]: { ...r, status: 'rejected', reviewedAt: new Date().toISOString(), reviewNote: note },
          },
        };
      }),
      clearRequest: (surveyId) => set((state) => {
        const next = { ...state.requests };
        delete next[surveyId];
        return { requests: next };
      }),
    }),
    { name: 'survey-edit-requests' }
  )
);

// ─── Leave Request Types & Store ─────────────────────────────────────
export interface LeaveRequest {
  id: string;
  staffEmail: string;
  staffName?: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  createdAt: string;
  updatedAt?: string;
}

interface LeaveRequestStoreState {
  leaveRequests: Record<string, LeaveRequest>; // keyed by request id
  submitLeaveRequest: (req: Omit<LeaveRequest, 'id' | 'createdAt' | 'status'> & { id?: string }) => LeaveRequest;
  approveLeaveRequest: (id: string, note?: string) => void;
  rejectLeaveRequest: (id: string, note?: string) => void;
  setLeaveRequests: (requests: LeaveRequest[]) => void;
}

export const useLeaveRequestStore = create<LeaveRequestStoreState>()(
  persist(
    (set) => ({
      leaveRequests: {},
      submitLeaveRequest: (req) => {
        const id = req.id || 'leave-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
        const newReq: LeaveRequest = {
          ...req,
          id,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          leaveRequests: {
            ...state.leaveRequests,
            [id]: newReq,
          },
        }));
        return newReq;
      },
      approveLeaveRequest: (id, note) => set((state) => {
        const req = state.leaveRequests[id];
        if (!req) return state;
        return {
          leaveRequests: {
            ...state.leaveRequests,
            [id]: {
              ...req,
              status: 'approved',
              adminNote: note,
              updatedAt: new Date().toISOString(),
            },
          },
        };
      }),
      rejectLeaveRequest: (id, note) => set((state) => {
        const req = state.leaveRequests[id];
        if (!req) return state;
        return {
          leaveRequests: {
            ...state.leaveRequests,
            [id]: {
              ...req,
              status: 'rejected',
              adminNote: note,
              updatedAt: new Date().toISOString(),
            },
          },
        };
      }),
      setLeaveRequests: (requests) => set(() => {
        const map: Record<string, LeaveRequest> = {};
        for (const req of requests) {
          map[req.id] = req;
        }
        return { leaveRequests: map };
      }),
    }),
    { name: 'staff-leave-requests' }
  )
);

