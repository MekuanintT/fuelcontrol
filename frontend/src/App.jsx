import React, { useState, useEffect } from 'react';
import { Menu, Search, Zap, X, LayoutDashboard, Droplet, Home, LogOut, LogIn } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import FuelRecords from './pages/FuelRecords';
import CommandPalette from './components/CommandPalette';
import AICopilotDrawer from './components/AICopilotDrawer';
import { ThemeProvider, useTheme } from './lib/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

function AppInner() {
  const { theme } = useTheme();
  const [token, setToken]     = useState(sessionStorage.getItem('token') || '');
  const [role, setRole]       = useState(sessionStorage.getItem('role') || 'OPERATOR');
  const [currentView, setView] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [vehicles, setVehicles]       = useState([]);
  const [fuelRecords, setFuelRecords] = useState([]);
  const [preselectedPlate, setPreselectedPlate] = useState('');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const isLoggedIn = !!token;

  // Close mobile menu on view change
  const navigate = (view) => { setView(view); setMobileMenuOpen(false); };

  useEffect(() => {
    if (isLoggedIn) { fetchVehicles(); fetchFuelRecords(); }
    else { setVehicles([]); setFuelRecords([]); }
  }, [token]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setCommandPaletteOpen(p => !p);
      }
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    const onAI = () => setAiDrawerOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('toggle-ai-drawer', onAI);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('toggle-ai-drawer', onAI); };
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

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
    setToken(t); setRole(r); navigate('dashboard');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token'); sessionStorage.removeItem('role');
    setToken(''); setRole('OPERATOR'); navigate('home');
  };

  const navLink = (view, label) => (
    <button
      onClick={() => navigate(view)}
      style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: '6px 4px',
        fontSize: '0.875rem', fontWeight: 500,
        color: currentView === view ? 'var(--nav-link-active)' : 'var(--nav-link-inactive)',
        borderBottom: currentView === view ? '1px solid #8b5cf6' : '1px solid transparent',
        transition: 'color 0.15s ease', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
      }}
    >{label}</button>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--space)' }}>
      {/* Background glows */}
      <div className="glow-spot" style={{ top: '-20%', left: '-10%', width: 600, height: 600, background: '#8b5cf6', opacity: theme === 'dark' ? 0.07 : 0.04 }} />
      <div className="glow-spot" style={{ bottom: '-20%', right: '-10%', width: 500, height: 500, background: '#3b82f6', opacity: theme === 'dark' ? 0.05 : 0.03 }} />

      {/* ── Navbar ── */}
      <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 40, padding: 0 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>

          {/* Logo */}
          <button onClick={() => navigate('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={14} color="white" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
              <span style={{ color: '#a78bfa' }}>Fuel</span>
              <span style={{ color: 'var(--text-1)' }}>Control</span>
            </span>
          </button>

          {/* Desktop nav */}
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {navLink('home', 'Home')}
            {isLoggedIn && navLink('dashboard', 'Dashboard')}
            {isLoggedIn && navLink('fuel', 'Fuel Records')}
            {isLoggedIn && (
              <button
                onClick={() => setCommandPaletteOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--border-0)', border: '1px solid var(--border-1)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: 'var(--text-3)', fontSize: 12, transition: 'all 0.15s ease', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}
              >
                <Search size={13} />
                <span>Search</span>
                <kbd style={{ background: 'var(--border-1)', border: '1px solid var(--border-2)', borderRadius: 4, padding: '1px 5px', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>⌘K</kbd>
              </button>
            )}
            <ThemeToggle />
            {isLoggedIn
              ? <button onClick={handleLogout} className="btn-danger" style={{ fontSize: '0.8125rem', padding: '6px 16px', whiteSpace: 'nowrap' }}>Logout</button>
              : <button onClick={() => navigate('login')} className="btn-primary" style={{ padding: '7px 20px', whiteSpace: 'nowrap' }}>Sign In</button>
            }
          </div>

          {/* Mobile right side */}
          <div className="mobile-nav-right" style={{ display: 'none', alignItems: 'center', gap: 8 }}>
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--toggle-bg)', border: '1px solid var(--toggle-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-2)' }}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu Overlay ── */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 39, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* ── Mobile Menu Drawer ── */}
      <div style={{
        position: 'fixed', top: 60, right: 0, bottom: 0, zIndex: 40,
        width: '80%', maxWidth: 300,
        background: 'var(--surface-1)',
        borderLeft: '1px solid var(--border-1)',
        transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.4)',
      }} className="mobile-menu-drawer">
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 4 }}>

          {/* Mobile search */}
          {isLoggedIn && (
            <button
              onClick={() => { setCommandPaletteOpen(true); setMobileMenuOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--border-0)', border: '1px solid var(--border-1)', borderRadius: 10, cursor: 'pointer', color: 'var(--text-3)', fontSize: 13, marginBottom: 8, fontFamily: 'Inter, sans-serif' }}
            >
              <Search size={15} />
              <span>Search…</span>
              <kbd style={{ marginLeft: 'auto', background: 'var(--border-1)', border: '1px solid var(--border-2)', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>⌘K</kbd>
            </button>
          )}

          {/* Mobile nav links */}
          {[
            { view: 'home', label: 'Home', icon: Home, always: true },
            { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, always: false },
            { view: 'fuel', label: 'Fuel Records', icon: Droplet, always: false },
          ].filter(l => l.always || isLoggedIn).map(({ view, label, icon: Icon }) => (
            <button
              key={view}
              onClick={() => navigate(view)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: currentView === view ? 'rgba(139,92,246,0.12)' : 'transparent',
                color: currentView === view ? '#a78bfa' : 'var(--text-2)',
                fontSize: 14, fontWeight: currentView === view ? 600 : 500,
                fontFamily: 'Inter, sans-serif', textAlign: 'left',
                borderLeft: currentView === view ? '2px solid #8b5cf6' : '2px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>

        {/* Mobile auth button */}
        <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid var(--border-1)' }}>
          {isLoggedIn ? (
            <button onClick={handleLogout} className="btn-danger" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 10, fontSize: 14 }}>
              <LogOut size={15} /> Logout
            </button>
          ) : (
            <button onClick={() => navigate('login')} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 10, fontSize: 14 }}>
              <LogIn size={15} /> Sign In
            </button>
          )}
        </div>
      </div>

      {/* ── Page Content ── */}
      <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px 32px', width: '100%' }}>
          {currentView === 'home'      && <LandingPage isLoggedIn={isLoggedIn} setView={navigate} />}
          {currentView === 'login'     && <div style={{ paddingTop: 32 }}><LoginPage API_BASE={API_BASE} onLoginSuccess={handleLoginSuccess} /></div>}
          {currentView === 'dashboard' && isLoggedIn && (
            <div style={{ paddingTop: 32 }}>
            <Dashboard API_BASE={API_BASE} token={token} role={role}
              vehicles={vehicles} reloadVehicles={fetchVehicles}
              fuelRecords={fuelRecords} reloadFuelRecords={fetchFuelRecords} />
            </div>
          )}
          {currentView === 'fuel' && isLoggedIn && (
            <div style={{ paddingTop: 32 }}>
            <FuelRecords API_BASE={API_BASE} token={token} role={role}
              vehicles={vehicles} fuelRecords={fuelRecords}
              reloadFuelRecords={fetchFuelRecords}
              preselectedPlate={preselectedPlate}
              clearPreselectedPlate={() => setPreselectedPlate('')} />
            </div>
          )}
        </div>
      </div>

      <footer style={{ borderTop: '1px solid var(--footer-border)', padding: '16px 24px', textAlign: 'center', fontSize: 12, color: 'var(--footer-text)', position: 'relative', zIndex: 1 }}>
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
  return <ThemeProvider><AppInner /></ThemeProvider>;
}
