import React, { useState, useEffect } from 'react';
import { Droplet, Send, RotateCcw, History, Sparkles, Trash2 } from 'lucide-react';

const SectionHeader = ({ icon: Icon, color, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={16} color={color} />
    </div>
    <h3 style={{ margin: 0, fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-1)' }}>{title}</h3>
  </div>
);

export default function FuelRecords({ API_BASE, token, role, vehicles, fuelRecords, reloadFuelRecords, preselectedPlate, clearPreselectedPlate }) {
  const [selectedPlate, setSelectedPlate] = useState('');
  const [fuelAmount, setFuelAmount]       = useState('');
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [alert, setAlert]                 = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    if (preselectedPlate) {
      setSelectedPlate(preselectedPlate);
      clearPreselectedPlate();
      setTimeout(() => document.getElementById('fuelAmount')?.focus(), 50);
    }
  }, [preselectedPlate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ show: false, type: '', message: '' });
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/fuel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plate_number: selectedPlate, fuel_amount: parseFloat(fuelAmount) }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Server error');
      const approved = d.approved ?? false;
      setAlert({ show: true, type: approved ? 'success' : 'warning', message: d.message });
      if (approved) setFuelAmount('');
      await reloadFuelRecords();
    } catch (err) {
      setAlert({ show: true, type: 'error', message: err.message });
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction record?')) return;
    try {
      const res = await fetch(`${API_BASE}/fuel/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || 'Deletion failed');
      await reloadFuelRecords();
    } catch (err) { alert(err.message); }
  };

  const alertClass = alert.type === 'success' ? 'alert-success' : alert.type === 'warning' ? 'alert-warning' : 'alert-error';
  const labelStyle = { fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-4)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: 20, borderBottom: '1px solid var(--border-1)', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem,3vw,2.25rem)', color: 'var(--text-1)', letterSpacing: '-0.02em' }}>Fuel Records</h1>
          <p style={{ margin: 0, color: 'var(--text-3)', fontSize: '0.875rem' }}>Submit fuel requests and review transaction logs.</p>
        </div>
        <button onClick={() => window.dispatchEvent(new CustomEvent('toggle-ai-drawer'))} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 10, whiteSpace: 'nowrap' }}>
          <Sparkles size={15} color="#a78bfa" />
          <span style={{ fontSize: '0.875rem' }}>AI Copilot</span>
        </button>
      </div>

      {/* Fuel form + table — stacks on mobile */}
      <div className="fuel-grid">

        {/* Form */}
        <div className="card-glass" style={{ padding: 20 }}>
          <SectionHeader icon={Droplet} color="#a78bfa" title="Request Fuel" />
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>Select Vehicle</label>
              <select value={selectedPlate} onChange={e => setSelectedPlate(e.target.value)} required className="input-field" style={{ cursor: 'pointer' }}>
                <option value="" disabled>Select plate number…</option>
                {vehicles?.map(v => (
                  <option key={v.id} value={v.plate_number}>
                    {v.plate_number} ({v.owner_name}){v.status === 'BLOCKED' ? ' [BLOCKED]' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>Fuel Amount (L)</label>
              <input id="fuelAmount" type="number" step="0.01" value={fuelAmount} onChange={e => setFuelAmount(e.target.value)} placeholder="e.g. 45.50" required className="input-field" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
              <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'11px 12px',borderRadius:10,opacity:isSubmitting?0.65:1,fontSize:'0.8125rem' }}>
                <Send size={14} /> {isSubmitting ? 'Logging…' : 'Submit'}
              </button>
              <button type="button" onClick={() => { setSelectedPlate(''); setFuelAmount(''); setAlert({ show:false,type:'',message:'' }); }} className="btn-ghost" style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'11px 12px',borderRadius:10,fontSize:'0.8125rem' }}>
                <RotateCcw size={14} /> Reset
              </button>
            </div>
            {alert.show && <div className={alertClass}>{alert.message}</div>}
          </form>
        </div>

        {/* Transaction table */}
        <div className="card-glass" style={{ padding: 20, minWidth: 0 }}>
          <SectionHeader icon={History} color="#60a5fa" title="Fuel Transactions Log" />
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="tbl" style={{ minWidth: 520 }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Plate</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Amount</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Time</th>
                  <th>Status</th>
                  <th>Reason</th>
                  {role === 'ADMIN' && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {fuelRecords?.length ? fuelRecords.map(r => {
                  const approved = r.approved === true;
                  const d = new Date(r.fuel_time);
                  return (
                    <tr key={r.id}>
                      <td style={{ color:'var(--text-4)', fontFamily:'JetBrains Mono,monospace', fontSize:12 }}>{r.id}</td>
                      <td><span className="plate-chip">{r.plate_number}</span></td>
                      <td style={{ color:'var(--text-1)', fontWeight:600, whiteSpace:'nowrap' }}>{parseFloat(r.fuel_amount).toFixed(2)} L</td>
                      <td style={{ color:'var(--text-3)', fontSize:12, whiteSpace:'nowrap' }}>{d.toLocaleString()}</td>
                      <td><span className={approved ? 'badge badge-approved' : 'badge badge-rejected'}>{approved ? 'Approved' : 'Rejected'}</span></td>
                      <td style={{ fontSize:12, maxWidth: 160 }}>
                        {r.rejection_reason
                          ? <span style={{ color:'#fb7185' }}>{r.rejection_reason}</span>
                          : <span style={{ color:'var(--text-4)' }}>—</span>}
                      </td>
                      {role === 'ADMIN' && (
                        <td style={{ textAlign:'right' }}>
                          <button onClick={() => handleDelete(r.id)} style={{ display:'inline-flex',alignItems:'center',gap:4,padding:'5px 10px',background:'rgba(251,113,133,0.07)',border:'1px solid rgba(251,113,133,0.18)',borderRadius:7,color:'#fb7185',fontSize:12,cursor:'pointer',fontWeight:500,whiteSpace:'nowrap' }}>
                            <Trash2 size={11} /> Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={role==='ADMIN' ? 7 : 6} style={{ textAlign:'center', padding:'32px 0', color:'var(--text-4)' }}>No transactions logged.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
