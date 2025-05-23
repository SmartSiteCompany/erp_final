import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../layouts/pages/layout";
import AlertComponent from "../../components/AlertasComponent";
import UserService from "../../services/UserService";
import FilialService from "../../services/FilialService";

const CrearUsuario = ({ onUsuarioCreado }) => {
    const navigate = useNavigate();
    const { crearUsuario } = UserService;
    const { obtenerFilials, loading: loadingFiliales, error: errorFiliales } = FilialService();
    
    const [formData, setFormData] = useState({ 
        name: "", 
        apellidos: "", 
        email: "", 
        password: "", 
        rol_user: "", 
        filial_id: "", 
        foto_user: "" 
    });
    
    const [errors, setErrors] = useState({ 
        name: "", 
        apellidos: "", 
        email: "", 
        password: "", 
        rol_user: "", 
        filial_id: "" 
    });
    
    const [filiales, setFiliales] = useState([]);
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    
    // Roles disponibles
    const roles = ["usuario", "admin"];

    // Obtener filiales al cargar el componente
    useEffect(() => {
        const cargarFiliales = async () => {
            try {
                const data = await obtenerFilials();
                setFiliales(data);
            } catch (error) {
                console.error("Error cargando filiales:", error);
                setAlertType("error");
                setAlertMessage("Error al cargar las filiales");
                setShowAlert(true);
            }
        };
        cargarFiliales();
    }, [obtenerFilials]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        if (!formData.name.trim()) {
            newErrors.name = "El nombre es requerido";
            isValid = false;
        }

        if (!formData.apellidos.trim()) {
            newErrors.apellidos = "Los apellidos son requeridos";
            isValid = false;
        }

        if (!formData.email.trim()) {
            newErrors.email = "El email es requerido";
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Email no válido";
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = "La contraseña es requerida";
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = "Mínimo 6 caracteres";
            isValid = false;
        }

        if (!formData.rol_user) {
            newErrors.rol_user = "Seleccione un rol";
            isValid = false;
        }

        if (!formData.filial_id) {
            newErrors.filial_id = "Seleccione una filial";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setAlertType("error");
            setAlertMessage("Por favor complete todos los campos requeridos");
            setShowAlert(true);
            return;
        }

        try {
            await crearUsuario(formData);
            
            setAlertType("success");
            setAlertMessage("Usuario creado exitosamente");
            setShowAlert(true);
            
            // Resetear formulario
            setFormData({ 
                name: "", 
                apellidos: "", 
                email: "", 
                password: "", 
                rol_user: "", 
                filial_id: "", 
                foto_user: "" 
            });
            
            // Redirigir después de 1.5 segundos
            setTimeout(() => navigate("/Lista_usuarios"), 1500);
            
            if (onUsuarioCreado) {
                onUsuarioCreado(formData);
            }
            
        } catch (error) {
            console.error("Error al crear usuario:", error);
            setAlertType("error");
            setAlertMessage(error.response?.data?.message || "Error al crear usuario");
            setShowAlert(true);
        }
    };

    const handleAlertClose = () => {
        setShowAlert(false);
        // Si la alerta fue de éxito, redirigir
        if (alertType === "success") {
            navigate("/Lista_usuarios");
        }
    };

    if (errorFiliales) {
        return (
            <Layout>
                <div className="alert alert-danger">
                    Error cargando filiales: {errorFiliales.message}
                </div>
            </Layout>
        );
    }

    if (loadingFiliales) {
        return (
            <Layout>
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p>Cargando filiales...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="invoice-title d-flex justify-content-between align-items-center">
                                <h3 className="font-size-h4">Agregar Usuario</h3>
                                <div className="mb-4">
                                    <img src="/assets/images/logo-dark.png" alt="logo" height="20" className="logo-dark" />
                                    <img src="/assets/images/logo-light.png" alt="logo" height="20" className="logo-light" />
                                </div>
                            </div>
                            <hr className="my-3"/>

                            <form onSubmit={handleSubmit}>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label"><i className="uil-user"/> Nombre</label>
                                        <input
                                            type="text"
                                            className={`form-control shadow-sm ${errors.name ? "is-invalid" : ""}`}
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <label className="form-label"><i className="uil-user"/> Apellidos</label>
                                        <input
                                            type="text"
                                            className={`form-control shadow-sm ${errors.apellidos ? "is-invalid" : ""}`}
                                            name="apellidos"
                                            value={formData.apellidos}
                                            onChange={handleChange}
                                        />
                                        {errors.apellidos && <div className="invalid-feedback">{errors.apellidos}</div>}
                                    </div>
                                </div>
                                
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label"><i className="uil-envelope-alt"/> Email</label>
                                        <input
                                            type="email"
                                            className={`form-control shadow-sm ${errors.email ? "is-invalid" : ""}`}
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <label className="form-label"><i className="uil-lock-alt"/> Contraseña</label>
                                        <input
                                            type="password"
                                            className={`form-control shadow-sm ${errors.password ? "is-invalid" : ""}`}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                    </div>
                                </div>
                                
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label"><i className="bx bxs-user-detail"/> Rol</label>
                                        <select
                                            className={`form-select shadow-sm ${errors.rol_user ? "is-invalid" : ""}`}
                                            name="rol_user"
                                            value={formData.rol_user}
                                            onChange={handleChange}
                                        >
                                            <option value="">Seleccione un rol</option>
                                            {roles.map(rol => (
                                                <option key={rol} value={rol}>{rol}</option>
                                            ))}
                                        </select>
                                        {errors.rol_user && <div className="invalid-feedback">{errors.rol_user}</div>}
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <label className="form-label"><i className="bx bxs-buildings"/> Filial</label>
                                        <select
                                            className={`form-select shadow-sm ${errors.filial_id ? "is-invalid" : ""}`}
                                            name="filial_id"
                                            value={formData.filial_id}
                                            onChange={handleChange}
                                        >
                                            <option value="">Seleccione una filial</option>
                                            {filiales.map(filial => (
                                                <option key={filial._id} value={filial._id}>
                                                    {filial.nombre_filial}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.filial_id && <div className="invalid-feedback">{errors.filial_id}</div>}
                                    </div>
                                </div>
                                
                                <div className="text-center">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary me-2" 
                                        onClick={() => navigate("/Lista_usuarios")}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-outline-success"
                                    >
                                        <i className="uil-user-plus fs-6"/> Agregar Usuario
                                    </button>
                                </div>
                            </form>
                            
                            {showAlert && (
                                <AlertComponent
                                    type={alertType}
                                    entity="Usuario"
                                    action={alertType === "success" ? "create" : "error"}
                                    onCancel={handleAlertClose}
                                    message={alertMessage}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CrearUsuario;