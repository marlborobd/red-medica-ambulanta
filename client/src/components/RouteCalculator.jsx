import { useState } from 'react';
import api from '../api/axios';

export default function RouteCalculator({ onResult, initialOrigin = '', initialDest = '' }) {
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDest);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const calculate = async () => {
    if (!origin || !destination) return;
    setLoading(true);
    try {
      const res = await api.post('/api/route/calculate', { origin, destination });
      setResult(res.data);
      onResult && onResult(res.data, origin, destination);
    } catch {
      alert('Eroare la calculul rutei');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f9f9f9', border: '1px solid #eee', borderRadius: 8, padding: 16, marginTop: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'end' }}>
        <div>
          <label style={{ fontSize: 12, color: '#666' }}>Adresa preluare</label>
          <input value={origin} onChange={e => setOrigin(e.target.value)}
            placeholder="Str. Exemplu, Arad"
            style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 6, marginTop: 4 }} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#666' }}>Destinatie</label>
          <input value={destination} onChange={e => setDestination(e.target.value)}
            placeholder="Spital, Arad"
            style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 6, marginTop: 4 }} />
        </div>
        <button onClick={calculate} disabled={loading}
          style={{ padding: '8px 16px', background: '#E24B4A', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}>
          {loading ? '...' : 'Calculeaza'}
        </button>
      </div>
      {result && (
        <div style={{ marginTop: 10, fontSize: 13, color: '#333' }}>
          Distanta: <strong>{result.distance_km} km</strong> | Durata: <strong>{result.duration_min} min</strong>
        </div>
      )}
    </div>
  );
}
