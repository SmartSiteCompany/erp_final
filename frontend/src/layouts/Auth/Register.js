import React, { useState, useEffect  } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";


const Register = () => {
  const [name, setName] = useState("");
  const [apellidos, setApellidos] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

    
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !apellidos || !email || !password) {
      setError("Todos los campos son obligatorios.");
      setMessage("");
      return;
    }

    try {
      const data = await authService.register(name, apellidos, email, password, );
      setMessage("Registro exitoso! Bienvenido a Minible.");
      setError("");
      console.log("Token: ", data.token);
      localStorage.setItem("token", data.token);
      navigate("/login");
    } catch (error) {
      setError(error.message || "Error en el registro.");
      setMessage("");
      console.error(error);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 authentication-bg">
      <div className="account-pages my-0 pt-sm-3">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 col-xl-5">
              <div>
                <Link to="index" className="mb-5 d-block auth-logo">
                  <img src="/assets/images/logo-dark.png" alt="" height="22" className="logo logo-dark" />
                  <img src="/assets/images/logo-light.png" alt="" height="22" className="logo logo-light" />
                </Link>
              </div>
              <div className="card">
                <div className="card-body p-4">
                  <div className="text-center mt-2">
                    <h5 className="text-primary">Registrar cuenta</h5>
                    <p className="text-muted">Obtén tu cuenta gratuita de Minible ahora.</p>
                  </div>
                  <div className="p-2 mt-4">
                    {error && <div className="alert alert-danger mb-4">{error}</div>}
                    {message && <div className="alert alert-success mb-4">{message}</div>}

                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label">Nombre</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          placeholder="Ingresa tu nombre" 
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Apellidos</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={apellidos} 
                          onChange={(e) => setApellidos(e.target.value)} 
                          placeholder="Ingresa tus apellidos" 
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input 
                          type="email" 
                          className="form-control" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          placeholder="Ingresa tu email" 
                        />
                      </div>
                    
                      <div className="mb-3">
                        <label className="form-label">Contraseña</label>
                        <input 
                          type="password" 
                          className="form-control" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          placeholder="Crea una contraseña" 
                        />
                      </div>
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" id="auth-terms-condition-check" required />
                        <label className="form-check-label">Acepto <a href="#" className="text-reset">Términos y Condiciones</a></label>
                      </div>
                      <div className="mt-3 text-end">
                        <button className="btn btn-primary w-sm waves-effect waves-light" type="submit">Registro</button>
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-muted mb-0">¿Ya tienes una cuenta? <Link to="/Login" className="fw-medium text-primary">Iniciar Sesión</Link></p>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="mt-5 text-center">
                <p>© {new Date().getFullYear()} Minible. Elaborado con <i className="mdi mdi-heart text-danger"></i>por Themesbrand</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;