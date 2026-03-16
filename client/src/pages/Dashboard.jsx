import { useState, useEffect } from 'react';
import api from '../api/axios';
import TripCard from '../components/TripCard';
import { useAuth } from '../context/AuthContext';

function StatCard({ title, value, color = '#E24B4A', sub }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', flex: 1, minWidth: 160, boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}>
      <div style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>{title}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [todayTrips, setTodayTrips] = useState([]);
  const [stats, setStats] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    api.get('/api/trips/today').then(r => setTodayTrips(r.data)).catch(() => {});
    api.get('/api/trips/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <StatCard title="Curse azi" value={stats.today_trips || 0} color="#E24B4A" />
        <StatCard title="Km luna" value={parseFloat(stats.total_km || 0).toFixed(0)} color="#1976d2" sub="kilometri" />
        <StatCard title="Venituri luna" value={`${parseFloat(stats.total_revenue || 0).toFixed(0)} RON`} color="#2e7d32" />
        <StatCard title="Curse planificate" value={stats.planned_trips || 0} color="#e65100" />
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: '#333' }}>Cursele de azi</h2>
      {todayTrips.length === 0
        ? <div style={{ color: '#aaa', padding: '20px 0', fontSize: 14 }}>Nu sunt curse programate pentru azi.</div>
        : todayTrips.map(trip => <TripCard key={trip.id} trip={trip} />)
      }
    </div>
  );
}
