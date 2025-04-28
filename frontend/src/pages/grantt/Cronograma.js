import React, { useEffect, useRef, useState } from "react";
import Layout from "../../layouts/pages/layout";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import gantt from "dhtmlx-gantt";
import TareaService from "../../services/TareaService";
import ClienteService from "../../services/ClienteService"; 
import FilialService from "../../services/FilialService";
import UserService from "../../services/UserService";
import CrearTarea from "../calendario/CrearTarea"; 
import EditarTarea from "../calendario/EditarTarea"; 
import VerTarea from "../calendario/VerTarea"; 

const Cronograma = () => {
  const ganttContainer = useRef(null);
  const [scale, setScale] = useState("mes");
  const [tasks, setTasks] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [viewMode, setViewMode] = useState("full"); // 'full' o 'compact'

  // Estados para controlar los modales
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create', 'edit', 'view'
  const [selectedTask, setSelectedTask] = useState(null); // Datos de la tarea para el modal

  // Estados para los datos necesarios en los modales
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [filiales, setFiliales] = useState([]);

  const tareaService = TareaService();
  const clienteService = ClienteService();
  const filialService = FilialService();
  const userService = UserService();

  // Función auxiliar para obtener estilos basados en el estado
  const getStatusStyle = (estado) => {
    switch (estado) {
      case "pendiente":
        return { text: "red", bar: "red" };
      case "en progreso":
        return { text: "orange", bar: "orange" };
      case "completada":
        return { text: "green", bar: "green" };
      default:
        return { text: "gray", bar: "gray" };
    }
  };

  // Efecto para escuchar cambios en el tamaño de la ventana (sin cambios aquí)
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      // Cambiar a vista compacta automáticamente en móviles
      if (window.innerWidth < 768) {
        setViewMode("compact");
      } else {
        setViewMode("full");
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Ejecutar al montar el componente

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Efecto principal para inicializar y actualizar el Gantt
  useEffect(() => {
    if (!ganttContainer.current) return;

     // Configurar el idioma español
     gantt.i18n.setLocale("es");
    // Configuración inicial obligatoria
    gantt.config.xml_date = "%Y-%m-%d %H:%i";
    gantt.config.autofit = true;
    gantt.config.preserve_scroll = true;

    // Añadir estas configuraciones críticas
    gantt.config.grid_width = viewMode === "compact" ? 200 : 400;
    gantt.config.auto_types = true;
    gantt.config.show_errors = true;
    gantt.config.rtl = false;

    // Inicializar antes de cargar datos
    gantt.init(ganttContainer.current);

    // Personalizar escalas (se llama inmediatamente después de inicializar)
    setGanttScale(scale);

    // Cargar datos después de la inicialización
    if (tasks.length > 0) {
      gantt.parse({ data: filtrarTareas(tasks, filtro) });
      autoFit();
    }

    // Estilos para las tareas basadas en estado
    gantt.templates.task_class = (start, end, task) => {
      if (task.estado === 'pendiente') return "gantt-task-danger";
      if (task.estado === 'en progreso') return "gantt-task-warning";
      if (task.estado === 'completada') return "gantt-task-success";
      return "";
    };

    // Manejar el click en una tarea para abrir el modal de visualización
    gantt.attachEvent("onTaskClick", (id, e) => {
      const action = e.target.closest("[data-action]");
      if (!action) {
        // Abrir el modal para ver los detalles
        const ganttTask = gantt.getTask(id);
        setSelectedTask(mapGanttTaskToModalData(ganttTask));
        setModalMode("view");
        setShowModal(true);
        return true; // Evita el comportamiento predeterminado de Gantt
      }

      const actionType = action.dataset.action;
      const taskId = action.dataset.id;

      if (actionType === "editar") {
        // Abrir el modal para editar
        const ganttTask = gantt.getTask(taskId);
        setSelectedTask(mapGanttTaskToModalData(ganttTask));
        setModalMode("edit");
        setShowModal(true);
      } else if (actionType === "eliminar") {
        console.log(`Eliminar tarea: ${taskId}`);
        // Aquí iría tu lógica para eliminar la tarea
      }

      return false;
    });

    // Ajustar automáticamente después de cargar datos
    setTimeout(autoFit, 300);

    return () => {
      gantt.clearAll();
    };
  }, [tasks, filtro, scale, viewMode]);

  // Función para mapear una tarea de Gantt al formato de los datos del modal
  const mapGanttTaskToModalData = (ganttTask) => {
    if (!ganttTask) {
      console.error("ganttTask is undefined");
      return {}; // O maneja el error de otra manera
    }
    return {
      id: ganttTask.id,
      descripcion: ganttTask.text,
      fecha_creacion: new Date(ganttTask.start_date).toISOString().split("T")[0],
      fecha_vencimiento: new Date(ganttTask.end_date).toISOString().split("T")[0],
      filial_id: ganttTask.filial_id,
      usuario_id: ganttTask.usuario_id,
      cliente_id: ganttTask.cliente_id,
      estado: ganttTask.estado,
    };
  };

  // Función para ajustar automáticamente el zoom (sin cambios aquí)
  const autoFit = () => {
    if (tasks.length === 0) return;

    const startDates = tasks.map((t) => new Date(t.start_date));
    const endDates = tasks.map((t) => new Date(t.end_date));

    const minDate = new Date(Math.min(...startDates));
    const maxDate = new Date(Math.max(...endDates));

    minDate.setDate(minDate.getDate() - 15);
    maxDate.setDate(maxDate.getDate() + 15);

    gantt.config.start_date = minDate;
    gantt.config.end_date = maxDate;

    gantt.render();
  };

  // Función para mapear tareas al formato que espera Gantt (sin cambios importantes aquí)
// Example of how mapTareasToGantt should look
const mapTareasToGantt = (tareas) => {
  return tareas.map((tarea) => ({
    id: tarea._id,
    text: tarea.descripcion, 
    start_date: tarea.fecha_creacion.split('T')[0],
    end_date: tarea.fecha_vencimiento.split('T')[0],
    duration: calcularDiasEntreFechas(tarea.fecha_creacion, tarea.fecha_vencimiento),
    progress: calcularProgreso(tarea.estado),
    estado: tarea.estado,
    filial_id: tarea.filial_id,
    usuario_id: tarea.usuario_id,
    cliente_id: tarea.cliente_id,
    open: true,
  }));
};

  // Calcular días entre fechas (sin cambios aquí)
  const calcularDiasEntreFechas = (fechaInicio, fechaFin) => {
    const diffTime = new Date(fechaFin) - new Date(fechaInicio);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calcular progreso basado en estado (sin cambios aquí)
  const calcularProgreso = (estado) => {
    switch (estado) {
      case "pendiente":
        return 0.1;
      case "en progreso":
        return 0.5;
      case "completada":
        return 1;
      default:
        return 0;
    }
  };

  // Filtrar tareas según el estado seleccionado (sin cambios aquí)
  const filtrarTareas = (tareas, filtro) => {
    if (filtro === "todos") return tareas;
    return tareas.filter((tarea) => tarea.estado === filtro);
  };

  // Cargar datos iniciales (tareas y datos para los modales)
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const [tareasData, clientesData, filialesData, usuariosData] = await Promise.all([
          tareaService.obtenerTareas(),
          clienteService.obtenerClientes(),
          filialService.obtenerFilials(),
          userService.obtenerUsuarios(),
        ]);
        if (!tareasData || !clientesData || !filialesData || !usuariosData) {
          console.error("Error: Datos no cargados correctamente");
          return;
        }

        const tareasMapeadas = mapTareasToGantt(tareasData);
      setTasks(tareasMapeadas);
      setClientes(clientesData);
      setFiliales(filialesData);
      setUsuarios(usuariosData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  cargarDatos();
}, []);

  // Función para manejar el guardado de una tarea desde los modales
 const handleTaskSave = async (taskData) => {
    try {
      setLoading(true);
      if (modalMode === "create") {
        const nuevaTarea = await tareaService.crearTarea(taskData);
        setTasks([...tasks, mapTareasToGantt([nuevaTarea])[0]]); // Añade la nueva tarea al estado
        gantt.addTask(mapTareasToGantt([nuevaTarea])[0]); // Añade la nueva tarea al Gantt
      } else if (modalMode === "edit" && taskData.id) {
        const tareaActualizada = await tareaService.actualizarTarea(taskData.id, taskData);
        const updatedTasks = tasks.map(task =>
          task.id === tareaActualizada._id ? mapTareasToGantt([tareaActualizada])[0] : task
        );
        setTasks(updatedTasks);
        gantt.updateTask(taskData.id, mapTareasToGantt([tareaActualizada])[0]); // Actualiza la tarea en el Gantt
      }
      closeModal();
    } catch (error) {
      console.error("Error al guardar la tarea:", error);
      // Aquí podrías mostrar un mensaje de error al usuario
    } finally {
      setLoading(false);
    }
  }; 

  // Función para cerrar el modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedTask(null);
    setModalMode("create");
  };

  // Función para abrir el modal de creación
  const openCreateModal = () => {
    setSelectedTask({
      id: null,
      cliente_id: clientes[0]?._id || "",
      descripcion: "",
      fecha_creacion: new Date().toISOString().split('T')[0],
      fecha_vencimiento: new Date().toISOString().split('T')[0],
      filial_id: filiales[0]?._id || "",
      estado: "pendiente",
      usuario_id: usuarios[0]?._id || "",
    });
    setModalMode("create");
    setShowModal(true);
  };

  // Configuración de columnas para vista completa (sin cambios importantes aquí)
  const getFullColumnsConfig = () => {
    return [
      {
        name: "combined_info", 
        label: "TAREA",
        width: "*",
        minWidth: 600, 
        tree: true,
        align: "left",
        template: (obj) => `
          <div class="gantt-cell-content" title="${obj.text} (${formatDate(obj.start_date, true)} - ${formatDate(obj.end_date, true)})">
            <div style="font-weight: bold;">
              ${obj.text.length > 10 ? obj.text.substring(0, 15) + "..." : obj.text}
            </div>
            <div style="font-size: 0.9em; color: #777;">
              ${formatDate(obj.start_date, true)} - ${formatDate(obj.end_date, true)}
            </div>
          </div>
        `,
      },
      {
        name: "duration",
        label: "DURACIÓN",
        align: "center",
        width: 10,
        template: (obj) => `<span class="gantt-duration">${obj.duration} días</span>`,
      },
      {
        name: "estado",
        label: "ESTADO",
        align: "center",
        width: 20,
        template: (obj) => {
          const estados = {
            pendiente: '<span class="badge bg-danger">Pendiente</span>',
            "en progreso": '<span class="badge bg-warning">En progreso</span>',
            completada: '<span class="badge bg-success">Completado</span>',
          };
          return estados[obj.estado] || obj.estado;
        },
      },
    ];
  };

  // Configuración de columnas para vista compacta (sin cambios importantes aquí)
  const getCompactColumnsConfig = () => {
    return [
      {
        name: "combined_info", 
        label: "TAREA",
        width: "*",
        minWidth: 600, 
        tree: true,
        align: "left",
        template: (obj) => `
          <div class="gantt-cell-content" title="${obj.text} (${formatDate(obj.start_date, true)} - ${formatDate(obj.end_date, true)})">
            <div style="font-weight: bold; line-height: 1.2;">
              ${obj.text.length > 20 ? obj.text.substring(0, 20) + "..." : obj.text}
            </div>
            <div style="font-size: 0.85em; color: #888; line-height: 1.2;">
              ${formatDate(obj.start_date, true)} - ${formatDate(obj.end_date, true)}
            </div>
          </div>
        `,
      },
      
      
    ];
  };
  // Función de formato de fecha (sin cambios aquí)
  const formatDate = (dateStr, short = false) => {
    const date = new Date(dateStr);
    if (short) {
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
      });
    }
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Inicializar Gantt (con la lógica para los modales integrada)
  useEffect(() => {
    if (!ganttContainer.current || tasks.length === 0) return;

    // Configuración general mejorada
    gantt.config.date_format = "%Y-%m-%d %H:%i";
    gantt.config.work_time = true;
    gantt.config.skip_off_time = true;
    gantt.config.auto_scheduling = true;
    gantt.config.auto_scheduling_strict = true;
    gantt.config.drag_links = true;
    gantt.config.drag_progress = true;
    gantt.config.drag_resize = true;
    gantt.config.drag_move = true;
    gantt.config.fit_tasks = true;
    gantt.config.autosize = "y";
    gantt.config.autosize_min_height = 400;

    // Configuración responsiva de las columnas
    if (viewMode === "compact") {
      gantt.config.row_height = 40;
      gantt.config.bar_height = 24;
      gantt.config.scale_height = 40;
      gantt.config.min_column_width = 60;
      gantt.config.columns = getCompactColumnsConfig();
      gantt.config.grid_width = 200;
    } else {
      gantt.config.row_height = 60;
      gantt.config.bar_height = 36;
      gantt.config.scale_height = 50;
      gantt.config.min_column_width = 80;
      gantt.config.columns = getFullColumnsConfig();
      gantt.config.grid_width = 400;
    }

    // Inicializar el componente Gantt
    gantt.init(ganttContainer.current);

    // Personalizar la carga de datos
    gantt.clearAll();
    const tareasFiltradas = filtrarTareas(tasks, filtro);
    gantt.parse({ data: tareasFiltradas });

    // Estilos para las tareas basadas en estado (sin cambios aquí)
    gantt.templates.task_class = (start, end, task) => {
      if (task.estado === "pendiente") return "gantt-task-danger";
      if (task.estado === "en progreso") return "gantt-task-warning";
      if (task.estado === "completada") return "gantt-task-success";
      return "";
    };

    // Personalizar la apariencia de las barras de tareas (sin cambios importantes aquí)
    gantt.templates.task_text = (start, end, task) => {
      const truncateText = (text, maxLength = viewMode === "compact" ? 15 : 30) => {
        return text.length > maxLength ? text.substring(0, maxLength - 3) + "..." : text;
      };

      return `
        <div class="gantt-task-content">
          <div class="gantt-task-title">${truncateText(task.text)}</div>
          ${viewMode === "full" ? `<div class="gantt-task-progress">${Math.round(task.progress * 100)}%</div>` : ""}
        </div>
      `;
    };

    // Personalizar el tooltip de las tareas (sin cambios importantes aquí)
    gantt.templates.tooltip_text = (start, end, task) => {
      const startDate = new Date(start).toLocaleDateString("es-ES");
      const endDate = new Date(end).toLocaleDateString("es-ES");
      const duration = calcularDiasEntreFechas(start, end);

      return `
        <div class="gantt-tooltip">
          <div class="gantt-tooltip-title">${task.text}</div>
          <div class="gantt-tooltip-dates">
            <div><strong>Inicio:</strong> ${startDate}</div>
            <div><strong>Vencimiento:</strong> ${endDate}</div>
            <div><strong>Duración:</strong> ${duration} días</div>
          </div>
          <div class="gantt-tooltip-progress">
            <strong>Progreso:</strong>
            <div class="progress mt-1" style="height: 10px;">
              <div class="progress-bar ${
                task.estado === "pendiente"
                  ? "bg-danger"
                  : task.estado === "en progreso"
                  ? "bg-warning"
                  : "bg-success"
              }" style="width: ${task.progress * 100}%"></div>
            </div>
            <div class="mt-1"><strong>Estado:</strong> ${task.estado.toUpperCase()}</div>
          </div>
        </div>
      `;
    };

    // Personalizar escalas (sin cambios aquí)
    setGanttScale(scale);

    // Event listeners (el onTaskClick se modificó arriba)
    gantt.attachEvent("onAfterTaskDrag", (id, mode) => {
      console.log(`Tarea ${id} actualizada mediante drag & drop (${mode})`);
    });

    // Ajustar automáticamente después de cargar datos
    setTimeout(autoFit, 300);

    return () => {
      gantt.clearAll();
    };
  }, [tasks, filtro, scale, viewMode]);

  // Actualizar escala cuando cambia (sin cambios aquí)
  useEffect(() => {
    if (gantt && gantt.getTaskByTime) {
      setGanttScale(scale);
    }
  }, [scale]);

  const setGanttScale = (scale) => {
    if (!gantt.config) return;

    gantt.config.scales = [];
    gantt.config.subscales = [];

    if (scale === "dia") {
      gantt.config.scales = [{ unit: "day", step: 1, format: "%d %M" }];
      gantt.config.min_column_width = viewMode === "compact" ? 60 : 80;
      gantt.config.subscales = [{ unit: "hour", step: 3, date: "%H:%i" }];
    } else if (scale === "semana") {
      gantt.config.scales = [{ unit: "week", step: 1, format: "Semana %W" }];
      gantt.config.min_column_width = viewMode === "compact" ? 80 : 120;
      gantt.config.subscales = [{ unit: "day", step: 1, format: "%d %M" }];
    } else if (scale === "mes") {
      gantt.config.scales = [{ unit: "month", step: 1, format: "%F %Y" }];
      gantt.config.min_column_width = viewMode === "compact" ? 100 : 140;
      gantt.config.subscales = [{ unit: "week", step: 1, format: "Semana %W" }];
    } else if (scale === "año") {
      gantt.config.scales = [{ unit: "year", step: 1, format: "%Y" }];
      gantt.config.min_column_width = viewMode === "compact" ? 120 : 180;
      gantt.config.subscales = [{ unit: "month", step: 1, format: "%M" }];
    }

    if (gantt.render) {
      gantt.render();
      setTimeout(autoFit, 300);
    }
  };

  // Manejar cambio en el filtro (sin cambios aquí)
  const handleFiltroChange = (nuevoFiltro) => {
    setFiltro(nuevoFiltro);
  };

  // Función para cambiar entre vistas (sin cambios aquí)
  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "full" ? "compact" : "full"));
  };

  // Funciones de exportación (sin cambios aquí)
  const exportarImagen = () => {
    gantt.exportToPNG();
  };
  const exportarPDF = () => {
    gantt.exportToPDF();
  };
  const exportarExcel = () => {
    gantt.exportToExcel();
  };

  return (
    <Layout>
      <div className="container-fluid px-lg-4">
        <div className="row g-4">
          <div className="col-12">
            <div className="card border-0 shadow-lg overflow-hidden">
              {/* Encabezado mejorado */}
              <div className="card-header bg-gradient-primary text-white py-3">
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between">
                  <div className="mb-2 mb-md-0">
                    <h2 className="h4 mb-1 fw-bold">Gestión de Cronograma</h2>
                    <p className="mb-0 opacity-75">Visualización interactiva de tareas y progreso</p>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-light btn-sm px-3" onClick={toggleViewMode}>
                      <i className={`bi ${viewMode === "full" ? "bi-arrows-angle-contract" : "bi-arrows-angle-expand"} me-2`}></i>
                      {viewMode === "full" ? "Compactar" : "Expandir"}
                    </button>
                   {/* <button className="btn btn-success btn-sm" onClick={openCreateModal}>
                      <i className="bi bi-plus me-2"></i> Nueva Tarea
                    </button>
                    <div className="dropdown">
                      <button className="btn btn-light btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                        <i className="bi bi-download me-2"></i> Exportar
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end shadow">
                        <li>
                          <button className="dropdown-item" onClick={exportarImagen}>
                            <i className="bi bi-file-image me-2"></i>Imagen
                          </button>
                        </li>
                        <li>
                          <button className="dropdown-item" onClick={exportarPDF}>
                            <i className="bi bi-file-pdf me-2"></i>PDF
                          </button>
                        </li>
                        <li>
                          <button className="dropdown-item" onClick={exportarExcel}>
                            <i className="bi bi-file-spreadsheet me-2"></i>Excel
                          </button>
                        </li>
                      </ul>
                    </div> */}
                  </div>
                </div>
              </div>

              {/* Controles mejorados */}
              <div className="card-body pt-4">
                <div className="row g-3 mb-4">
                  <div className="col-12 col-lg-8">
                    <div className="d-flex flex-wrap gap-2">
                      <div className="btn-group shadow-sm">
                        {["dia", "semana", "mes", "año"].map((scl) => (
                          <button
                            key={scl}
                            className={`btn btn-sm ${
                              scale === scl ? "btn-primary" : "btn-outline-primary"
                            } text-nowrap`}
                            onClick={() => setScale(scl)}
                          >
                            <i
                              className={`bi bi-calendar${
                                scl === "dia" ? "-day" : scl === "semana" ? "-week" : scl === "mes" ? "-month" : ""
                              } me-2`}
                            ></i>
                            {scl.charAt(0).toUpperCase() + scl.slice(1)}
                          </button>
                        ))}
                        <button className="btn btn-outline-primary btn-sm" onClick={autoFit} title="Ajuste automático">
                          <i className="bi bi-zoom-fit"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-lg-4">
                    <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                      {["todos", "pendiente", "en progreso", "completada"].map((flt) => (
                        <button
                          key={flt}
                          className={`btn btn-sm ${
                            filtro === flt
                              ? `btn-${getFilterColor(flt)}`
                              : `btn-outline-${getFilterColor(flt)}`
                          } shadow-sm text-nowrap`}
                          onClick={() => handleFiltroChange(flt)}
                        >
                          {flt === "todos" ? "Todas" : flt.charAt(0).toUpperCase() + flt.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contenido principal */}
                {loading ? (
                  <div className="d-flex justify-content-center align-items-center py-5">
                    <div className="spinner-grow text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="alert alert-info bg-opacity-10 border-0 text-center py-4">
                    <i className="bi bi-inbox fs-1 text-info"></i>
                    <h5 className="mt-2 mb-1">No hay tareas registradas</h5>
                    <p className="mb-0 text-muted">Comienza agregando nuevas tareas al sistema</p>
                  </div>
                ) : (
                  <div
                    ref={ganttContainer}
                    className="gantt-chart-container"
                    style={{
                      width: "100%",
                      height: viewMode === "compact" ? "60vh" : "75vh",
                      minHeight: viewMode === "compact" ? "300px" : "500px",
                    }}
                  />
                )}

                {/* Leyenda mejorada */}
                <div className="mt-4 pt-3 border-top">
                  <div className="d-flex flex-wrap gap-4 justify-content-center">
                    {["pendiente", "en progreso", "completada"].map((estado) => (
                      <div key={estado} className="d-flex align-items-center">
                        <span className={`badge bg-${getFilterColor(estado)} me-2`}></span>
                        <span className="text-muted small text-uppercase fw-bold tracking-wide">
                          {estado.charAt(0).toUpperCase() + estado.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Renderizar los modales condicionalmente */}
      {showModal && modalMode === "create" && (
        <CrearTarea
          
          task={selectedTask}
          clientes={clientes}
          filiales={filiales}
          usuarios={usuarios}
          onSave={handleTaskSave}
          onCancel={closeModal}
        />
      )}
      {showModal && modalMode === "edit" && (
        <EditarTarea
          task={selectedTask}
          clientes={clientes}
          filiales={filiales}
          usuarios={usuarios}
          onSave={handleTaskSave}
          onCancel={closeModal}
        />
      )}
      {showModal && modalMode === "view" && selectedTask && (
  <VerTarea
    task={selectedTask}
    clientes={clientes}
    filiales={filiales}
    usuarios={usuarios}
    onCancel={closeModal}
  />
)}
    </Layout>
  );
};

// Función auxiliar para colores de filtro (sin cambios aquí)
const getFilterColor = (filter) => {
  switch (filter) {
    case "pendiente":
      return "danger";
    case "en progreso":
      return "warning";
    case "completada":
      return "success";
    default:
      return "primary";
  }
};

export default Cronograma;