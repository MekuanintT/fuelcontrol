import React from 'react';
import { ArrowRight, Check, ShieldCheck, Terminal, Sparkles, Activity, Zap } from 'lucide-react';

export default function LandingPage({ isLoggedIn, setView }) {
  const features = [
    { icon: ShieldCheck, color: '#a78bfa', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)', title: 'Quota Safeguards', desc: 'Automatic validation checks daily quotas and cooling-off intervals to prevent unauthorized distribution.' },
    { icon: Terminal,    color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.2)',  title: 'Command Palette', desc: 'Press Ctrl+K to search assets, request fuel, and run actions from anywhere instantly.' },
    { icon: Sparkles,   color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)',  title: 'AI Copilot Sidecar', desc: 'Context-aware AI predictions analyze refill rates, flag blocked operators, and suggest repairs.' },
  ];

  const checks = [
    'Real-time fuel transaction verification',
    'Interactive fleet quota thresholds',
    'Anti-abuse waiting interval checking',
    'Contextual AI command interface',
  ];

  return (
    <div style={{ paddingTop: 40 }}>

      {/* ── Hero ── */}
      <div className="landing-hero">

        {/* Left: copy */}
        <div className="hero-copy" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Badge */}
          <div className="hero-badge" style={{ display: 'inline-flex', width: 'fit-content', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', display: 'inline-block', animation: 'pulseRing 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a78bfa' }}>Version 2026.1 Release</span>
          </div>

          {/* Heading */}
          <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 5vw, 3.75rem)', lineHeight: 1.05, fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-1)' }}>
            Smart Fleet<br />
            <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 40%, #60a5fa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Fuel Automation
            </span>
          </h1>

          <p style={{ margin: 0, color: 'var(--text-3)', fontSize: 'clamp(0.9375rem, 2vw, 1.125rem)', lineHeight: 1.7, maxWidth: 480 }}>
            Optimize your fleet's runtime efficiency. Log fuel consumption, track custom limits, and safeguard resources with an AI-guided control center.
          </p>

          <div className="hero-btns" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => setView(isLoggedIn ? 'dashboard' : 'login')}
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.9375rem', padding: '12px 28px' }}
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Get Started'}
              <ArrowRight size={16} />
            </button>
            {isLoggedIn && (
              <button
                onClick={() => setView('fuel')}
                className="btn-ghost"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.9375rem', padding: '12px 24px' }}
              >
                View Fuel Records
              </button>
            )}
          </div>
        </div>

        {/* Right: status card */}
        <div className="card-glass" style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 18, borderBottom: '1px solid var(--border-1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Activity size={17} color="#a78bfa" />
              </div>
              <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-1)' }}>System Status</span>
            </div>
            <span className="badge badge-active">
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block', animation: 'pulseRing 2s infinite' }} />
              Live
            </span>
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {checks.map(c => (
              <li key={c} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <Check size={11} color="#34d399" strokeWidth={3} />
                </div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Feature cards ── */}
      <div style={{ marginTop: 64 }}>
        <p className="section-label" style={{ marginBottom: 20 }}>AI-Native Features</p>
        <div className="features-grid">
          {features.map(({ icon: Icon, color, bg, border, title, desc }) => (
            <div key={title} className="card-glass" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color={color} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 8px', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--text-1)' }}>{title}</h4>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-3)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
