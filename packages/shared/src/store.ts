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
