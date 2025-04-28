import { useContext } from 'react';
import { Navigate } from 'react-router';
import { AuthProvider } from '../context/AuthContext';
//import { useAuth } from "../context/AuthContext"


export const PrivateRouter = ({ children }) => {
  const { isAuthenticated } = useContext(AuthProvider);

  return isAuthenticated ? children : <Navigate to="/login" />;
};
