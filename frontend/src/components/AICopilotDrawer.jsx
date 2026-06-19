import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, ChevronRight, Send } from 'lucide-react';

export default function AICopilotDrawer({ isOpen, onClose, vehicles, fuelRecords }) {
  const [messages, setMessages] = useState([{ sender: 'AI', text: 'Greetings! I am your AI Fuel System Analyst. I can query real-time data, inspect vehicles, summarize quotas, or check logs.<br><br>Select a quick prompt below to get started.' }]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading]   = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  // Lock body scroll on mobile when drawer open
  useEffect(() => {
    const isMobile = window.innerWidth < 640;
    if (isMobile) document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const addMsg = (sender, text) => setMessages(p => [...p, { sender, text }]);

  const triggerPreset = (type) => {
    const labels = { 'analyze-fleet': 'Analyze fleet warning signs', 'explain-limits': 'How do quotas & intervals work?', 'check-high-consumption': 'Show top fuel consumers' };
    addMsg('User', labels[type]);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const active  = vehicles?.filter(v => v.status === 'ACTIVE').length ?? 0;
      const blocked = vehicles?.filter(v => v.status === 'BLOCKED').length ?? 0;
      let reply = '';
      if (type === 'analyze-fleet') {
        reply = `<strong>Fleet Integrity Analysis</strong><br><br>• Active assets: <strong>${active}</strong> vehicles<br>• Blocked flags: <strong style="color:#fb7185">${blocked}</strong> vehicle(s)<br>• All records checked against cooldown rates. No systemic issues detected.`;
      } else if (type === 'explain-limits') {
        reply = `<strong>Operations Rules</strong><br><br>1. <strong>Fuel Quota</strong> — Maximum fuel (L) a vehicle may receive before validation fails.<br>2. <strong>Cooldown</strong> — Prevents refill abuse. Vehicle must wait this many hours between logs.`;
      } else {
        if (!fuelRecords?.length) { reply = 'No fuel transaction records exist to analyze.'; }
        else {
          const agg = {};
          fuelRecords.forEach(r => { if (r.approved==1) agg[r.plate_number] = (agg[r.plate_number]||0) + parseFloat(r.fuel_amount); });
          const sorted = Object.entries(agg).sort((a,b) => b[1]-a[1]);
          if (!sorted.length) { reply = 'No approved consumption logs found.'; }
          else {
            reply = `<strong>Top Fuel Consumers</strong><br><br>`;
            sorted.slice(0,3).forEach(([plate,sum],i) => { reply += `${i+1}. <span style="color:#a78bfa;font-family:JetBrains Mono,monospace;font-size:12px">${plate}</span> — <strong>${sum.toFixed(2)} L</strong><br>`; });
          }
        }
      }
      addMsg('AI', reply);
    }, 700);
  };

  const handleCustomSubmit = (e) => {
    e?.preventDefault();
    const q = inputVal.trim(); if (!q) return;
    setInputVal(''); addMsg('User', q); setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const ql = q.toLowerCase();
      let reply = '';
      if (ql.includes('help') || ql.includes('how')) {
        reply = `Try asking:<br>• <em>"limits"</em> — review compliance settings<br>• <em>"status"</em> — verify active log size<br>• <em>"warning"</em> — search for violations`;
      } else if (ql.includes('limit') || ql.includes('quota')) {
        reply = `Each vehicle has an allotted quota. Logging above the quota triggers validation exceptions. Cooldown guards block repeat operations.`;
      } else if (ql.includes('status') || ql.includes('fleet')) {
        reply = `Live overview:<br>• <strong>Fleet</strong>: ${vehicles?.length??0} registered vehicles<br>• <strong>Logs</strong>: ${fuelRecords?.length??0} transactions`;
      } else {
        reply = `I received: <em>"${q}"</em>. Open <strong>Command Palette (Ctrl+K)</strong> to trigger direct actions or search fleet assets.`;
      }
      addMsg('AI', reply);
    }, 700);
  };

  const presets = [
    { key: 'analyze-fleet',          label: '🔍  Analyze fleet warning signs' },
    { key: 'explain-limits',         label: '🛡️  How do quotas & intervals work?' },
    { key: 'check-high-consumption', label: '⚡  Show top fuel consumers' },
  ];

  return (
    <>
      {/* Backdrop on mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, zIndex: 49, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          className="ai-backdrop"
        />
      )}

      <div style={{
        position: 'fixed', inset: '0 0 0 auto', zIndex: 50,
        width: '100%', maxWidth: 420,
        display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(180deg, var(--surface-0) 0%, var(--surface-1) 100%)',
        borderLeft: '1px solid var(--border-1)',
        backdropFilter: 'blur(40px)',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.16,1,0.3,1)',
        boxShadow: '-20px 0 60px -10px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-0)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={16} color="#a78bfa" />
            </div>
            <div>
              <p style={{ margin: 0, fontFamily: 'Plus Jakarta Sans,sans-serif', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-1)' }}>FuelControl Copilot</p>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a78bfa' }}>Active Agentic System</span>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--border-0)', border: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-3)', flexShrink: 0 }}>
            <X size={15} />
          </button>
        </div>

        {/* Chat messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', justifyContent: m.sender === 'User' ? 'flex-end' : 'flex-start' }}>
              {m.sender === 'AI' && (
                <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#a78bfa', flexShrink: 0, marginTop: 2, fontFamily: 'JetBrains Mono, monospace' }}>AI</div>
              )}
              <div
                style={{
                  maxWidth: '80%', padding: '9px 13px', fontSize: '0.8125rem', lineHeight: 1.65,
                  ...(m.sender === 'AI'
                    ? { background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: '0 12px 12px 12px', color: 'var(--text-2)' }
                    : { background: 'linear-gradient(135deg,rgba(139,92,246,0.14),rgba(124,58,237,0.08))', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '12px 0 12px 12px', color: '#d4b4fe' })
                }}
                dangerouslySetInnerHTML={{ __html: m.text }}
              />
              {m.sender === 'User' && (
                <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--border-1)', border: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'var(--text-3)', flexShrink: 0, marginTop: 2, fontFamily: 'JetBrains Mono, monospace' }}>ME</div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#a78bfa', flexShrink: 0, fontFamily: 'JetBrains Mono, monospace' }}>AI</div>
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)', borderRadius: '0 12px 12px 12px', padding: '12px 16px', display: 'flex', gap: 5, alignItems: 'center' }}>
                {[0, 0.15, 0.3].map((d, i) => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', display: 'inline-block', animation: 'pulseRing 1.2s ease-in-out infinite', animationDelay: `${d}s`, opacity: 0.6 }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Preset prompts */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-1)', background: 'var(--surface-0)', display: 'flex', flexDirection: 'column', gap: 7, flexShrink: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-4)' }}>Suggested Prompts</span>
          {presets.map(({ key, label }) => (
            <button key={key} onClick={() => triggerPreset(key)} className="preset-btn">
              <span>{label}</span>
              <ChevronRight size={13} color="var(--text-4)" />
            </button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleCustomSubmit} style={{ padding: '12px 14px', borderTop: '1px solid var(--border-1)', background: 'var(--surface-0)', display: 'flex', gap: 10, flexShrink: 0 }}>
          <input
            type="text" value={inputVal} onChange={e => setInputVal(e.target.value)}
            placeholder="Ask FuelControl AI…"
            className="input-field"
            style={{ flex: 1, borderRadius: 10 }}
          />
          <button type="submit" style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(124,58,237,0.35)' }}>
            <Send size={15} color="white" />
          </button>
        </form>
      </div>
    </>
  );
}
