import React, { useState, useEffect } from 'react';
import { Menu, Search, Sparkles, Zap } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import FuelRecords from './pages/FuelRecords';
import CommandPalette from './components/CommandPalette';
import AICopilotDrawer from './components/AICopilotDrawer';
import { ThemeProvider, useTheme } from './lib/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

const API_BASE = "http://localhost:5000/api";

function AppInner() {
  const { theme } = useTheme();
  const [token, setToken]   = useState(sessionStorage.getItem('token') || '');
  const [role, setRole]     = useState(sessionStorage.getItem('role') || 'OPERATOR');
  const [currentView, setView] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [vehicles, setVehicles]       = useState([]);
  const [fuelRecords, setFuelRecords] = useState([]);
  const [preselectedPlate, setPreselectedPlate] = useState('');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const isLoggedIn = !!token;

  useEffect(() => {
    if (isLoggedIn) { fetchVehicles(); fetchFuelRecords(); }
    else { setVehicles([]); setFuelRecords([]); }
  }, [token]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(p => !p);
      }
    };
    const onAI = () => setAiDrawerOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('toggle-ai-drawer', onAI);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('toggle-ai-drawer', onAI);
    };
  }, []);

  const fetchVehicles = async () => {
    try {
      const r = await fetch(`${API_BASE}/vehicles`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (r.ok && d.success) setVehicles(d.data);
    } catch (e) { console.error(e); }
  };

  const fetchFuelRecords = async () => {
    try {
      const r = await fetch(`${API_BASE}/fuel`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (r.ok && d.success) setFuelRecords(d.data);
    } catch (e) { console.error(e); }
  };

  const handleLoginSuccess = (t, r) => {
    sessionStorage.setItem('token', t); sessionStorage.setItem('role', r);
    setToken(t); setRole(r); setView('dashboard');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token'); sessionStorage.removeItem('role');
    setToken(''); setRole('OPERATOR'); setView('home');
  };

  const navLink = (view, label) => (
    <button
      onClick={() => setView(view)}
      style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: '6px 4px',
        fontSize: '0.875rem', fontWeight: 500,
        color: currentView === view ? 'var(--nav-link-active)' : 'var(--nav-link-inactive)',
        borderBottom: currentView === view ? '1px solid #8b5cf6' : '1px solid transparent',
        transition: 'color 0.15s ease',
        fontFamily: 'Inter, sans-serif',
      }}
    >{label}</button>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--space)' }}>
      <div className="glow-spot" style={{ top: '-20%', left: '-10%', width: 600, height: 600, background: '#8b5cf6', opacity: theme === 'dark' ? 0.07 : 0.04 }} />
      <div className="glow-spot" style={{ bottom: '-20%', right: '-10%', width: 500, height: 500, background: '#3b82f6', opacity: theme === 'dark' ? 0.05 : 0.03 }} />

      <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 40, padding: '0 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={14} color="white" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
              <span style={{ color: '#a78bfa' }}>Fuel</span>
              <span style={{ color: 'var(--text-1)' }}>Control</span>
            </span>
          </button>

          {/* Nav links + actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="hidden md:flex">
            {navLink('home', 'Home')}
            {isLoggedIn && navLink('dashboard', 'Dashboard')}
            {isLoggedIn && navLink('fuel', 'Fuel Records')}
            {isLoggedIn && (
              <button
                onClick={() => setCommandPaletteOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'var(--border-0)', border: '1px solid var(--border-1)',
                  borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                  color: 'var(--text-3)', fontSize: 12, transition: 'all 0.15s ease',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                <Search size={13} />
                <span>Search</span>
                <kbd style={{ background: 'var(--border-1)', border: '1px solid var(--border-2)', borderRadius: 4, padding: '1px 5px', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>⌘K</kbd>
              </button>
            )}

            {/* Theme toggle */}
            <ThemeToggle />

            {isLoggedIn ? (
              <button onClick={handleLogout} className="btn-danger" style={{ fontSize: '0.8125rem', padding: '6px 16px' }}>Logout</button>
            ) : (
              <button onClick={() => setView('login')} className="btn-primary" style={{ padding: '7px 20px' }}>Sign In</button>
            )}
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }} className="md:hidden-btn">
            <Menu size={20} />
          </button>
        </div>
      </nav>

      <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px', width: '100%' }}>
          {currentView === 'home'      && <LandingPage isLoggedIn={isLoggedIn} setView={setView} />}
          {currentView === 'login'     && <LoginPage API_BASE={API_BASE} onLoginSuccess={handleLoginSuccess} />}
          {currentView === 'dashboard' && isLoggedIn && (
            <Dashboard API_BASE={API_BASE} token={token} role={role}
              vehicles={vehicles} reloadVehicles={fetchVehicles}
              fuelRecords={fuelRecords} reloadFuelRecords={fetchFuelRecords} />
          )}
          {currentView === 'fuel' && isLoggedIn && (
            <FuelRecords API_BASE={API_BASE} token={token} role={role}
              vehicles={vehicles} fuelRecords={fuelRecords}
              reloadFuelRecords={fetchFuelRecords}
              preselectedPlate={preselectedPlate}
              clearPreselectedPlate={() => setPreselectedPlate('')} />
          )}
        </div>
      </div>

      <footer style={{ borderTop: '1px solid var(--footer-border)', padding: '20px 24px', textAlign: 'center', fontSize: 12, color: 'var(--footer-text)', position: 'relative', zIndex: 1 }}>
        © 2026 FuelControl — Enterprise Fleet Compliance
      </footer>

      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)}
        currentView={currentView} setView={setView} vehicles={vehicles}
        preselectVehicle={(plate) => { setPreselectedPlate(plate); setView('fuel'); }} />

      <AICopilotDrawer isOpen={aiDrawerOpen} onClose={() => setAiDrawerOpen(false)}
        vehicles={vehicles} fuelRecords={fuelRecords} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
