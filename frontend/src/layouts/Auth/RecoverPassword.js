import React, { useState } from "react";
import { Link } from "react-router-dom";

const RecoverPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí agregarías la lógica para manejar el envío del correo de recuperación
    console.log("Email:", email);
    // Aquí podrías manejar el éxito o el error de la solicitud
    setMessage("Enter your Email and instructions will be sent to you!");
  };

  return (
    <div className="d-flex flex-column min-vh-100 authentication-bg"> 
      <div className="account-pages  pt-sm-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10 col-lg-6 col-xl-5">
              <div>
                <Link to="index" className="mb-5 d-block auth-logo">
                  <img
                    src="/assets/images/logo-dark.png"
                    alt=""
                    height="22"
                    className="logo logo-dark"
                  />
                  <img
                    src="/assets/images/logo-light.png"
                    alt=""
                    height="22"
                    className="logo logo-light"
                  />
                </Link>
                <div className="card">
                  <div className="card-body p-4">
                    <div className="text-center mt-2">
                      <h5 className="text-primary">Restablecer contraseña</h5>
                      <p className="text-muted">Restablecer contraseña con Minible.</p>
                    </div>
                    <div className="p- mt-4">
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
                      <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                          <label className="form-label" htmlFor="useremail">
                            Email
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            id="useremail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                          />
                        </div>

                        <div className="mt-3 text-end">
                          <button className="btn btn-primary w-sm waves-effect waves-light" type="submit">
                          Reiniciar
                          </button>
                        </div>

                        <div className="mt-4 text-center">
                          <p className="mb-0">
                          ¿Lo recuerdas? <Link to="/Login" className="fw-medium text-primary">Signin</Link>
                          </p>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div className="mt-5 text-center">
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
    </div>
  );
};

export default RecoverPassword;
