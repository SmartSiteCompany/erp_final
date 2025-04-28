import React, { useState, useRef, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import { Link } from "react-router-dom";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from '@fullcalendar/core/locales/es'; 
import Layout from "../../layouts/pages/layout";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle";
import TareaService from "../../services/TareaService";
import ClienteService from "../../services/ClienteService";
import FilialService from "../../services/FilialService";
import UserService from "../../services/UserService";
import CrearTarea from "../calendario/CrearTarea";
import EditarTarea from "../calendario/EditarTarea";
import VerTarea from "../calendario/VerTarea";

const Calendario = () => {
  const [events, setEvents] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [filiales, setFiliales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    filial_id: "",
    usuario_id: "",
    estado: ""
  });

  const [newEvent, setNewEvent] = useState({
    id: null,
    cliente_id: "",
    descripcion: "",
    fecha_creacion: new Date().toISOString().split('T')[0],
    fecha_vencimiento: new Date().toISOString().split('T')[0],
    filial_id: "",
    estado: "pendiente",
    usuario_id: ""
  });
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [viewMode, setViewMode] = useState("edit");

  const modalRef = useRef(null);
  const calendarRef = useRef(null);

  const tareaService = useRef(TareaService());
  const clienteService = useRef(ClienteService());
  const filialService = useRef(FilialService());
  const userService = useRef(UserService());

  // Función para obtener el color según la filial
  const getColorForFilial = useCallback((nombre_filial) => {
    const colors = {
      'DataX': '#34c38f',       // Verde
      'StudioDesign': '#f46a6a', // Rojo
      'GeneralSystech': '#50a5f1', // Azul
      'SmartSite': '#f1b44c'     // Amarillo
    };
    return colors[nombre_filial] || '#cccccc';
  }, []);

  // Función para obtener ícono según la filial
  const getIconForFilial = useCallback((nombre_filial) => {
    const icons = {
      'DataX': 'mdi-database',
      'StudioDesign': 'mdi-vector-arrange-above',
      'GeneralSystech': 'mdi-server-network',
      'SmartSite': 'mdi-checkbox-blank-circle'
    };
    return icons[nombre_filial] || 'mdi-help-circle';
  }, []);

  // Función para filtrar eventos
  const filterEvents = useCallback((events, filters) => {
    return events.filter(event => {
      return (
        (filters.filial_id === "" || event.extendedProps.filial_id === filters.filial_id) &&
        (filters.usuario_id === "" || event.extendedProps.usuario_id === filters.usuario_id) &&
        (filters.estado === "" || event.extendedProps.estado === filters.estado)
      );
    });
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tareas, clientesData, filialesData, usuariosData] = await Promise.all([
          tareaService.current.obtenerTareas(),
          clienteService.current.obtenerClientes(),
          filialService.current.obtenerFilials(),
          userService.current.obtenerUsuarios()
        ]);

        setClientes(clientesData);
        setFiliales(filialesData);
        setUsuarios(usuariosData);

        // Crear mapa de filiales para fácil acceso
        const filialesMap = {};
        filialesData.forEach(filial => {
          filialesMap[filial._id] = filial.nombre_filial;
        });

        const usuariosMap = {};
        usuariosData.forEach(usuario => {
          usuariosMap[usuario._id] = usuario;
        });


    // Mapear tareas a eventos del calendario
  // Mapear tareas a eventos del calendario
      const eventos = tareas.map(tarea => {
      const nombreFilial = filialesMap[tarea.filial_id] || 'Desconocida';
      const usuario = usuariosMap[tarea.usuario_id] || {};
      const borderColor = tarea.estado === 'completada' ? '#28a745' :
                          tarea.estado === 'en progreso' ? '#ffc107' : '#dc3545';

      const startDate = new Date(tarea.fecha_creacion);
      const endDate = new Date(tarea.fecha_vencimiento);
      // Remove adding one day to endDate to preserve time
      // Use full ISO strings for start and end
      const startStr = startDate.toISOString();
      const endStr = endDate.toISOString();

      return {
        id: tarea._id,
        title: `${tarea.descripcion} (${usuario.name || 'Sin asignar'})`,
        start: startStr,
        end: endStr,
        backgroundColor: getColorForFilial(nombreFilial),
        borderColor: borderColor,
        textColor: '#000',
        allDay: false,
        display: 'block',
        extendedProps: {
          cliente_id: tarea.cliente_id,
          filial_id: tarea.filial_id,
          estado: tarea.estado,
          usuario_id: tarea.usuario_id,
          usuario_nombre: usuario.name || 'Sin asignar'
        }
      };
    });

        setEvents(eventos);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getColorForFilial]);

  // Función para cerrar el modal
  const closeModal = () => {
    if (modalRef.current) {
      const modal = bootstrap.Modal.getInstance(modalRef.current);
      if (modal) modal.hide();
    }
    setShowModal(false);
    setViewMode("edit");
  };

  // Manejo de eventos del calendario
  const handleDateClick = (info) => {
    // Use full datetime string from clicked date
    const clickedDate = new Date(info.date);
    const localDateString = clickedDate.toISOString().slice(0,16); // YYYY-MM-DDTHH:mm
    setNewEvent({
      id: null,
      cliente_id: "",
      descripcion: "",
      fecha_creacion: localDateString,
      fecha_vencimiento: localDateString,
      filial_id: filiales[0]?._id || "",
      estado: "pendiente",
      usuario_id: ""
    });
    setModalMode("create");
    setViewMode("edit");
    setShowModal(true);
  };

  const handleEventClick = (info) => {
    // Use full datetime strings without normalization
    let startDate = '';
    if (info.event.start) {
      startDate = new Date(info.event.start).toISOString().slice(0,16);
    }

    let endDate = '';
    if (info.event.end) {
      endDate = new Date(info.event.end).toISOString().slice(0,16);
    } else {
      endDate = startDate;
    }

    const eventData = {
      id: info.event.id,
      cliente_id: info.event.extendedProps.cliente_id?._id || info.event.extendedProps.cliente_id,
      descripcion: info.event.title.split(' (')[0],
      fecha_creacion: startDate,
      fecha_vencimiento: endDate, 
      estado: info.event.extendedProps.estado || "pendiente",
      usuario_id: info.event.extendedProps.usuario_id
    };

    setNewEvent(eventData);
    setModalMode("edit");
    setViewMode("view");
    setShowModal(true);
  };

  // Manejo de cambio de fecha por arrastre
  const handleEventDrop = async (info) => {
    try {
      const startDate = new Date(info.event.start);
      const endDate = info.event.end ? new Date(info.event.end) : new Date(info.event.start);

       // Format dates consistently as YYYY-MM-DDTHH:mm:ssZ
      const formattedStartDate = startDate.toISOString();
      const formattedEndDate = endDate.toISOString();

      await tareaService.current.actualizarTarea(info.event.id, {
      fecha_creacion: formattedStartDate,
      fecha_vencimiento: formattedEndDate
      });
    } catch (error) {
      console.error("Error al actualizar fecha:", error);
      info.revert();
    }
  };

  // Manejo de cambio de duración por redimensionamiento
  const handleEventResize = async (info) => {
    try {
      const endDate = new Date(info.event.end);
      const formattedEndDate = endDate.toISOString();
    
      await tareaService.current.actualizarTarea(info.event.id, {
        fecha_vencimiento: formattedEndDate
      });
    } catch (error) {
      console.error("Error al actualizar duración:", error);
      info.revert();
    }
  };

  // Manejo de creación y edición de tareas
  const handleEventSubmit = async (e) => {
    e.preventDefault();
  
    if (!newEvent.descripcion.trim() || !newEvent.filial_id) {
      alert("Por favor complete todos los campos obligatorios");
      return;
    }
  
    try {
      setLoading(true);
  
      // Formatear la fecha de inicio como UTC
      const formattedStartDate = new Date(newEvent.fecha_creacion).toISOString(); // Mantener en UTC
      // Formatear la fecha de vencimiento como UTC
      const formattedEndDate = new Date(newEvent.fecha_vencimiento).toISOString(); // Mantener en UTC
  
      const tareaData = {
        cliente_id: newEvent.cliente_id || null,
        descripcion: newEvent.descripcion,
        fecha_creacion: formattedStartDate,
        fecha_vencimiento: formattedEndDate, // Usar la fecha de vencimiento tal como se establece
        filial_id: newEvent.filial_id,
        estado: newEvent.estado,
        usuario_id: newEvent.usuario_id
      };
  
      let response;
  
      if (modalMode === "edit" && newEvent.id) {
        response = await tareaService.current.actualizarTarea(newEvent.id, tareaData);
      } else {
        response = await tareaService.current.crearTarea(tareaData);
      }

      // Obtener nombre de la filial para el color
      const filial = filiales.find(f => f._id === response.filial_id);
      const nombreFilial = filial ? filial.nombre_filial : 'Desconocida';
      const usuario = usuarios.find(u => u._id === response.usuario_id) || {};
      const borderColor = response.estado === 'completada' ? '#28a745' :
                          response.estado === 'en progreso' ? '#ffc107' : '#dc3545';

      const updatedEvent = {
        id: response._id,
        title: `${response.descripcion} (${usuario.name || 'Sin asignar'})`,      
        start: response.fecha_creacion,
        end: formattedEndDate,
        backgroundColor: getColorForFilial(nombreFilial),
        borderColor: borderColor,
        allDay: false,
        display: 'block',
        textColor: '#000000',
        extendedProps: {
          cliente_id: response.cliente_id,
          filial_id: response.filial_id,
          nombre_filial: nombreFilial,
          estado: response.estado,
          usuario_id: response.usuario_id,
          usuario_nombre: usuario.name || 'Sin asignar'
        }
      };

      if (modalMode === "edit") {
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event.id === newEvent.id ? updatedEvent : event
          )
        );
      } else {
        setEvents(prevEvents => [...prevEvents, updatedEvent]);
      }

      closeModal();
    } catch (error) {
      console.error("Error al guardar tarea:", error);
      alert("Ocurrió un error al guardar la tarea. Por favor intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Eliminación de tarea
  const handleDeleteEvent = async () => {
    if (!newEvent.id) return;

    try {
      setLoading(true);
      await tareaService.current.eliminarTarea(newEvent.id);
      setEvents(events.filter(event => event.id !== newEvent.id));
      closeModal();
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
      alert("Ocurrió un error al eliminar la tarea. Por favor intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Inicialización del modal
  useEffect(() => {
    if (modalRef.current && showModal) {
      const modal = new bootstrap.Modal(modalRef.current, { keyboard: false });
      modal.show();

      const currentModalRef = modalRef.current;

      const handleHidden = () => {
        setShowModal(false);
        setViewMode("edit");
      };

      modalRef.current.addEventListener('hidden.bs.modal', handleHidden);

      return () => {
        if (currentModalRef) {
          currentModalRef.removeEventListener('hidden.bs.modal', handleHidden);
        }
      };
    }
  }, [showModal]);

  // Manejo de cambio en el formulario
  const handleInputChange = (field, value) => {
    setNewEvent(prev => ({ ...prev, [field]: value }));
  };

  // Manejo de cambio en los filtros
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Filtrar eventos según los filtros aplicados
  const filteredEvents = filterEvents(events, filters);

  return (
    <Layout>
      <div className="container-fluid mt-4 min-vh-100 d-flex flex-column">
        <div className="row flex-grow-1">
          <div className="col-lg-3">
            <div className="card h-100">
              <div className="card-body text-center">
                <button
                  className="btn btn-primary w-100 mb-3"
                  onClick={() => {
                    setNewEvent({
                      id: null,
                      cliente_id: "",
                      descripcion: "",
                      fecha_creacion: new Date().toISOString().split('T')[0],
                      fecha_vencimiento: new Date().toISOString().split('T')[0],
                      filial_id: filiales[0]?._id || "",
                      estado: "pendiente",
                      usuario_id: ""
                    });
                    setModalMode("create");
                    setViewMode("edit");
                    setShowModal(true);
                  }}
                  disabled={loading}
                >
                  {loading ? "Cargando..." : "Crear Nueva Tarea"}
                </button>

                {/* Filtros */}
                <div className="mb-3">
                  <label className="form-label">Filtrar por Filial</label>
                  <select
                    className="form-select"
                    value={filters.filial_id}
                    onChange={(e) => handleFilterChange('filial_id', e.target.value)}
                  >
                    <option value="">Todas las filiales</option>
                    {filiales.map(filial => (
                      <option key={filial._id} value={filial._id}>
                        {filial.nombre_filial}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Filtrar por Usuario</label>
                  <select
                    className="form-select"
                    value={filters.usuario_id}
                    onChange={(e) => handleFilterChange('usuario_id', e.target.value)}
                  >
                    <option value="">Todos los usuarios</option>
                    {usuarios.map(usuario => (
                      <option key={usuario._id} value={usuario._id} >
                        {usuario.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Filtrar por Estado</label>
                  <select
                    className="form-select"
                    value={filters.estado}
                    onChange={(e) => handleFilterChange('estado', e.target.value)}
                  >
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="en progreso">En progreso</option>
                    <option value="completada">Completada</option>
                  </select>
                </div>

                <div className="row justify-content-center mt-3">
                  <Link to="/" className="mb-3 d-block auth-logo">
                    <img
                      src="/assets/images/coming-soon-img.png"
                      alt="Coming Soon"
                      className="img-fluid d-block"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </Link>
                </div>

                <div id="external-events" className="mt-2">
                  <p className="text-muted">Leyenda de filiales:</p>
                  {filiales.map(filial => (
                    <div
                      key={filial._id}
                      className="external-event"
                      style={{
                        backgroundColor: getColorForFilial(filial.nombre_filial),
                        color: '#000',
                        padding: '8px',
                        marginBottom: '10px',
                        borderRadius: '4px'
                      }}
                    >
                      <i className={`mdi ${getIconForFilial(filial.nombre_filial)} me-2 vertical-middle`}></i>
                      {filial.nombre_filial}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-9 d-flex flex-column h-100">
            <div className="card flex-grow-1">
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                ) : (
                  <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                      left: "prev,next today",
                      center: "title",
                      right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth"
                    }}
                    timeZone="local"
                    firstDay={1} 
                    events={filteredEvents}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    eventDrop={handleEventDrop}
                    eventResize={handleEventResize}
                    editable={true}
                    eventDisplay="block"
                    displayEventEnd={false} 
                    eventTextColor="#000"
                    slotMinTime="00:00:00"
                    slotMaxTime="24:00:00" 
                    dayMaxEventRows={3}
                    locale={esLocale}
                    eventDidMount={({ event, el }) => {
                      const filial = filiales.find(f => f._id === event.extendedProps.filial_id);
                      new bootstrap.Tooltip(el, {
                        title: `
                          <strong>${event.title}</strong><br>
                          Filial: ${filial?.nombre_filial || 'N/A'}<br>
                          Estado: ${event.extendedProps.estado}
                        `,
                        html: true,
                        placement: 'top'
                      });
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para crear/editar/ver tareas */}
      <div
        ref={modalRef}
        className="modal fade"
        id="event-modal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header py-3 px-4 border-bottom-0">
              <h5 className="modal-title">
                {modalMode === "create" ? "Crear Tarea" : viewMode === "view" ? "Detalles de Tarea" : "Editar Tarea"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={closeModal}
                disabled={loading}
              ></button>
            </div>

            <div className="modal-body p-4">
              {modalMode === "create" && (
                <CrearTarea
                  newEvent={newEvent}
                  clientes={clientes}
                  filiales={filiales}
                  usuarios={usuarios}
                  loading={loading}
                  handleInputChange={handleInputChange}
                  handleSubmit={handleEventSubmit}
                  closeModal={closeModal}
                />
              )}

              {modalMode === "edit" && viewMode === "edit" && (
                <EditarTarea
                  newEvent={newEvent}
                  clientes={clientes}
                  filiales={filiales}
                  usuarios={usuarios}
                  loading={loading}
                  handleInputChange={handleInputChange}
                  handleSubmit={handleEventSubmit}
                  handleDelete={handleDeleteEvent}
                  closeModal={closeModal}
                />
              )}

              {modalMode === "edit" && viewMode === "view" && (
                <VerTarea
                  newEvent={newEvent}
                  clientes={clientes}
                  filiales={filiales}
                  usuarios={usuarios}
                  loading={loading}
                  changeToEditMode={() => setViewMode("edit")}
                  closeModal={closeModal}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Calendario;