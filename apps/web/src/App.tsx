// Removed unused React import
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, initSupabase } from '@pro-vision-care/shared';
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
