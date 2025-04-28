import React, { useState } from "react";
import { Link } from "react-router-dom";

const ResetPassword = ({ token }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Confirm password not matched.");
      return;
    }
    // Aquí podrías agregar el código para enviar el formulario
    console.log("Password reset successful");
  };

  return (
    <div className="d-flex flex-column min-vh-100 authentication-bg"> 
      <div className="account-pages my-5 pt-sm-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 col-xl-5">
              <div>
                <Link to="index" className="mb-5 d-block auth-logo">
                      <img src="/assets/images/logo-dark.png"  alt="" height="22" className="logo logo-dark"/>
                      <img src="/assets/images/logo-light.png" alt=""  height="22" className="logo logo-light"/>
                </Link>
                      <div className="card"></div>
                <div className="card-body p-4">
                  <div className="text-center mt-2">
                    <h5 className="text-primary">Restablecer contraseña</h5>
                    <p className="text-muted">Ingrese su nueva contraseña a continuación.</p>
                  </div>
                  <div className="p-2 mt-4">
                    <form onSubmit={handleSubmit}>
                      <input type="hidden" name="token" value={token} />
                      <div className="mb-3">
                        <label className="form-label" htmlFor="password-input">
                          Contraseña
                        </label>
                        <div className="position-relative auth-pass-inputgroup">
                          <input
                            type="password"
                            className="form-control pe-5 password-input"
                            name="password"
                            onChange={handlePasswordChange}
                            value={password}
                            placeholder="Enter password"
                            id="password-input"
                            minlength="5"
                            required
                          />
                        </div>
                        <div id="passwordInput" className="form-text">
                        Su contraseña debe tener entre 8 y 20 caracteres.
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label" htmlFor="confirm-password-input">
                        Confirmar contraseña
                        </label>
                        <div className="position-relative auth-pass-inputgroup mb-3">
                          <input
                            type="password"
                            className="form-control pe-5 password-input"
                            name="confirmpassword"
                            onChange={handleConfirmPasswordChange}
                            value={confirmPassword}
                            placeholder="Confirm password"
                            id="confirm-password-input"
                            required
                          />
                        </div>
                      </div>
                      {error && (
                        <div id="confirmpasswordInput" className="form-text text-danger">
                          {error}
                        </div>
                      )}
                      <div className="mt-4 d-grid">
                        <button className="btn btn-primary w-100" type="submit">
                        Restablecer contraseña                        </button>
                      </div>
                    </form>

                    <div className="mt-4 text-center">
                      <p className="mb-0">
                      Espera, recuerdo mi contraseña...
                        <Link to="/Login" className="fw-semibold text-primary text-decoration-underline">
                        Haga clic aquí
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 text-center">
                <p>© {new Date().getFullYear()}Minible. Elaborado con <i className="mdi mdi-heart text-danger"></i> por Themesbrand</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
