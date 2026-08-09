import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, initSupabase, getSupabase } from '@pro-vision-care/shared';
import Login from './pages/Login';
import StaffDashboard from './pages/Staff/StaffDashboard';
import SurveyForm from './pages/Staff/SurveyForm';
import AdminDashboard from './pages/Admin/AdminDashboard';

// Initialize Supabase. For dev, you can use anon keys.
// Replace these with actual Supabase URL and Key from env vars in production.
initSupabase(
  import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key'
);

function App() {
  const session = useAuthStore((state) => state.session);
  const role = useAuthStore((state) => state.role);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const supabase = getSupabase() as any;
    
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setAuth(session);
      setIsInitializing(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setAuth(session);
    });

    return () => subscription.unsubscribe();
  }, [setAuth]);

  if (isInitializing) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc', color: '#1B3A5C', fontWeight: 600, fontSize: '1.2rem' }}>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={!session ? <Login /> : <Navigate to={role === 'admin' ? '/admin' : '/staff'} replace />} 
        />
        <Route 
          path="/admin" 
          element={session && role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/staff" 
          element={session ? <StaffDashboard /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/staff/survey/new" 
          element={session ? <SurveyForm /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/staff/survey/:id" 
          element={session ? <SurveyForm /> : <Navigate to="/login" replace />} 
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
