import React, { useState, useEffect, useRef } from 'react';
import { Search, Droplet, BarChart3, Home, PlusCircle, Sparkles, Truck } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, currentView, setView, vehicles, preselectVehicle }) {
  const [query, setQuery]               = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef  = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (isOpen) { setQuery(''); setSelectedIndex(0); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      const items = getFiltered();
      if (!items.length) return;
      if (e.key === 'ArrowDown')  { e.preventDefault(); setSelectedIndex(p => (p+1) % items.length); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(p => (p-1+items.length) % items.length); }
      else if (e.key === 'Enter')   { e.preventDefault(); execute(items[selectedIndex]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, query, selectedIndex, vehicles]);

  useEffect(() => {
    if (resultsRef.current) {
      resultsRef.current.querySelector('.active-cmd')?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const getFiltered = () => {
    const q = query.toLowerCase().trim();
    const core = [
      { title: 'Log Fuel Request',          desc: 'Navigate to fuel request logs',           icon: Droplet,    action: () => setView('fuel') },
      { title: 'View Analytics Dashboard',  desc: 'Review fleet metrics and charts',          icon: BarChart3,  action: () => setView('dashboard') },
      { title: 'Navigate Home',             desc: 'Return to landing page',                  icon: Home,       action: () => setView('home') },
      { title: 'Register Vehicle',          desc: 'Add a new vehicle with quota rules',       icon: PlusCircle, action: () => { setView('dashboard'); setTimeout(() => document.getElementById('plateNumber')?.focus(), 300); } },
      { title: 'Talk to AI Copilot',        desc: 'Open the AI assistant side panel',         icon: Sparkles,   action: () => { onClose(); setTimeout(() => window.dispatchEvent(new CustomEvent('toggle-ai-drawer')), 100); } },
    ];
    const items = core.filter(a => !q || a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q));
    if (vehicles && q) {
      vehicles.forEach(v => {
        if (v.plate_number.toLowerCase().includes(q) || v.owner_name.toLowerCase().includes(q)) {
          items.push({
            title: `Vehicle: ${v.plate_number}`, desc: `Owner: ${v.owner_name} · Quota: ${v.fuel_quota}L · ${v.status}`,
            icon: Truck,
            action: () => { currentView === 'fuel' ? preselectVehicle(v.plate_number) : (setView('fuel'), setTimeout(() => preselectVehicle(v.plate_number), 300)); }
          });
        }
      });
    }
    return items;
  };

  const execute = (item) => { if (!item) return; item.action(); onClose(); };
  const filtered = getFiltered();
  if (!isOpen) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '14vh', padding: '14vh 16px 0' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="palette-overlay"
    >
      <div className="palette-card" style={{ width: '100%', maxWidth: 660, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Search size={16} color="#52525b" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef} type="text" value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Type a command or search vehicles…"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#f4f4f5', fontSize: '0.9375rem', fontFamily: 'Inter, sans-serif' }}
          />
          <kbd style={{ padding: '3px 8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, fontSize: 11, color: '#52525b', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>ESC</kbd>
        </div>

        {/* Results */}
        <div ref={resultsRef} style={{ maxHeight: 360, overflowY: 'auto', padding: '8px 8px' }}>
          {!filtered.length ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: '#3f3f46', fontSize: '0.875rem' }}>No commands matching "<span style={{ color: '#71717a' }}>{query}</span>"</div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const active = idx === selectedIndex;
              return (
                <div
                  key={idx}
                  onClick={() => execute(item)}
                  className={`palette-item${active ? ' active active-cmd' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', marginBottom: 2 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: active ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${active ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.06)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.1s ease' }}>
                      <Icon size={15} color={active ? '#a78bfa' : '#52525b'} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: active ? '#f4f4f5' : '#a1a1aa', lineHeight: 1.3 }}>{item.title}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#52525b', marginTop: 2 }}>{item.desc}</p>
                    </div>
                  </div>
                  {active && <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#a78bfa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Enter ↵</span>}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', background: 'rgba(4,4,10,0.5)' }}>
          <span style={{ fontSize: 11, color: '#3f3f46', fontFamily: 'JetBrains Mono, monospace' }}>↑↓ Navigate  ·  Enter Select  ·  Esc Close</span>
          <span style={{ fontSize: 11, color: '#3f3f46', fontFamily: 'JetBrains Mono, monospace' }}>FuelControl AI</span>
        </div>
      </div>
    </div>
  );
}
