import { useEffect, useReducer } from "react"
import { todoReducer } from "../ToDoList/todoReducer";


const init = () => {
    return JSON.parse( localStorage.getItem('todos')) || [];
}

export const useTodo = () => {

    const [todos, dispatch] = useReducer(todoReducer, [], init)

        useEffect(() => {
            localStorage.setItem('todos', JSON.stringify(todos))
            }, [todos])
        
            const HandleNewTodo = ( todo ) => {
                const action = {
                    type: '[TODO] add Todo',
                    payload: todo,
                }
                dispatch(action);
            }
        
            const HandleRemoveTodo = (id) => {
                dispatch ({
                    type: '[TODO] remove Todo',
                    payload: id,
                    })
            }
        
            const HandleToggleTodo = (id) => {
                dispatch ({
                    type: '[TODO] Toggle Todo',
                    payload: id,
                    })
            }
    return{
    todosCount: todos.length,
    pendientes: todos.filter(todo => !todo.done ).length,
    todos,
    HandleNewTodo,
    HandleRemoveTodo,
    HandleToggleTodo,
    }
}
