import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import UserService from "../../services/UserService";

const PantallaBloqueo = () => {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const userService = UserService();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user data from localStorage:", e);
        navigate("/login");
        return;
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!userData) {
      setError("No se encontraron los datos del usuario.");
      return;
    }

    try {
      const response = await authService.login(userData.email, password);

      if (response.token) {
        const userProfile = await userService.getUserProfile();
        localStorage.setItem("user", JSON.stringify(userProfile));

        setMessage("¡Desbloqueo exitoso!");
        setTimeout(() => {
          navigate("/home");
        }, 1500);
      }
    } catch (error) {
      setError(error.message || "Contraseña incorrecta");
      setPassword("");
    }
  };

  if (!userData) return null;


  return (
    <div className="d-flex flex-column min-vh-100 authentication-bg">
      <div className="account-pages pt-sm-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10 col-lg-6 col-xl-5">
              <div>
                <Link to="/" className="mb-5 d-block auth-logo">
                  <img
                    src="/assets/images/logo-dark.png"
                    alt="Logo"
                    height="22"
                    className="logo logo-dark"
                  />
                  <img
                    src="/assets/images/logo-light.png"
                    alt="Logo"
                    height="22"
                    className="logo logo-light"
                  />
                </Link>
                <div className="card">
                  <div className="card-body p-4">
                    <div className="text-center mt-2">
                      <h5 className="text-primary">Pantalla Bloqueada</h5>
                      <p className="text-muted">
                        Ingrese su contraseña para continuar
                      </p>
                    </div>
                    <div className="p-2 mt-4">
                      {message && (
                        <div className="alert alert-success text-center mb-4" role="alert">
                          {message}
                        </div>
                      )}
                      {error && (
                        <div className="alert alert-borderless alert-danger text-center mb-2 mx-2" role="alert">
                          {error}
                        </div>
                      )}
                      <div className="user-thumb text-center mb-4">
                        <img
                          src={userData.foto_user || "/assets/images/users/avatar-4.jpg"}
                          className="rounded-circle img-thumbnail avatar-lg"
                          alt="Usuario"
                        />
                        <h5 className="font-size-15 mt-3">
                          {userData.name} {userData.apellidos}
                        </h5>
                      </div>
                      <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                          <label className="form-label" htmlFor="userpassword">
                            Contraseña
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            id="userpassword"
                            placeholder="Ingrese su contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoFocus
                          />
                        </div>

                        <div className="mt-3 text-end">
                          <button
                            className="btn btn-primary w-sm waves-effect waves-light"
                            type="submit"
                          >
                            Desbloquear
                          </button>
                        </div>

                        <div className="mt-4 text-center">
                          <p className="mb-0">
                            ¿No eres tú?{" "}
                            <Link to="/login" className="fw-medium text-primary">
                              Iniciar sesión
                            </Link>
                          </p>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div className="mt-5 text-center">
                  <p>
                    © {new Date().getFullYear()} Minible. Desarrollado con{" "}
                    <i className="mdi mdi-heart text-danger"></i> por Themesbrand
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PantallaBloqueo;