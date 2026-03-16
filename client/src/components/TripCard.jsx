import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

export default function TripCard({ trip }) {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/trips/${trip.id}/edit`)}
      style={{
        background: '#fff', border: '1px solid #eee', borderRadius: 10, padding: '14px 18px',
        marginBottom: 10, cursor: 'pointer', transition: 'box-shadow .2s',
        borderLeft: `4px solid ${trip.trip_type === 'urgenta' ? '#E24B4A' : '#1976d2'}`
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{trip.patient_name}</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
            {trip.pickup_address} → {trip.destination_address}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <StatusBadge status={trip.status} />
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            {format(new Date(trip.scheduled_at), 'dd MMM, HH:mm', { locale: ro })}
          </div>
        </div>
      </div>
      {trip.driver_name && (
        <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
          Sofer: {trip.driver_name} {trip.distance_km ? `| ${trip.distance_km} km` : ''} {trip.total_cost ? `| ${trip.total_cost} RON` : ''}
        </div>
      )}
    </div>
  );
}
