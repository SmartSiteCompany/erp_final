import { types } from '../types/types';

export const initialTaskState = {
  pending: [],
  progress: [],
  Unfinished: [],
};

export const taskReducer = (state = initialTaskState, action) => {
  switch (action.type) {
    case types.ADD: {
      const { status } = action.payload;
      return {
        ...state,
        [status]: [...state[status], action.payload],
      };
    }

    case types.UPDATE_STATUS: {
      const { id, newStatus } = action.payload;

      // Buscar y quitar la tarea de su estado actual  
      let foundTask = null;
      const newState = {};

      for (const statusKey in state) {
        const filtered = state[statusKey].filter(task => {
          if (task.id === id) {
            foundTask = task;
            return false; // Quita la tarea del arreglo actual
          }
          return true;
        });
        newState[statusKey] = filtered;
      }

      // Si no se encontró la tarea, devolver el estado sin cambios
      if (!foundTask) return state;

      // Agregarla al nuevo estado con el nuevo status
      foundTask.status = newStatus;
      return {
        ...newState,
        [newStatus]: [...newState[newStatus], foundTask],
      };
    }

    default:
      return state;
  }
};
