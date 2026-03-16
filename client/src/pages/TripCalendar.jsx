import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { startOfWeek, addDays, format, isSameDay } from 'date-fns';
import { ro } from 'date-fns/locale';

const tripColor = (trip) => {
  if (trip.status === 'finalizata') return { bg: '#e8f5e9', border: '#2e7d32', color: '#2e7d32' };
  if (trip.trip_type === 'urgenta') return { bg: '#fce4ec', border: '#E24B4A', color: '#E24B4A' };
  return { bg: '#e3f2fd', border: '#1976d2', color: '#1976d2' };
};

export default function TripCalendar() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [trips, setTrips] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/api/trips/calendar?week=${format(weekStart, 'yyyy-MM-dd')}`).then(r => setTrips(r.data)).catch(() => {});
  }, [weekStart]);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, background: '#fff', borderRadius: 12, padding: '14px 20px' }}>
        <button onClick={() => setWeekStart(d => addDays(d, -7))} style={{ padding: '7px 14px', border: '1px solid #ddd', borderRadius: 7, background: '#fff', cursor: 'pointer' }}>← Anterior</button>
        <span style={{ fontWeight: 700, fontSize: 15 }}>
          {format(weekStart, 'd MMM', { locale: ro })} – {format(addDays(weekStart, 6), 'd MMM yyyy', { locale: ro })}
        </span>
        <button onClick={() => setWeekStart(d => addDays(d, 7))} style={{ padding: '7px 14px', border: '1px solid #ddd', borderRadius: 7, background: '#fff', cursor: 'pointer' }}>Urmator →</button>
        <button onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} style={{ padding: '7px 14px', border: '1px solid #E24B4A', color: '#E24B4A', borderRadius: 7, background: '#fff', cursor: 'pointer', marginLeft: 'auto' }}>Azi</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {days.map(day => {
          const dayTrips = trips.filter(t => isSameDay(new Date(t.scheduled_at), day));
          const isToday = isSameDay(day, new Date());
          return (
            <div key={day.toISOString()} style={{ background: '#fff', borderRadius: 10, minHeight: 140, padding: 10, border: isToday ? '2px solid #E24B4A' : '1px solid #eee' }}>
              <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 600, color: isToday ? '#E24B4A' : '#555', marginBottom: 8 }}>
                {format(day, 'EEE', { locale: ro })}<br />
                <span style={{ fontSize: 20, lineHeight: 1 }}>{format(day, 'd')}</span>
              </div>
              {dayTrips.map(trip => {
                const c = tripColor(trip);
                return (
                  <div key={trip.id} onClick={() => navigate(`/trips/${trip.id}/edit`)}
                    style={{ background: c.bg, borderLeft: `3px solid ${c.border}`, padding: '4px 8px', borderRadius: 5, marginBottom: 4, cursor: 'pointer', fontSize: 11 }}>
                    <div style={{ fontWeight: 700, color: c.color }}>{format(new Date(trip.scheduled_at), 'HH:mm')}</div>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trip.patient_name}</div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
