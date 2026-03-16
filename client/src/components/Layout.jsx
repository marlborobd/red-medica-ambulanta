import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '⊞', exact: true },
  { path: '/trips', label: 'Curse', icon: '🚑' },
  { path: '/trips/new', label: 'Cursa noua', icon: '+' },
  { path: '/calendar', label: 'Calendar', icon: '📅' },
  { path: '/reports', label: 'Rapoarte', icon: '📊', roles: ['admin', 'dispecer'] },
  { path: '/tariffs', label: 'Tarife', icon: '💰', roles: ['admin'] },
  { path: '/users', label: 'Utilizatori', icon: '👥', roles: ['admin'] },
];

const pageTitles = {
  '/': 'Dashboard',
  '/trips': 'Curse',
  '/trips/new': 'Cursa noua',
  '/calendar': 'Calendar',
  '/reports': 'Rapoarte',
  '/tariffs': 'Tarife',
  '/users': 'Utilizatori',
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] || 'Red Medica';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        width: 220, background: '#fff', borderRight: '1px solid #eee',
        display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100
      }}>
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24, color: '#E24B4A' }}>✚</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#E24B4A' }}>RED MEDICA</div>
              <div style={{ fontSize: 11, color: '#888' }}>Ambulanta Arad</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {navItems.filter(item => !item.roles || (user && item.roles.includes(user.role))).map(item => (
            <NavLink key={item.path} to={item.path} end={item.exact}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
                fontSize: 14, fontWeight: isActive ? 700 : 400,
                color: isActive ? '#E24B4A' : '#555',
                background: isActive ? '#fff0f0' : 'transparent',
                borderRight: isActive ? '3px solid #E24B4A' : '3px solid transparent',
              })}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: '#E24B4A',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 14, flexShrink: 0
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: '#888', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={logout}
            style={{ width: '100%', padding: '7px 0', background: 'transparent', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, color: '#666' }}>
            Deconectare
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          background: '#fff', borderBottom: '1px solid #eee', padding: '0 28px',
          height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 50
        }}>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h1>
          <button onClick={() => navigate('/trips/new')}
            style={{ padding: '8px 18px', background: '#E24B4A', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14 }}>
            + Cursa noua
          </button>
        </div>
        <main style={{ flex: 1, padding: 28 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
