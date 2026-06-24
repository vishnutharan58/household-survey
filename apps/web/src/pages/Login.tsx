import React, { useState } from 'react';
import { useAuthStore, getSupabase } from '@pro-vision-care/shared';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lang, setLang] = useState<'en' | 'ta'>('en');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(lang === 'en' ? error.message : 'உள்நுழைவதில் பிழை ஏற்பட்டது');
        return;
      }

      if (data.session) {
        const setAuth = useAuthStore.getState().setAuth;
        setAuth(data.session);
        const role = data.session.user.user_metadata?.role;
        if (role === 'admin') navigate('/admin');
        else navigate('/staff');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const texts = {
    en: {
      subtitle: 'Community Organizer',
      email: 'Email Address',
      password: 'Password',
      login: 'Sign In',
      loading: 'Signing in...',
      hint: 'Coastal Community Access to Rights and Entitlement',
    },
    ta: {
      subtitle: 'சமூக அமைப்பாளர்',
      email: 'மின்னஞ்சல்',
      password: 'கடவுச்சொல்',
      login: 'உள்நுழைய',
      loading: 'உள்நுழைகிறது...',
      hint: 'கடலோர சமூக உரிமைகள் மற்றும் வாழ்வுரிமைக்கான அணுகல்',
    }
  };

  const t = texts[lang];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative bg-animated-gradient">
      {/* Floating orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Card */}
      <div className="glass-card w-full max-w-md px-8 py-10 relative z-10 animate-fade-in-up">

        {/* Language toggle */}
        <div className="flex justify-end mb-6">
          <div className="lang-toggle">
            <button id="lang-en" onClick={() => setLang('en')} className={`lang-btn ${lang === 'en' ? 'active' : ''}`}>English</button>
            <button id="lang-ta" onClick={() => setLang('ta')} className={`lang-btn ${lang === 'ta' ? 'active' : ''}`}>தமிழ்</button>
          </div>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div style={{ position: 'absolute', inset: '-6px', borderRadius: '9999px', background: 'linear-gradient(135deg, #2A9D8F, #1B3A5C)', opacity: 0.25, filter: 'blur(8px)' }} />
            <img
              src="/logo.jpeg"
              alt="Coastal Community Access to Rights and Entitlement Logo"
              className="logo-glow relative"
              style={{ height: '88px', width: 'auto', objectFit: 'contain', borderRadius: '9999px', border: '3px solid rgba(42,157,143,0.3)', background: 'white', padding: '4px' }}
            />
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1B3A5C', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0, lineHeight: 1.2, textAlign: 'center' }}>{t.subtitle}</h1>
          <p style={{ fontSize: '0.85rem', fontWeight: 500, color: '#2A9D8F', margin: '6px 0 0', letterSpacing: '-0.01em', textAlign: 'center', lineHeight: 1.3 }}>{t.hint}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠</span> {error}
            </div>
          )}

          <div>
            <label htmlFor="login-email" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>{t.email}</label>
            <input id="login-email" type="email" required className="input-premium" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>

          <div>
            <label htmlFor="login-password" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>{t.password}</label>
            <input id="login-password" type="password" required className="input-premium" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '14px' }}
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                {t.loading}
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>
                </svg>
                {t.login}
              </>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#cbd5e1', marginTop: '24px' }}>
          Tamil Nadu Coastal Community Survey — Secured Portal
        </p>
      </div>
    </div>
  );
}
