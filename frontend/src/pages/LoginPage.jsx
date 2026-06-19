import React, { useState } from 'react';
import { User, Lock, ArrowRight, Zap } from 'lucide-react';

export default function LoginPage({ API_BASE, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const d = await r.json();
      if (!r.ok || d.success === false) throw new Error(d.message || 'Invalid credentials');
      onLoginSuccess(d.token, d.role);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '16px' }}>
      <div className="card-glass login-card" style={{ width: '100%', maxWidth: 440, padding: 'clamp(24px, 5vw, 40px)', position: 'relative' }}>

        {/* Glow accent */}
        <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 120, height: 120, background: '#7c3aed', borderRadius: '50%', filter: 'blur(60px)', opacity: 0.15, pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28, gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(124,58,237,0.4)', flexShrink: 0 }}>
            <Zap size={22} color="white" strokeWidth={2.5} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 4px', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 'clamp(1.375rem, 4vw, 1.625rem)', color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
              Welcome back
            </h2>
            <p style={{ margin: 0, color: 'var(--text-3)', fontSize: '0.875rem' }}>Sign in to your fleet dashboard</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Username */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-4)' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={15} color="var(--text-4)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="e.g. admin" required className="input-field"
                style={{ paddingLeft: 38 }}
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-4)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="var(--text-4)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required className="input-field"
                style={{ paddingLeft: 38 }}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit" disabled={loading} className="btn-primary"
            style={{ marginTop: 8, padding: '13px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, opacity: loading ? 0.65 : 1, fontSize: '0.9375rem' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
            <ArrowRight size={16} />
          </button>

          {error && <div className="alert-error">{error}</div>}
        </form>
      </div>
    </div>
  );
}
