import { fireEvent, render, screen } from "@testing-library/react"
import { LoginPage } from "../../src/09-useContext/LoginPage"
import { UserContext } from "../../src/09-useContext/context/useContext"


describe('Haceer la prueba del componente <LoginPage/>', () => {
    
    
    test('Debe mostrar el componenete sin el usuario', () => {
        
        render(
            <UserContext.Provider value={{ user:null }}>
                <LoginPage/>
            </UserContext.Provider>
        )
        const newTag = screen.getByLabelText('pre');
        expect (newTag.innerHTML).toContain( 'null' );
        
    })
    
    test('Debe llamar el setUser cuando se hace click', () => {
        
        const setUserMock  = jest.fn()

        render(
        <UserContext.Provider value={{ user: '', setUser: setUserMock }}>
            <LoginPage/>
        </UserContext.Provider>
        )

        const button = screen.getByRole( 'button' );
        fireEvent.click( button );
        expect(setUserMock).toHaveBeenCalledWith({"email": "correo@gamilc.om", "id": 1, "name": "gibran"})

    })
})