const initialState = [{
    id: 1,
    todo: 'vamos a recolectar las piedras',
    done: false,
}]

const todoReducer = ( state = initialState, action = {}) => {

    if (action.type === '[Todo] add todo') {
        return [...state, action.playload]
    }

    return state;
}

let todos = todoReducer();

const newTodo = [{
    id: 2,
    todo: 'vamos a recolectar la piedra del alma ',
    done: false,
}]

const addToodoAction = [{
    type: '[Todo] add todo',
    playload: newTodo,
}]


console.log({state: todos});