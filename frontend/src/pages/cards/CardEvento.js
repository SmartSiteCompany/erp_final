import React from 'react';
import { useNavigate } from 'react-router-dom';

const CardEvento = ({ evento }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/evento/ver/${evento._id}`);
  };

  return (
    <div className="card bg-info text-white shadow-info mb-3">
      <div className="card-body">
        <div className="d-flex align-items-center mb-2">
          <i className="mdi mdi-calendar fs-4 me-2"></i>
          <h5 className="card-title mb-0">{evento.nombre}</h5>
        </div>
        
        <div className="mb-2">
          <small className="text-white-50">
            Fecha: {new Date(evento.fecha).toLocaleDateString('es-ES', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </small>
        </div>
        
        <p className="card-text">{evento.descripcion}</p>
        <p className="card-text">
          <i className="mdi mdi-map-marker me-1"></i>
          {evento.ubicacion}
        </p>
        
        <button 
          onClick={handleViewDetails}
          className="btn btn-sm btn-light mt-2"
        >
          Ver detalles
        </button>
      </div>
    </div>
  );
};

export default CardEvento;