import React from 'react';


const CrearTarea = ({ 
  newEvent , 
  clientes = [], 
  filiales = [], 
  usuarios = [], 
  loading, 
  handleInputChange, 
  handleSubmit, 
  closeModal 
}) => {
  // Manejo seguro de valores
  const safeEvent = {
    cliente_id: newEvent.cliente_id || '',
    descripcion: newEvent.descripcion || '',
    fecha_creacion: newEvent.fecha_creacion || '',
    fecha_vencimiento: newEvent.fecha_vencimiento || '',
    filial_id: newEvent.filial_id || '',
    usuario_id: newEvent.usuario_id || '',
    estado: newEvent.estado || 'pendiente'
  };
  
  // Obtener la filial seleccionada de manera segura
  const selectedFilial = filiales.find(f => f._id === safeEvent.filial_id);
  
  // Colores según estado
  const getColorForEstado = (estado) => {
    const colors = {
      'pendiente': '#dc3545',
      'en progreso': '#ffc107',
      'completada': '#28a745'
    };
    return colors[estado] || '#6c757d';
  };

  // Función para manejar cambios en las fechas con formato consistente
  const handleDateChange = (field, value) => {
    // Asegurarse de que el valor sea una fecha válida
    if (value) {
      // Formatear como YYYY-MM-DDTHH:mm (datetime-local compatible)
      const formattedDate = new Date(value).toISOString().slice(0,16);
      handleInputChange(field, formattedDate);
    } else {
      handleInputChange(field, '');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        {/* Descripción */}
        <div className="col-md-12 mb-3">
          <label className="form-label">Descripción*</label>
          <input
            type="text"
            className="form-control"
            value={newEvent.descripcion || ''}
            onChange={(e) => handleInputChange('descripcion', e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Filial */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Filial*</label>
          <select
            className="form-select"
            value={newEvent.filial_id || ''}
            onChange={(e) => handleInputChange('filial_id', e.target.value)}
            required
            disabled={loading}
          >
            <option value="">Seleccione una filial</option>
            {filiales.map(filial => (
              <option key={filial._id} value={filial._id}>{filial.nombre_filial}</option>
            ))}
          </select>
        </div>

        {/* Cliente */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Cliente</label>
          <select
            className="form-select"
            value={newEvent.cliente_id || ''}
            onChange={(e) => handleInputChange('cliente_id', e.target.value)}
            disabled={loading}
          >
            <option value="">Seleccione un cliente</option>
            {clientes.map(clientes => (
              <option key={clientes._id} value={clientes._id}>{clientes.nombre}</option>
            ))}
          </select>
        </div>

       {/* Fecha de creación */}
       <div className="col-md-6 mb-3">
          <label className="form-label">Fecha de creación*</label>
          <input
            type="datetime-local"
            className="form-control"
            value={newEvent.fecha_creacion ? newEvent.fecha_creacion.slice(0,16) : ''}
            onChange={(e) => handleDateChange('fecha_creacion', e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Fecha de vencimiento */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Fecha de vencimiento*</label>
          <input
            type="datetime-local"
            className="form-control"
            value={newEvent.fecha_vencimiento ? newEvent.fecha_vencimiento.slice(0,16) : ''}
            onChange={(e) => handleDateChange('fecha_vencimiento', e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Estado */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Estado*</label>
          <select
            className="form-select"
            value={newEvent.estado || 'pendiente'}
            onChange={(e) => handleInputChange('estado', e.target.value)}
            required
            disabled={loading}
            style={{
              backgroundColor: getColorForEstado(safeEvent.estado),
              color: safeEvent.estado === 'en progreso' ? '#000' : '#fff',
              fontWeight: 'bold'
            }}
          >
            <option value="pendiente">Pendiente</option>
            <option value="en progreso">En progreso</option>
            <option value="completada">Completada</option>
          </select>
        </div>

        {/* Asignar a */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Asignar a</label>
          <select
            className="form-select"
            value={newEvent.usuario_id || ''}
            onChange={(e) => handleInputChange('usuario_id', e.target.value)}
            disabled={loading}
          >
            <option value="">Seleccione un usuario</option>
            {usuarios.map(usuario => (
              <option key={usuario._id} value={usuario._id}>{usuario.name} {usuario.apellidos}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Botones */}
      <div className="d-flex justify-content-end gap-2 mt-4">
        <button 
          type="button" 
          className="btn btn-light" 
          onClick={closeModal}
          disabled={loading}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar Tarea'}
        </button>
      </div>
    </form>
  );
};

export default CrearTarea;
