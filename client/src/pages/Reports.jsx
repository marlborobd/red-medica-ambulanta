import { useState, useEffect } from 'react';
import api from '../api/axios';
import { format } from 'date-fns';

export default function Reports() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [data, setData] = useState({ stats: {}, trips: [] });

  useEffect(() => {
    api.get(`/api/reports/monthly?month=${month}`).then(r => setData(r.data)).catch(() => {});
  }, [month]);

  const downloadPDF = async (id, num) => {
    const res = await api.post(`/api/pdf/trip/${id}`, {}, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a'); a.href = url; a.download = `cursa-${num}.pdf`; a.click();
  };

  return (
    <div>
      <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <label style={{ fontWeight: 600, fontSize: 14 }}>Luna:</label>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 7, fontSize: 14 }} />
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total curse', value: data.stats.total_trips || 0, color: '#E24B4A' },
          { label: 'Total km', value: `${parseFloat(data.stats.total_km || 0).toFixed(0)} km`, color: '#1976d2' },
          { label: 'Venituri', value: `${parseFloat(data.stats.total_revenue || 0).toFixed(2)} RON`, color: '#2e7d32' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '20px 28px', flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 13, color: '#888' }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #eee' }}>
              {['Nr. Cursa', 'Pacient', 'Data', 'Sofer', 'Km', 'Total', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#888' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.trips.map(trip => (
              <tr key={trip.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 700, color: '#E24B4A' }}>{trip.trip_number}</td>
                <td style={{ padding: '11px 16px', fontSize: 14 }}>{trip.patient_name}</td>
                <td style={{ padding: '11px 16px', fontSize: 13 }}>{trip.scheduled_at ? format(new Date(trip.scheduled_at), 'dd.MM.yyyy') : '-'}</td>
                <td style={{ padding: '11px 16px', fontSize: 13 }}>{trip.driver_name || '-'}</td>
                <td style={{ padding: '11px 16px', fontSize: 13 }}>{trip.distance_km || '-'}</td>
                <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600 }}>{trip.total_cost ? `${trip.total_cost} RON` : '-'}</td>
                <td style={{ padding: '11px 16px' }}>
                  <button onClick={() => downloadPDF(trip.id, trip.trip_number)}
                    style={{ padding: '5px 10px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.trips.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>Nu sunt curse finalizate in aceasta luna.</div>}
      </div>
    </div>
  );
}
