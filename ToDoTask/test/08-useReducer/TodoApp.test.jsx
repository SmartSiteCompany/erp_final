import { render, screen } from "@testing-library/react"
import { TodoApp } from '../../src/08-useReducer/TodoApp'
import { useTodo } from "../../src/hook/useTodo"

// Un mock permite simular el comportamiento de una función real durante las pruebas,
//  evitando depender de implementaciones externas (como llamadas reales a una API). Ahora,
//  vamos a desglosarlo:

jest.mock('../../src/hook/useTodo')

//El método mockReturnValue (de Jest) establece un valor de retorno simulado para la función/hook useFetch
useTodo.mockReturnValue({
    todos: [
        { id: 1, description: 'Todo #1', done: false, },
        { id: 2, description: 'Todo #2', done: true, },
    ],
    todosCount: 2,
    pendientes: 1,
    HandleNewTodo: jest.fn(),
    HandleRemoveTodo: jest.fn(),
    HandleToggleTodo: jest.fn(),
})
// Estos son mocks de funciones (jest.fn() crea funciones simuladas).

// Simulan los métodos necesarios para agregar, eliminar y alternar el estado de las tareas:



describe('Hacer la prueba del componente <todoApp/>', () => {

    test('debe de mostarar el componente correctamente', () => {

         // Para hacer pruebas de un componente solo se importa el render
        render( <TodoApp/> );
        expect(screen.getByText('Todo #1') ).toBeTruthy();
        expect(screen.getByText('Todo #2') ).toBeTruthy();
        expect(screen.getByRole('textbox') ).toBeTruthy();
         // El getByText es si esta el texto en nuestro componente y toBeTruthy sea verdadero
    })
})
