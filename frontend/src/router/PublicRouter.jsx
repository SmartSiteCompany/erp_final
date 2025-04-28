import { useContext } from "react"
import { AuthProvider } from "../context/AuthContext"
import { Navigate } from "react-router-dom"


export const PublicRouter = ({children}) => {

  const { isAuthenticated } = useContext(AuthProvider);

  return !isAuthenticated ? children : <Navigate to="/Home" />;
};
