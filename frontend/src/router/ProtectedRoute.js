import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, token, isLocked, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Cargando...</div>; // O un spinner de carga
  }

  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLocked && location.pathname !== '/PantallaBloqueo') {
    return <Navigate to="/PantallaBloqueo" state={{ from: location }} replace />;
  }

  if (location.pathname === '/PantallaBloqueo' && !isLocked) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;