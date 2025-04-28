import { render, screen } from "@testing-library/react"
import { LoginPage, MainApp } from "../../src/09-useContext/index"
import { MemoryRouter } from "react-router-dom";

describe('Pruebase en el componente <MainApp/>', () => {
    
    test('Debe de mostrar el LoginPage', () => {

        render(
            //El memoryRouter proporciona los routers que estan en el mainapp
            <MemoryRouter initialEntries={['/LoginPage']}>
                <MainApp/>
            </MemoryRouter>
            );
        expect(screen.getByText('LoginPage')).toBeTruthy();
        

    })

    
})