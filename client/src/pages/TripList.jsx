import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import { format } from 'date-fns';

export default function TripList() {
  const [trips, setTrips] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: '', from: '', to: '', search: '' });
  const navigate = useNavigate();
  const limit = 20;

  useEffect(() => {
    const params = new URLSearchParams({ page, limit, ...Object.fromEntries(Object.entries(filters).filter(([,v])=>v)) });
    api.get(`/api/trips?${params}`).then(r => { setTrips(r.data.trips); setTotal(r.data.total); }).catch(() => {});
  }, [page, filters]);

  const setFilter = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };

  const downloadPDF = async (e, id, num) => {
    e.stopPropagation();
    const res = await api.post(`/api/pdf/trip/${id}`, {}, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a'); a.href = url; a.download = `cursa-${num}.pdf`; a.click();
  };

  return (
    <div>
      <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder="Cauta pacient..." value={filters.search} onChange={e => setFilter('search', e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 7, fontSize: 14, minWidth: 180 }} />
        <select value={filters.status} onChange={e => setFilter('status', e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 7, fontSize: 14 }}>
          <option value="">Toate statusurile</option>
          <option value="planificata">Planificata</option>
          <option value="in_desfasurare">In desfasurare</option>
          <option value="finalizata">Finalizata</option>
          <option value="anulata">Anulata</option>
        </select>
        <input type="date" value={filters.from} onChange={e => setFilter('from', e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 7, fontSize: 14 }} />
        <input type="date" value={filters.to} onChange={e => setFilter('to', e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 7, fontSize: 14 }} />
        <span style={{ color: '#888', fontSize: 13 }}>{total} curse</span>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #eee' }}>
              {['Nr. Cursa', 'Pacient', 'Adrese', 'Data', 'Sofer', 'Cost', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trips.map(trip => (
              <tr key={trip.id} onClick={() => navigate(`/trips/${trip.id}/edit`)} style={{ cursor: 'pointer', borderBottom: '1px solid #f5f5f5' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#E24B4A' }}>{trip.trip_number}</td>
                <td style={{ padding: '12px 16px', fontSize: 14 }}>{trip.patient_name}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#666', maxWidth: 200 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {trip.pickup_address} → {trip.destination_address}
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13, whiteSpace: 'nowrap' }}>
                  {trip.scheduled_at ? format(new Date(trip.scheduled_at), 'dd.MM.yy HH:mm') : '-'}
                </td>
                <td style={{ padding: '12px 16px', fontSize: 13 }}>{trip.driver_name || '-'}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{trip.total_cost ? `${trip.total_cost} RON` : '-'}</td>
                <td style={{ padding: '12px 16px' }}><StatusBadge status={trip.status} /></td>
                <td style={{ padding: '12px 16px' }}>
                  {trip.status === 'finalizata' && (
                    <button onClick={e => downloadPDF(e, trip.id, trip.trip_number)}
                      style={{ padding: '5px 10px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                      PDF
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {trips.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>Nu au fost gasite curse.</div>}
      </div>

      {total > limit && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '7px 16px', border: '1px solid #ddd', borderRadius: 7, background: '#fff', cursor: 'pointer' }}>← Anterior</button>
          <span style={{ padding: '7px 12px', fontSize: 14, color: '#666' }}>Pagina {page} din {Math.ceil(total / limit)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / limit)}
            style={{ padding: '7px 16px', border: '1px solid #ddd', borderRadius: 7, background: '#fff', cursor: 'pointer' }}>Urmator →</button>
        </div>
      )}
    </div>
  );
}
