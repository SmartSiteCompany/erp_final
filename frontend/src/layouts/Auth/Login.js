import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
 // Verificar token al cargar el componente
 useEffect(() => {
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const { valid } = await authService.verifyToken();
        if (valid) navigate('/home');
      }
    } catch (error) {
      authService.logout();
    }
  };
  
  checkAuth();
}, [navigate]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  setMessage("");

  try {
    const data = await authService.login(email, password);
    setMessage("Inicio de sesión exitoso.");
    
    // Redirigir después de 1 segundo para mostrar el mensaje
    setTimeout(() => navigate("/home"), 1000);
  } catch (error) {
    setError(error.error || "Credenciales inválidas. Por favor, inténtalo de nuevo.");
  } finally {
    setLoading(false);
  }
};
 

  return (
    <div className="d-flex flex-column min-vh-100 authentication-bg">
      <div className="account-pages my-0 pt-sm-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-5 col-xl-5">
              <div>
                <Link to="index" className="mb-5 d-block auth-logo">
                  <img src="/assets/images/logo-dark.png" alt="" height="22" className="logo logo-dark" />
                  <img src="/assets/images/logo-light.png" alt="" height="22" className="logo logo-light" />
                </Link>
              </div>
              <div className="card">
                <div className="card-body p-4">
                  <div className="text-center mt-2">
                    <h5 className="text-primary">¡Bienvenido de nuevo!</h5>
                    <p className="text-muted">Inicie sesión para continuar en Minible.</p>
                  </div>
                  <div className="p-2 mt-4">
                    {message && (
                      <div className="alert alert-success text-center mb-4 flash" role="alert">
                        {message}
                      </div>
                    )}
                    {error && (
                      <div className="alert alert-danger text-center mb-4 flash" role="alert">
                        {error}
                      </div>
                    )}
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label" htmlFor="email">
                          Email
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Ingrese su email"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label" htmlFor="userpassword">
                          Contraseña
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="userpassword"
                          name="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Ingrese su contraseña"
                          required
                        />
                        <div className="float-end">
                          <Link to="/RecoverPassword" className="text-muted">
                            ¿Has olvidado tu contraseña?
                          </Link>
                        </div>
                      </div>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="auth-remember-check"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="auth-remember-check">
                          Recuérdame
                        </label>
                      </div>
                      <div className="mt-3 text-end">
                        <button
                          className="btn btn-primary w-sm waves-effect waves-light"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                              Procesando...
                            </>
                          ) : (
                            "Iniciar Sesión"
                          )}
                        </button>
                      </div>
                      <div className="mt-4 text-center">
                        <div className="signin-other-title">
                          <h5 className="font-size-14 mb-3 title">Iniciar sesión con</h5>
                        </div>
                        <ul className="list-inline">
                          <li className="list-inline-item">
                            <a href="#!" className="social-list-item bg-primary text-white border-primary">
                              <i className="mdi mdi-facebook"></i>
                            </a>
                          </li>
                          <li className="list-inline-item">
                            <a href="#!" className="social-list-item bg-info text-white border-info">
                              <i className="mdi mdi-twitter"></i>
                            </a>
                          </li>
                          <li className="list-inline-item">
                            <a href="#!" className="social-list-item bg-danger text-white border-danger">
                              <i className="mdi mdi-google"></i>
                            </a>
                          </li>
                        </ul>
                      </div>
                      <div className="mt-4 text-center">
                        <p className="mb-0">
                          ¿No tienes una cuenta?{" "}
                          <Link to="/Register" className="fw-medium text-primary">
                            Regístrate ahora
                          </Link>
                        </p>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p>
                  © {new Date().getFullYear()} Minible. Elaborado con{" "}
                  <i className="mdi mdi-heart text-danger"></i> por Themesbrand
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;