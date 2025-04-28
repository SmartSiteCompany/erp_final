import { fireEvent, render, screen } from "@testing-library/react";
import { TodoItem } from "../../src/08-useReducer/TodoItem";


describe('Hacer la prueba de TodoItem', () => {
    
    const todo = {
        id: 1,
        description: 'Piedra de Alma',
        done: false,
    };
    
    const onDeleteTodoMock = jest.fn()
    const onToggleTodoMock = jest.fn()

    //Este bloque garantiza que, antes de cada prueba, se limpien los "mocks" creados por Jest.
    beforeEach( () => jest.clearAllMocks() );

    test('Debe de mostrar el componente completar', () => {
        
        render(<TodoItem todo={todo} onToggleTodo={onToggleTodoMock} onDeleteTodo={onDeleteTodoMock} /> );

        const liElement = screen.getByRole( 'listitem' );
        expect ( liElement.className).toBe('list-group-item d-flex justify-content-between');

        //para el span en el componente debe estar el artributo aria-label para que lo llame
        const spanElement = screen.getByLabelText('span');
        expect (spanElement.className).toBe('aling-self-center ');

        
    })

    test('Debe de mostrar el todo completado', () => {

        todo.done = true,
        
        render(<TodoItem todo={todo} onToggleTodo={onToggleTodoMock} onDeleteTodo={onDeleteTodoMock} /> );

        const spanElement = screen.getByLabelText('span');
        expect (spanElement.className).toContain('text-decoration-line-through');

    })

    test('el Span debe de llamar el ToggleTodo cuando se hace click', () => {

        render(<TodoItem todo={todo} onToggleTodo={onToggleTodoMock} onDeleteTodo={onDeleteTodoMock} /> );

        const spanElement = screen.getByLabelText('span');
        fireEvent.click( spanElement );
        expect( onToggleTodoMock ).toHaveBeenCalledWith( todo.id )
    })

    test('el Span debe de llamar el onDeleteTodoMock', () => {

        render(<TodoItem todo={todo} onToggleTodo={onToggleTodoMock} onDeleteTodo={onDeleteTodoMock} /> );

        const deleteButton = screen.getByRole('button');
        fireEvent.click( deleteButton );
        expect( onDeleteTodoMock ).toHaveBeenCalledWith( todo.id );

    })
})
