import { TodoList } from "./TodoList"
import { TodoAdd } from "./TodoAdd"
import { useTodo } from "../hook/useTodo"


export const TodoApp = () => {

    const { todos, todosCount, pendientes, HandleNewTodo, HandleRemoveTodo, HandleToggleTodo } = useTodo();


    return (
    <>
        <div className="mt-5">

        <h1>TodoApp: { todosCount }, <small>pendientes: {pendientes}</small> </h1>
        <hr/>
        <div className="row">
            <div className="col-7">

                <TodoList todos={ todos } onDeleteTodo={HandleRemoveTodo} onToggleTodo={HandleToggleTodo}/>

            </div>

            <div className="col-5">
                <h4> Agregar Todo</h4>
                <hr/>
                    <TodoAdd onNewTodo={HandleNewTodo}/>
                </div>
            </div>
        </div>
            
        </>
        )
    }