import React, { useState, useEffect } from 'react';
import { Droplet, Send, RotateCcw, History, Sparkles, Trash2 } from 'lucide-react';

const SectionHeader = ({ icon: Icon, color, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={16} color={color} />
    </div>
    <h3 style={{ margin: 0, fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: '0.9375rem', color: '#f4f4f5' }}>{title}</h3>
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
    } finally {
      setIsSubmitting(false);
    }
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
  const labelStyle = { fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#52525b' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem,3vw,2.25rem)', color: '#f4f4f5', letterSpacing: '-0.02em' }}>Fuel Records</h1>
          <p style={{ margin: 0, color: '#71717a', fontSize: '0.875rem' }}>Submit fuel requests and review recent transaction logs.</p>
        </div>
        <button onClick={() => window.dispatchEvent(new CustomEvent('toggle-ai-drawer'))} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 10 }}>
          <Sparkles size={15} color="#a78bfa" />
          <span style={{ fontSize: '0.875rem' }}>AI Copilot</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16, alignItems: 'start' }}>
        {/* Form */}
        <div className="card-glass" style={{ padding: 24 }}>
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
              <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'11px 16px',borderRadius:10,opacity:isSubmitting?0.65:1 }}>
                <Send size={14} /> {isSubmitting ? 'Logging…' : 'Submit'}
              </button>
              <button type="button" onClick={() => { setSelectedPlate(''); setFuelAmount(''); setAlert({ show:false,type:'',message:'' }); }} className="btn-ghost" style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'11px 16px',borderRadius:10 }}>
                <RotateCcw size={14} /> Reset
              </button>
            </div>
            {alert.show && <div className={alertClass}>{alert.message}</div>}
          </form>
        </div>

        {/* Table */}
        <div className="card-glass" style={{ padding: 24 }}>
          <SectionHeader icon={History} color="#60a5fa" title="Fuel Transactions Log" />
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Plate</th>
                  <th>Amount</th>
                  <th>Time</th>
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
                      <td style={{ color:'#3f3f46', fontFamily:'JetBrains Mono,monospace', fontSize:12 }}>{r.id}</td>
                      <td><span className="plate-chip">{r.plate_number}</span></td>
                      <td style={{ color:'#e4e4e7', fontWeight:600 }}>{parseFloat(r.fuel_amount).toFixed(2)} L</td>
                      <td style={{ color:'#71717a', fontSize:12 }}>{d.toLocaleString()}</td>
                      <td><span className={approved ? 'badge badge-approved' : 'badge badge-rejected'}>{approved ? 'Approved' : 'Rejected'}</span></td>
                      <td style={{ fontSize:12 }}>
                        {r.rejection_reason
                          ? <span style={{ color:'#fb7185' }}>{r.rejection_reason}</span>
                          : <span style={{ color:'#3f3f46' }}>—</span>}
                      </td>
                      {role === 'ADMIN' && (
                        <td style={{ textAlign:'right' }}>
                          <button onClick={() => handleDelete(r.id)} style={{ display:'inline-flex',alignItems:'center',gap:5,padding:'5px 12px',background:'rgba(251,113,133,0.07)',border:'1px solid rgba(251,113,133,0.18)',borderRadius:7,color:'#fb7185',fontSize:12,cursor:'pointer',fontWeight:500 }}>
                            <Trash2 size={12} /> Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={role==='ADMIN' ? 7 : 6} style={{ textAlign:'center', padding:'32px 0', color:'#3f3f46' }}>
                      No transactions logged.
                    </td>
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
