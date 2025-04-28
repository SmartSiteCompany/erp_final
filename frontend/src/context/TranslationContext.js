import React, { createContext, useState, useContext } from 'react';

// Translation dictionaries
const translations = {
  es: {
    crearNuevaTarea: "Crear Nueva Tarea",
    cargando: "Cargando...",
    filtrarPorFilial: "Filtrar por Filial",
    todasLasFiliales: "Todas las filiales",
    filtrarPorUsuario: "Filtrar por Usuario",
    todosLosUsuarios: "Todos los usuarios",
    filtrarPorEstado: "Filtrar por Estado",
    todosLosEstados: "Todos los estados",
    pendiente: "Pendiente",
    enProgreso: "En progreso",
    completada: "Completada",
    leyendaDeFiliales: "Leyenda de filiales",
    detallesDeTarea: "Detalles de Tarea",
    crearTarea: "Crear Tarea",
    editarTarea: "Editar Tarea",
    porFavorCompleteCampos: "Por favor complete todos los campos obligatorios",
    errorGuardarTarea: "Ocurrió un error al guardar la tarea. Por favor intente nuevamente.",
    errorEliminarTarea: "Ocurrió un error al eliminar la tarea. Por favor intente nuevamente.",
    estado: "Estado",
    filial: "Filial",
    sinAsignar: "Sin asignar"
  },
  en: {
    crearNuevaTarea: "Create New Task",
    cargando: "Loading...",
    filtrarPorFilial: "Filter by Branch",
    todasLasFiliales: "All branches",
    filtrarPorUsuario: "Filter by User",
    todosLosUsuarios: "All users",
    filtrarPorEstado: "Filter by Status",
    todosLosEstados: "All statuses",
    pendiente: "Pending",
    enProgreso: "In progress",
    completada: "Completed",
    leyendaDeFiliales: "Branch legend",
    detallesDeTarea: "Task Details",
    crearTarea: "Create Task",
    editarTarea: "Edit Task",
    porFavorCompleteCampos: "Please complete all required fields",
    errorGuardarTarea: "An error occurred while saving the task. Please try again.",
    errorEliminarTarea: "An error occurred while deleting the task. Please try again.",
    estado: "Status",
    filial: "Branch",
    sinAsignar: "Unassigned"
  }
};

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState('es');

  const t = (key) => {
    return translations[language][key] || key;
  };

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  return (
    <TranslationContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => useContext(TranslationContext);
