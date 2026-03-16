import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 7, fontSize: 14 };
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5, color: '#555' };

export default function TripEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/api/trips/${id}`).then(r => {
      const t = r.data;
      setForm({ ...t, scheduled_at: t.scheduled_at ? t.scheduled_at.slice(0, 16) : '' });
    }).catch(() => navigate('/trips'));
    api.get('/api/users/drivers').then(r => setDrivers(r.data)).catch(() => {});
  }, [id]);

  if (!form) return <div>Se incarca...</div>;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.put(`/api/trips/${id}`, form);
      navigate('/trips');
    } catch (err) {
      alert(err.response?.data?.error || 'Eroare la salvare');
    } finally { setSaving(false); }
  };

  const changeStatus = async (status) => {
    try {
      const res = await api.put(`/api/trips/${id}/status`, { status });
      setForm(f => ({ ...f, status: res.data.status }));
    } catch (err) {
      alert(err.response?.data?.error || 'Eroare');
    }
  };

  const downloadPDF = async () => {
    const res = await api.post(`/api/pdf/trip/${id}`, {}, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a'); a.href = url; a.download = `cursa-${form.trip_number}.pdf`; a.click();
  };

  const deleteTrip = async () => {
    if (!confirm('Stergi aceasta cursa?')) return;
    await api.delete(`/api/trips/${id}`);
    navigate('/trips');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{form.trip_number}</span>
          <StatusBadge status={form.status} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {form.status === 'planificata' && <button type="button" onClick={() => changeStatus('in_desfasurare')} style={{ padding: '7px 16px', background: '#e65100', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 600, fontSize: 13 }}>Porneste</button>}
          {form.status === 'in_desfasurare' && <button type="button" onClick={() => changeStatus('finalizata')} style={{ padding: '7px 16px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 600, fontSize: 13 }}>Finalizeaza</button>}
          {form.status !== 'anulata' && form.status !== 'finalizata' && <button type="button" onClick={() => changeStatus('anulata')} style={{ padding: '7px 16px', background: '#666', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 600, fontSize: 13 }}>Anuleaza</button>}
          <button type="button" onClick={downloadPDF} style={{ padding: '7px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 600, fontSize: 13 }}>PDF</button>
          {user?.role === 'admin' && <button type="button" onClick={deleteTrip} style={{ padding: '7px 16px', background: '#c62828', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 600, fontSize: 13 }}>Sterge</button>}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#E24B4A' }}>Date pacient</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[['patient_name','Nume pacient *','text',true],['patient_age','Varsta','number'],['patient_cnp','CNP'],['patient_phone','Telefon']].map(([k,l,t,req]) => (
            <div key={k}><label style={labelStyle}>{l}</label><input type={t||'text'} value={form[k]||''} onChange={e=>set(k,e.target.value)} required={req} style={inputStyle}/></div>
          ))}
          <div style={{ gridColumn: '1/-1' }}>
            <label style={labelStyle}>Diagnostic</label>
            <textarea value={form.diagnosis||''} onChange={e=>set('diagnosis',e.target.value)} rows={2} style={{...inputStyle,resize:'vertical'}}/>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#E24B4A' }}>Itinerariu si programare</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><label style={labelStyle}>Adresa preluare *</label><input value={form.pickup_address||''} onChange={e=>set('pickup_address',e.target.value)} required style={inputStyle}/></div>
          <div><label style={labelStyle}>Destinatie *</label><input value={form.destination_address||''} onChange={e=>set('destination_address',e.target.value)} required style={inputStyle}/></div>
          <div><label style={labelStyle}>Distanta (km)</label><input type="number" step="0.01" value={form.distance_km||''} onChange={e=>set('distance_km',e.target.value)} style={inputStyle}/></div>
          <div><label style={labelStyle}>Durata (min)</label><input type="number" value={form.duration_min||''} onChange={e=>set('duration_min',e.target.value)} style={inputStyle}/></div>
          <div><label style={labelStyle}>Data si ora *</label><input type="datetime-local" value={form.scheduled_at||''} onChange={e=>set('scheduled_at',e.target.value)} required style={inputStyle}/></div>
          <div>
            <label style={labelStyle}>Tip cursa</label>
            <select value={form.trip_type||'standard'} onChange={e=>set('trip_type',e.target.value)} style={inputStyle}>
              <option value="standard">Standard</option>
              <option value="urgenta">Urgenta</option>
              <option value="nocturna">Nocturna</option>
              <option value="aparatura">Cu aparatura</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Sofer</label>
            <select value={form.driver_id||''} onChange={e=>set('driver_id',e.target.value)} style={inputStyle}>
              <option value="">-- Selecteaza --</option>
              {drivers.map(d=><option key={d.id} value={d.id}>{d.name} {d.vehicle_plate?`(${d.vehicle_plate})`:''}</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Cost total (RON)</label><input type="number" step="0.01" value={form.total_cost||''} onChange={e=>set('total_cost',e.target.value)} style={inputStyle}/></div>
          <div style={{gridColumn:'1/-1'}}><label style={labelStyle}>Note</label><textarea value={form.notes||''} onChange={e=>set('notes',e.target.value)} rows={2} style={{...inputStyle,resize:'vertical'}}/></div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="submit" disabled={saving} style={{ padding: '11px 28px', background: '#E24B4A', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15 }}>
          {saving ? 'Se salveaza...' : 'Salveaza modificarile'}
        </button>
        <button type="button" onClick={() => navigate('/trips')} style={{ padding: '11px 24px', background: '#fff', color: '#666', border: '1px solid #ddd', borderRadius: 8, fontSize: 15 }}>
          Inapoi
        </button>
      </div>
    </form>
  );
}
