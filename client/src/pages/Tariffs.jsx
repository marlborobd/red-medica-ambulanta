import { useState, useEffect } from 'react';
import api from '../api/axios';

const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 7, fontSize: 14 };
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5, color: '#555' };

export default function Tariffs() {
  const [form, setForm] = useState({ price_per_km: '', surcharge_urgenta: '', surcharge_nocturna: '', surcharge_aparatura: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/api/tariffs').then(r => { if (r.data) setForm(r.data); }).catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setSuccess(false);
    try {
      await api.post('/api/tariffs', form);
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Eroare');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: 500 }}>
      {success && <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '10px 16px', borderRadius: 8, marginBottom: 16 }}>Tarif salvat cu succes!</div>}
      <div style={{ background: '#fff', borderRadius: 12, padding: 28 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Pret/km (RON)</label>
            <input type="number" step="0.01" value={form.price_per_km} onChange={e => set('price_per_km', e.target.value)} required style={inputStyle} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Supliment urgenta (%)</label>
            <input type="number" step="0.01" value={form.surcharge_urgenta} onChange={e => set('surcharge_urgenta', e.target.value)} required style={inputStyle} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Supliment nocturna (%)</label>
            <input type="number" step="0.01" value={form.surcharge_nocturna} onChange={e => set('surcharge_nocturna', e.target.value)} required style={inputStyle} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Supliment aparatura (%)</label>
            <input type="number" step="0.01" value={form.surcharge_aparatura} onChange={e => set('surcharge_aparatura', e.target.value)} required style={inputStyle} />
          </div>
          <button type="submit" disabled={saving}
            style={{ padding: '11px 28px', background: '#E24B4A', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15 }}>
            {saving ? 'Se salveaza...' : 'Salveaza tariful'}
          </button>
        </form>
      </div>
    </div>
  );
}
