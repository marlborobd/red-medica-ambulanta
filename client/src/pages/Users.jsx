import { useState, useEffect } from 'react';
import api from '../api/axios';

const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 7, fontSize: 14 };
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5, color: '#555' };

const emptyForm = { name: '', email: '', password: '', role: 'sofer', phone: '', license_number: '', vehicle_plate: '' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/api/users').then(r => setUsers(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editId) {
        await api.put(`/api/users/${editId}`, form);
      } else {
        await api.post('/api/users', form);
      }
      setForm(emptyForm); setEditId(null); load();
    } catch (err) {
      alert(err.response?.data?.error || 'Eroare');
    } finally { setSaving(false); }
  };

  const startEdit = (u) => { setEditId(u.id); setForm({ ...u, password: '' }); };

  const toggleActive = async (u) => {
    await api.put(`/api/users/${u.id}`, { ...u, is_active: !u.is_active });
    load();
  };

  const roleBadge = (role) => {
    const colors = { admin: '#E24B4A', dispecer: '#1976d2', sofer: '#2e7d32' };
    return <span style={{ padding: '2px 8px', background: colors[role] + '22', color: colors[role], borderRadius: 8, fontSize: 12, fontWeight: 700 }}>{role}</span>;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #eee' }}>
              {['Nume', 'Email', 'Rol', 'Masina', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#888' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{u.name}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#666' }}>{u.email}</td>
                <td style={{ padding: '12px 16px' }}>{roleBadge(u.role)}</td>
                <td style={{ padding: '12px 16px', fontSize: 13 }}>{u.vehicle_plate || '-'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 12, color: u.is_active ? '#2e7d32' : '#c62828', fontWeight: 600 }}>
                    {u.is_active ? 'Activ' : 'Inactiv'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', display: 'flex', gap: 6 }}>
                  <button onClick={() => startEdit(u)} style={{ padding: '4px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => toggleActive(u)} style={{ padding: '4px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: u.is_active ? '#c62828' : '#2e7d32' }}>
                    {u.is_active ? 'Dezactiveaza' : 'Activeaza'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, alignSelf: 'start' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18, color: '#E24B4A' }}>
          {editId ? 'Editeaza utilizator' : 'Utilizator nou'}
        </h3>
        <form onSubmit={handleSubmit}>
          {[['name','Nume *','text',true],['email','Email *','email',true],['phone','Telefon'],['license_number','Nr. legitimatie'],['vehicle_plate','Nr. masina']].map(([k,l,t,req]) => (
            <div key={k} style={{ marginBottom: 14 }}>
              <label style={labelStyle}>{l}</label>
              <input type={t||'text'} value={form[k]||''} onChange={e => set(k, e.target.value)} required={req} style={inputStyle} />
            </div>
          ))}
          {!editId && (
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Parola *</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} required={!editId} style={inputStyle} />
            </div>
          )}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Rol</label>
            <select value={form.role} onChange={e => set('role', e.target.value)} style={inputStyle}>
              <option value="sofer">Sofer</option>
              <option value="dispecer">Dispecer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={saving}
              style={{ flex: 1, padding: '10px 0', background: '#E24B4A', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 700, fontSize: 14 }}>
              {saving ? '...' : editId ? 'Salveaza' : 'Adauga'}
            </button>
            {editId && <button type="button" onClick={() => { setEditId(null); setForm(emptyForm); }}
              style={{ padding: '10px 16px', background: '#fff', color: '#666', border: '1px solid #ddd', borderRadius: 7, fontSize: 14 }}>
              Anuleaza
            </button>}
          </div>
        </form>
      </div>
    </div>
  );
}
