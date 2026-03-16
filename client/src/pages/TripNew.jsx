import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import RouteCalculator from '../components/RouteCalculator';
import { calculateCost, getSurchargePct } from '../utils/costCalc';

const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 7, fontSize: 14 };
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5, color: '#555' };
const sectionStyle = { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 20 };

export default function TripNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    patient_name: '', patient_age: '', patient_cnp: '', patient_phone: '',
    diagnosis: '', pickup_address: '', destination_address: '',
    distance_km: '', duration_min: '', scheduled_at: '',
    trip_type: 'standard', driver_id: '', notes: '',
    price_per_km: '', surcharge_pct: '', total_cost: '',
  });
  const [tariff, setTariff] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/api/tariffs').then(r => { setTariff(r.data); setForm(f => ({ ...f, price_per_km: r.data?.price_per_km || '' })); }).catch(() => {});
    api.get('/api/users/drivers').then(r => setDrivers(r.data)).catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => {
    const next = { ...f, [k]: v };
    if (['distance_km', 'trip_type'].includes(k) && tariff) {
      next.surcharge_pct = getSurchargePct(next.trip_type, tariff);
      next.total_cost = calculateCost(next.distance_km, next.trip_type, tariff);
    }
    return next;
  });

  const onRouteResult = (result, origin, dest) => {
    setForm(f => {
      const next = { ...f, distance_km: result.distance_km, duration_min: result.duration_min, pickup_address: origin, destination_address: dest };
      if (tariff) {
        next.surcharge_pct = getSurchargePct(next.trip_type, tariff);
        next.total_cost = calculateCost(result.distance_km, next.trip_type, tariff);
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/api/trips', form);
      navigate('/trips');
    } catch (err) {
      alert(err.response?.data?.error || 'Eroare la salvare');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={sectionStyle}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#E24B4A' }}>Date pacient</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[['patient_name','Nume pacient *','text',true],['patient_age','Varsta','number'],['patient_cnp','CNP'],['patient_phone','Telefon pacient']].map(([k,l,t,req]) => (
            <div key={k}>
              <label style={labelStyle}>{l}</label>
              <input type={t||'text'} value={form[k]} onChange={e => set(k, e.target.value)} required={req} style={inputStyle} />
            </div>
          ))}
          <div style={{ gridColumn: '1/-1' }}>
            <label style={labelStyle}>Diagnostic / Motiv transport</label>
            <textarea value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)} rows={2}
              style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#E24B4A' }}>Itinerariu</h3>
        <RouteCalculator onResult={onRouteResult} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
          <div>
            <label style={labelStyle}>Adresa preluare *</label>
            <input value={form.pickup_address} onChange={e => set('pickup_address', e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Destinatie *</label>
            <input value={form.destination_address} onChange={e => set('destination_address', e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Distanta (km)</label>
            <input type="number" step="0.01" value={form.distance_km} onChange={e => set('distance_km', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Durata estimata (min)</label>
            <input type="number" value={form.duration_min} onChange={e => set('duration_min', e.target.value)} style={inputStyle} />
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#E24B4A' }}>Programare si sofer</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelStyle}>Data si ora *</label>
            <input type="datetime-local" value={form.scheduled_at} onChange={e => set('scheduled_at', e.target.value)} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Tip cursa</label>
            <select value={form.trip_type} onChange={e => set('trip_type', e.target.value)} style={inputStyle}>
              <option value="standard">Standard</option>
              <option value="urgenta">Urgenta</option>
              <option value="nocturna">Nocturna</option>
              <option value="aparatura">Cu aparatura</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Sofer</label>
            <select value={form.driver_id} onChange={e => set('driver_id', e.target.value)} style={inputStyle}>
              <option value="">-- Selecteaza --</option>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.name} {d.vehicle_plate ? `(${d.vehicle_plate})` : ''}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Tarif/km (RON)</label>
            <input type="number" step="0.01" value={form.price_per_km} onChange={e => set('price_per_km', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Supliment (%)</label>
            <input type="number" step="0.01" value={form.surcharge_pct} readOnly style={{ ...inputStyle, background: '#f5f5f5' }} />
          </div>
          <div>
            <label style={labelStyle}>Cost total (RON)</label>
            <input type="number" step="0.01" value={form.total_cost} onChange={e => set('total_cost', e.target.value)} style={inputStyle} />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={labelStyle}>Note</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="submit" disabled={saving}
          style={{ padding: '11px 28px', background: '#E24B4A', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15 }}>
          {saving ? 'Se salveaza...' : 'Salveaza cursa'}
        </button>
        <button type="button" onClick={() => navigate('/trips')}
          style={{ padding: '11px 24px', background: '#fff', color: '#666', border: '1px solid #ddd', borderRadius: 8, fontSize: 15 }}>
          Anuleaza
        </button>
      </div>
    </form>
  );
}
