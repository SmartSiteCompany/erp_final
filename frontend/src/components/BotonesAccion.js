// BotonesAccion.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BotonesAccion = ({ id, entidad, setAlert }) => {
    const navigate = useNavigate();
    const handleView = () => {
        navigate(`/${entidad}/ver/${id}`);
    };

    const handleUpdate = () => {
        navigate(`/${entidad}/editar/${id}`);
    };

    const handleDelete = () => {
        // Muestra la alerta de confirmación
        setAlert({ type: "info", action: "confirmDelete", entity: entidad, id: id });
      };

    return (
        <div>
            <button onClick={handleView} className="btn m-1 btn-sm btn-info me-1" title="Ver">
                <i className="uil uil-eye"></i>
            </button>
            <button onClick={handleUpdate} className="btn m-1 btn-sm btn-primary me-1" title="Editar">
                <i className="uil uil-pen"></i>
            </button>
            <button onClick={handleDelete} className="btn m-1 btn-sm btn-danger me-1" title="Eliminar">
                <i className="uil uil-trash-alt"></i>
            </button>
        </div>
       
    );
};

export default BotonesAccion;