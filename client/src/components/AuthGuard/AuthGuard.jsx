import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export function AuthGuard({ children }) {
  try {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    if (!isAuthenticated) {
      return <Navigate to="/" state={{ from: location }} replace />;
    }
    return children;
  } catch (err) {
    return <div>Authentication error occurred</div>;
  }
}