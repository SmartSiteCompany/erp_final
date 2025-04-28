import { getByLabelText, render, screen } from "@testing-library/react"
import {HomePage} from '../../src/09-useContext/index'
import { UserContext } from "../../src/09-useContext/context/useContext"


describe('Hacer las pruebas de <HomePage/>', () => {
    
    test('Debe hacer las pruebas sin el usuario', () => {
        
        render(
            <UserContext.Provider value={{user : null}}>
                <HomePage/>
            </UserContext.Provider>
        )
        const preTag = screen.getByLabelText('pre')
        expect (preTag.innerHTML).toBe( 'null' )
    })

    test('Debe hacer las pruebas CON el usuario', () => {
        
        render(
            <UserContext.Provider value={{ user }}>
                <HomePage/>
            </UserContext.Provider>
        )
        const preTag = screen.getByLabelText('pre')
        expect ( preTag.innerHTML ).toContain( user.name );
        //expect ( preTag.innerHTML ).toContain( user.id.toString() );
    })
})
