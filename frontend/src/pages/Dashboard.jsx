import React, { useState, useEffect, useRef } from 'react';
import { Droplet, ShieldAlert, Truck, BarChart3, ListFilter, Sparkles, PlusCircle, Save, ArrowRight, Pencil, Trash2 } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SectionHeader = ({ icon: Icon, color, title, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={16} color={color} />
      </div>
      <h3 style={{ margin: 0, fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-1)' }}>{title}</h3>
    </div>
    {children}
  </div>
);

export default function Dashboard({ API_BASE, token, role, vehicles, reloadVehicles, fuelRecords, reloadFuelRecords }) {
  const [totalFuelToday, setTotalFuelToday] = useState('0.00 L');
  const [rejectedCount, setRejectedCount]   = useState(0);
  const [vehicleId, setVehicleId]           = useState('');
  const [plateNumber, setPlateNumber]       = useState('');
  const [ownerName, setOwnerName]           = useState('');
  const [fuelQuota, setFuelQuota]           = useState('');
  const [waitingHours, setWaitingHours]     = useState('');
  const [statusSelect, setStatusSelect]     = useState('ACTIVE');
  const [formError, setFormError]           = useState('');
  const [formOpen, setFormOpen]             = useState(false);
  const formRef = useRef(null);

  useEffect(() => { calculateMetrics(); }, [fuelRecords]);

  const calculateMetrics = () => {
    if (!fuelRecords?.length) { setTotalFuelToday('0.00 L'); setRejectedCount(0); return; }
    const todayStr = new Date().toDateString();
    let total = 0, rejected = 0;
    fuelRecords.forEach(r => {
      const t = new Date(r.fuel_time);
      if (t.toDateString() === todayStr && r.approved === true) total += parseFloat(r.fuel_amount);
      if (r.approved === false) rejected++;
    });
    setTotalFuelToday(total.toFixed(2) + ' L');
    setRejectedCount(rejected);
  };

  const getChartData = () => {
    const agg = {};
    fuelRecords?.forEach(r => {
      if (r.approved === true) agg[r.plate_number] = (agg[r.plate_number] || 0) + parseFloat(r.fuel_amount);
    });
    return {
      labels: Object.keys(agg),
      datasets: [{ label: 'Fuel Consumed (L)', data: Object.values(agg), backgroundColor: 'rgba(139,92,246,0.5)', borderColor: '#8b5cf6', borderWidth: 1.5, borderRadius: 6, hoverBackgroundColor: 'rgba(167,139,250,0.7)' }],
    };
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: 'var(--text-2)', font: { family: 'Inter', size: 12 } } } },
    scales: {
      x: { grid: { color: 'var(--border-0)' }, ticks: { color: 'var(--text-4)', font: { family: 'Inter', size: 11 } } },
      y: { grid: { color: 'var(--border-0)' }, ticks: { color: 'var(--text-4)', font: { family: 'Inter', size: 11 } } },
    },
  };

  const handleSaveVehicle = async (e) => {
    e.preventDefault(); setFormError('');
    const payload = { plate_number: plateNumber.toUpperCase().trim(), owner_name: ownerName.trim(), fuel_quota: parseFloat(fuelQuota), waiting_hours: parseInt(waitingHours), status: statusSelect };
    try {
      const url = vehicleId ? `${API_BASE}/vehicles/${vehicleId}` : `${API_BASE}/vehicles`;
      const res = await fetch(url, { method: vehicleId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
      const d = await res.json();
      if (!res.ok || d.success === false) throw new Error(d.message || 'Operation failed');
      resetForm(); setFormOpen(false); await reloadVehicles(); await reloadFuelRecords();
    } catch (err) { setFormError(err.message); }
  };

  const startEdit = (v) => {
    setVehicleId(v.id); setPlateNumber(v.plate_number); setOwnerName(v.owner_name);
    setFuelQuota(v.fuel_quota); setWaitingHours(v.waiting_hours); setStatusSelect(v.status);
    setFormOpen(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this vehicle and all its logs?')) return;
    try {
      const res = await fetch(`${API_BASE}/vehicles/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      if (!res.ok || d.success === false) throw new Error(d.message);
      await reloadVehicles(); await reloadFuelRecords();
    } catch (err) { alert(err.message); }
  };

  const resetForm = () => { setVehicleId(''); setPlateNumber(''); setOwnerName(''); setFuelQuota(''); setWaitingHours(''); setStatusSelect('ACTIVE'); setFormError(''); };

  const metrics = [
    { label: 'Total Fuel Today', value: totalFuelToday, color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)',  icon: Droplet    },
    { label: 'Rejected Logs',    value: rejectedCount,  color: '#fb7185', bg: 'rgba(251,113,133,0.1)', border: 'rgba(251,113,133,0.2)', icon: ShieldAlert },
    { label: 'Active Vehicles',  value: vehicles?.length || 0, color: '#a78bfa', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)', icon: Truck },
  ];

  const fieldStyle = { display: 'flex', flexDirection: 'column', gap: 6 };
  const labelStyle = { fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-4)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: 20, borderBottom: '1px solid var(--border-1)', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem,3vw,2.25rem)', color: 'var(--text-1)', letterSpacing: '-0.02em' }}>Fleet Dashboard</h1>
          <p style={{ margin: 0, color: 'var(--text-3)', fontSize: '0.875rem' }}>Real-time metrics, consumption analytics, and compliance.</p>
        </div>
        <button onClick={() => window.dispatchEvent(new CustomEvent('toggle-ai-drawer'))} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 10, whiteSpace: 'nowrap' }}>
          <Sparkles size={15} color="#a78bfa" />
          <span style={{ fontSize: '0.875rem' }}>AI Copilot</span>
        </button>
      </div>

      {/* Metrics — 1 col mobile, 3 col tablet+ */}
      <div className="metrics-grid">
        {metrics.map(({ label, value, color, bg, border, icon: Icon }) => (
          <div key={label} className="card-metric" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-4)' }}>{label}</p>
              <p style={{ margin: 0, fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif', color, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</p>
            </div>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={21} color={color} />
            </div>
          </div>
        ))}
      </div>

      {/* Main content — stacks on mobile */}
      <div className="dashboard-grid">

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

          {/* Chart */}
          <div className="card-glass" style={{ padding: '20px' }}>
            <SectionHeader icon={BarChart3} color="#a78bfa" title="Consumption by Vehicle">
              <span style={{ fontSize: 11, color: 'var(--text-4)' }}>Liters Distributed</span>
            </SectionHeader>
            <div style={{ height: 240 }}>
              {fuelRecords?.length ? <Bar data={getChartData()} options={chartOptions} /> : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-4)', fontSize: '0.875rem' }}>No transaction history yet.</div>
              )}
            </div>
          </div>

          {/* Fleet table */}
          <div className="card-glass" style={{ padding: '20px' }}>
            <SectionHeader icon={ListFilter} color="#60a5fa" title="Fleet Directory" />
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table className="tbl" style={{ minWidth: 520 }}>
                <thead>
                  <tr>
                    {['ID','Plate','Owner','Quota','Cooldown','Status', ...(role==='ADMIN'?['Actions']:[])].map(h => (
                      <th key={h} style={{ textAlign: h==='Actions' ? 'right' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vehicles?.length ? vehicles.map(v => (
                    <tr key={v.id}>
                      <td style={{ color: 'var(--text-4)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{v.id}</td>
                      <td><span className="plate-chip">{v.plate_number}</span></td>
                      <td style={{ color: 'var(--text-1)', fontWeight: 500, whiteSpace: 'nowrap' }}>{v.owner_name}</td>
                      <td style={{ color: 'var(--text-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{parseFloat(v.fuel_quota).toFixed(2)} L</td>
                      <td style={{ color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{v.waiting_hours}h</td>
                      <td><span className={v.status==='ACTIVE' ? 'badge badge-active' : 'badge badge-blocked'}>{v.status}</span></td>
                      {role==='ADMIN' && (
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button onClick={() => startEdit(v)} style={{ display:'flex',alignItems:'center',gap:4,padding:'5px 10px',background:'rgba(139,92,246,0.08)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:7,color:'#a78bfa',fontSize:12,cursor:'pointer',fontWeight:500,whiteSpace:'nowrap' }}>
                              <Pencil size={11} /> Edit
                            </button>
                            <button onClick={() => handleDelete(v.id)} style={{ display:'flex',alignItems:'center',gap:4,padding:'5px 10px',background:'rgba(251,113,133,0.07)',border:'1px solid rgba(251,113,133,0.18)',borderRadius:7,color:'#fb7185',fontSize:12,cursor:'pointer',fontWeight:500,whiteSpace:'nowrap' }}>
                              <Trash2 size={11} /> Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )) : (
                    <tr><td colSpan={role==='ADMIN'?7:6} style={{ textAlign:'center',padding:'32px 0',color:'var(--text-4)' }}>No fleet vehicles registered.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* AI insight */}
          <div className="card-glass" style={{ padding: 20, borderLeft: '2px solid rgba(139,92,246,0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Sparkles size={16} color="#a78bfa" />
              <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-1)' }}>AI Insights</span>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: '0.8125rem', color: 'var(--text-3)', lineHeight: 1.6 }}>
              FuelControl Copilot scans active vehicles and log patterns.
            </p>
            <button onClick={() => window.dispatchEvent(new CustomEvent('toggle-ai-drawer'))} style={{ width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'10px 16px',background:'rgba(139,92,246,0.08)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:10,color:'#a78bfa',fontSize:'0.8125rem',fontWeight:600,cursor:'pointer',transition:'all 0.15s ease' }}>
              Talk to AI Assistant <ArrowRight size={14} />
            </button>
          </div>

          {/* Register/Edit vehicle form */}
          {role === 'ADMIN' && (
            <div ref={formRef} className="card-glass" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: formOpen ? 20 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <PlusCircle size={16} color="#a78bfa" />
                  <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-1)' }}>
                    {vehicleId ? 'Update Vehicle' : 'Register Vehicle'}
                  </span>
                </div>
                <button onClick={() => { setFormOpen(o => !o); if (formOpen) resetForm(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
                  {formOpen ? 'Cancel' : '+ Add'}
                </button>
              </div>

              {formOpen && (
                <form onSubmit={handleSaveVehicle} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { id: 'plateNumber', label: 'License Plate', value: plateNumber, onChange: e => setPlateNumber(e.target.value), placeholder: 'AB-1234', type: 'text' },
                    { id: 'ownerName',   label: 'Owner Name',    value: ownerName,   onChange: e => setOwnerName(e.target.value),   placeholder: 'John Doe', type: 'text' },
                    { id: 'fuelQuota',   label: 'Fuel Quota (L)',value: fuelQuota,   onChange: e => setFuelQuota(e.target.value),   placeholder: '100.00', type: 'number', step: '0.01' },
                    { id: 'waitingHours',label: 'Cooldown (Hrs)',value: waitingHours,onChange: e => setWaitingHours(e.target.value),placeholder: '24', type: 'number' },
                  ].map(f => (
                    <div key={f.id} style={fieldStyle}>
                      <label style={labelStyle}>{f.label}</label>
                      <input {...f} className="input-field" required />
                    </div>
                  ))}
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Status</label>
                    <select value={statusSelect} onChange={e => setStatusSelect(e.target.value)} className="input-field" style={{ cursor: 'pointer' }}>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="BLOCKED">BLOCKED</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-primary" style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'12px 16px',borderRadius:10,marginTop:4 }}>
                    <Save size={15} /> {vehicleId ? 'Update Vehicle' : 'Save Vehicle'}
                  </button>
                  {vehicleId && (
                    <button type="button" onClick={() => { resetForm(); setFormOpen(false); }} className="btn-ghost" style={{ borderRadius: 10, padding: '9px 16px', fontSize: '0.8125rem', textAlign: 'center' }}>
                      Cancel Edit
                    </button>
                  )}
                  {formError && <div className="alert-error">{formError}</div>}
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
