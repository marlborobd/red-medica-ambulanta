const colors = {
  planificata: { bg: '#e3f2fd', color: '#1565c0', label: 'Planificata' },
  in_desfasurare: { bg: '#fff3e0', color: '#e65100', label: 'In desfasurare' },
  finalizata: { bg: '#e8f5e9', color: '#2e7d32', label: 'Finalizata' },
  anulata: { bg: '#fce4ec', color: '#c62828', label: 'Anulata' },
};

export default function StatusBadge({ status }) {
  const s = colors[status] || { bg: '#eee', color: '#666', label: status };
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
      backgroundColor: s.bg, color: s.color, whiteSpace: 'nowrap'
    }}>
      {s.label}
    </span>
  );
}
