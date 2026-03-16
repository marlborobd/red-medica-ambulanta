import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TripNew from './pages/TripNew';
import TripEdit from './pages/TripEdit';
import TripList from './pages/TripList';
import TripCalendar from './pages/TripCalendar';
import Reports from './pages/Reports';
import Tariffs from './pages/Tariffs';
import Users from './pages/Users';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/trips/new" element={<ProtectedRoute><Layout><TripNew /></Layout></ProtectedRoute>} />
      <Route path="/trips/:id/edit" element={<ProtectedRoute><Layout><TripEdit /></Layout></ProtectedRoute>} />
      <Route path="/trips" element={<ProtectedRoute><Layout><TripList /></Layout></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><Layout><TripCalendar /></Layout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute roles={['admin','dispecer']}><Layout><Reports /></Layout></ProtectedRoute>} />
      <Route path="/tariffs" element={<ProtectedRoute roles={['admin']}><Layout><Tariffs /></Layout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute roles={['admin']}><Layout><Users /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
