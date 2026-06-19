import React, { useState, useEffect, useRef } from 'react';
import { Search, Droplet, BarChart3, Home, PlusCircle, Sparkles, Truck } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, currentView, setView, vehicles, preselectVehicle }) {
  const [query, setQuery]               = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef   = useRef(null);
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
      else if (e.key === 'Escape')  { onClose(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, query, selectedIndex, vehicles]);

  useEffect(() => {
    resultsRef.current?.querySelector('.active-cmd')?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const getFiltered = () => {
    const q = query.toLowerCase().trim();
    const core = [
      { title: 'Log Fuel Request',         desc: 'Navigate to fuel request logs',        icon: Droplet,    action: () => setView('fuel') },
      { title: 'View Analytics Dashboard', desc: 'Review fleet metrics and charts',       icon: BarChart3,  action: () => setView('dashboard') },
      { title: 'Navigate Home',            desc: 'Return to landing page',               icon: Home,       action: () => setView('home') },
      { title: 'Register Vehicle',         desc: 'Add a new vehicle with quota rules',    icon: PlusCircle, action: () => { setView('dashboard'); setTimeout(() => document.getElementById('plateNumber')?.focus(), 300); } },
      { title: 'Talk to AI Copilot',       desc: 'Open the AI assistant side panel',      icon: Sparkles,   action: () => { onClose(); setTimeout(() => window.dispatchEvent(new CustomEvent('toggle-ai-drawer')), 100); } },
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
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '10vh', padding: '10vh 12px 0' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="palette-overlay"
    >
      <div className="palette-card" style={{ width: '100%', maxWidth: 640, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: '1px solid var(--border-1)' }}>
          <Search size={15} color="var(--text-4)" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef} type="text" value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Type a command or search vehicles…"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text-1)', fontSize: '0.9375rem', fontFamily: 'Inter, sans-serif', minWidth: 0 }}
          />
          <kbd style={{ padding: '3px 8px', background: 'var(--border-1)', border: '1px solid var(--border-2)', borderRadius: 6, fontSize: 11, color: 'var(--text-4)', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>ESC</kbd>
        </div>

        {/* Results */}
        <div ref={resultsRef} style={{ maxHeight: '55vh', overflowY: 'auto', padding: '6px 8px' }}>
          {!filtered.length ? (
            <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--text-4)', fontSize: '0.875rem' }}>
              No commands matching "<span style={{ color: 'var(--text-3)' }}>{query}</span>"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const active = idx === selectedIndex;
              return (
                <div
                  key={idx}
                  onClick={() => execute(item)}
                  className={`palette-item${active ? ' active active-cmd' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 10px', marginBottom: 2 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: active ? 'rgba(139,92,246,0.15)' : 'var(--border-0)', border: `1px solid ${active ? 'rgba(139,92,246,0.3)' : 'var(--border-1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.1s ease' }}>
                      <Icon size={14} color={active ? '#a78bfa' : 'var(--text-4)'} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: active ? 'var(--text-1)' : 'var(--text-2)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-4)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.desc}</p>
                    </div>
                  </div>
                  {active && <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#a78bfa', letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0, marginLeft: 8 }}>Enter ↵</span>}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border-1)', display: 'flex', justifyContent: 'space-between', background: 'var(--surface-0)', flexWrap: 'wrap', gap: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-4)', fontFamily: 'JetBrains Mono, monospace' }}>↑↓ Navigate · Enter Select · Esc Close</span>
          <span style={{ fontSize: 11, color: 'var(--text-4)', fontFamily: 'JetBrains Mono, monospace' }}>FuelControl AI</span>
        </div>
      </div>
    </div>
  );
}
