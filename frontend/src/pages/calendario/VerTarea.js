import React from "react";

const VerTarea = ({ 
  newEvent, 
  clientes, 
  filiales,
  usuarios,
  loading, 
  changeToEditMode, 
  closeModal
}) => {
  if (!newEvent) {
    console.error("La tarea no está definida");
    return <p>No se puede mostrar la tarea. Por favor, inténtalo de nuevo.</p>; // Mensaje de error
  }
  // Buscar el cliente
  const cliente = clientes.find(c => c._id === newEvent.cliente_id);
  const clienteNombre = cliente ? cliente.nombre : "Sin cliente";
  
  // Buscar la filial
  const filial = filiales.find(f => f._id === newEvent.filial_id);
  const filialNombre = filial ? filial.nombre_filial : "Sin filial";
  
  // Buscar el usuario asignado
  const usuario = usuarios.find(u => u._id === newEvent.usuario_id);
  const usuarioNombre = usuario ? usuario.name : "Sin asignar";
  
// Calcular duración en días y horas
const calcularDuracion = () => {
  if (!newEvent.fecha_creacion || !newEvent.fecha_vencimiento) return "Duración no disponible";
  
  const inicio = new Date(newEvent.fecha_creacion);
  const fin = new Date(newEvent.fecha_vencimiento);
  
  // Calculamos la diferencia en milisegundos
  const diffTime = Math.abs(fin - inicio);
  
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
  
  let durationStr = "";
  if (diffDays > 0) durationStr += `${diffDays} día${diffDays > 1 ? 's' : ''} `;
  if (diffHours > 0) durationStr += `${diffHours} hora${diffHours > 1 ? 's' : ''} `;
  if (diffMinutes > 0) durationStr += `${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
  
  return durationStr.trim() || "Menos de un minuto";
};
  
// Formatear la fecha para mostrar (fecha y hora)
const formatDate = (dateString) => {
  if (!dateString) return "Sin fecha";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return dateString;
  }
};

  // Obtener color según estado
  const getColorForEstado = (estado) => {
    const colors = {
      'pendiente': '#dc3545',
      'en progreso': '#ffc107',
      'completada': '#28a745'
    };
    return colors[estado] || '#6c757d';
  };

  return (
    <div>
      <div className="mb-3">
        <h6 className="text-muted">Cliente:</h6>
        <p>{clienteNombre}</p>
      </div>
      
      <div className="mb-3">
        <h6 className="text-muted">Descripción:</h6>
        <p>{newEvent.descripcion || "Sin descripción"}</p>
      </div>
      
      <div className="row mb-3">
        <div className="col-md-6">
          <h6 className="text-muted">Fecha de inicio:</h6>
          <p>{formatDate(newEvent.fecha_creacion)}</p>
        </div>
        
        <div className="col-md-6">
          <h6 className="text-muted">Fecha de vencimiento:</h6>
          <p>{formatDate(newEvent.fecha_vencimiento)}</p>
        </div>
      </div>
      
      <div className="mb-3">
        <h6 className="text-muted">Duración:</h6>
        <p>{calcularDuracion()}</p>
      </div>
      
      <div className="mb-3">
        <h6 className="text-muted">Filial:</h6>
        <p>{filialNombre}</p>
      </div>
      
      <div className="mb-3">
        <h6 className="text-muted">Estado:</h6>
        <span 
          className="badge"
          style={{ 
            backgroundColor: getColorForEstado(newEvent.estado),
            fontSize: '14px',
            padding: '6px 12px'
          }}
        >
          {newEvent.estado || "Sin estado"}
        </span>
      </div>
      
      <div className="mb-3">
        <h6 className="text-muted">Asignado a:</h6>
        <p>{usuarioNombre}</p>
      </div>
      
      <div className="row mt-4">
        <div className="col-6">
          <button
            type="button"
            className="btn btn-primary w-100"
            onClick={changeToEditMode}
            disabled={loading}
          >
            {loading ? "Cargando..." : "Editar"}
          </button>
        </div>
        
        <div className="col-6">
          <button
            type="button"
            className="btn btn-light w-100"
            onClick={closeModal}
            disabled={loading}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerTarea;