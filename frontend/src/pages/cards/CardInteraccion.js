import React from 'react';
import { useNavigate } from 'react-router-dom';

const CardInteraccion = ({ interaccion }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/interaccions/ver/${interaccion._id}`);
  };

  const getInteractionIcon = () => {
    switch(interaccion.tipo_interaccion) {
      case 'llamada': return 'mdi-phone';
      case 'correo': return 'mdi-email';
      case 'reunión': return 'mdi-account-group';
      case 'visita': return 'mdi-account';
      default: return 'mdi-help-circle';
    }
  };

  return (
    <div className="card bg-purple text-white shadow-purple mb-3">
      <div className="card-body">
        <div className="d-flex align-items-center mb-2">
          <i className={`mdi ${getInteractionIcon()} fs-4 me-2`}></i>
          <h5 className="card-title mb-0">
            {interaccion.tipo_interaccion} con {interaccion.cliente_id?.nombre || 'cliente'}
          </h5>
        </div>
        
        <div className="mb-2">
          <small className="text-white-50">
            {new Date(interaccion.fecha).toLocaleDateString('es-ES', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </small>
        </div>
        
        <p className="card-text">{interaccion.descripcion}</p>
        <p className="card-text">Responsable: {interaccion.responsable}</p>
        
        <span className={`badge ${getStatusBadgeClass(interaccion.estado)}`}>
          {interaccion.estado}
        </span>
        
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

const getStatusBadgeClass = (status) => {
  switch(status) {
    case 'pendiente': return 'bg-warning text-dark';
    case 'completada': return 'bg-success';
    case 'cancelada': return 'bg-danger';
    default: return 'bg-secondary';
  }
};

export default CardInteraccion;