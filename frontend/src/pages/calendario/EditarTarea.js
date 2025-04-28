 import React from "react";

const EditarTarea = ({ 
  newEvent = {}, 
  clientes = [], 
  filiales = [],
  usuarios = [],
  loading = false, 
  handleInputChange = () => {}, 
  handleSubmit = () => {}, 
  handleDelete = () => {},
  closeModal = () => {}
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
      // Formatear como YYYY-MM-DD
  
      handleInputChange(field, value);
    } else {
      handleInputChange(field, '');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        {/* Campo Cliente */}
        <div className="col-12 mb-3">
          <label className="form-label">Cliente</label>
          <select 
            className="form-select"
            value={safeEvent.cliente_id}
            onChange={(e) => handleInputChange('cliente_id', e.target.value)}
            disabled={loading}
          >
            <option value="">Seleccionar cliente...</option>
            {Array.isArray(clientes) && clientes.map((cliente) => (
              <option key={cliente._id} value={cliente._id}>
                {cliente.nombre || 'Sin nombre'}
              </option>
            ))}
          </select>
        </div>

        {/* Campo Descripción */}
        <div className="col-12 mb-3">
          <label className="form-label">Descripción*</label>
          <input
            type="text"
            className="form-control"
            value={safeEvent.descripcion}
            onChange={(e) => handleInputChange('descripcion', e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Campo Fecha de Inicio */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Fecha de inicio*</label>
          <input
             type="datetime-local"
            className="form-control"
            value={safeEvent.fecha_creacion ?safeEvent.fecha_creacion.slice(0, 16) : ''}
            onChange={(e) => handleDateChange('fecha_creacion', e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Campo Fecha de Vencimiento */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Fecha de vencimiento*</label>
          <input
             type="datetime-local"
            className="form-control"
            value={safeEvent.fecha_vencimiento ? safeEvent.fecha_vencimiento.slice(0, 16) : ''}
            onChange={(e) => handleDateChange('fecha_vencimiento', e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Campo Filial */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Filial*</label>
          <select 
            className="form-select"
            value={safeEvent.filial_id}
            onChange={(e) => handleInputChange('filial_id', e.target.value)}
            required
            disabled={loading}
          >
            <option value="">Seleccionar filial...</option>
            {Array.isArray(filiales) && filiales.map((filial) => (
              <option key={filial._id} value={filial._id}>
                {filial.nombre_filial || 'Sin nombre'}
              </option>
            ))}
          </select>
        </div>

        {/* Campo Estado */}
        <div className="col-md-6 mb-3">
          <label className="form-label">Estado</label>
          <select
            className="form-select"
            value={safeEvent.estado}
            onChange={(e) => handleInputChange('estado', e.target.value)}
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

        {/* Campo Usuario Asignado */}
        <div className="col-12 mb-3">
          <label className="form-label">Asignar a</label>
          <select
            className="form-select"
            value={safeEvent.usuario_id}
            onChange={(e) => handleInputChange('usuario_id', e.target.value)}
            disabled={loading}
          >
            <option value="">Sin asignar</option>
            {Array.isArray(usuarios) && usuarios.map((usuario) => (
              <option key={usuario._id} value={usuario._id}>
                {usuario.name || 'Sin nombre'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="d-flex justify-content-between mt-4">
        <button 
          type="button" 
          className="btn btn-danger"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Eliminando...
            </>
          ) : "Eliminar"}
        </button>

        <div>
          <button 
            type="button" 
            className="btn btn-secondary me-2"
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
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Guardando...
              </>
            ) : "Guardar"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default EditarTarea;