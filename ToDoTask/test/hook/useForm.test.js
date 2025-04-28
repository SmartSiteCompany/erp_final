import { act, renderHook } from "@testing-library/react"
import { useForm } from "../../src/hook"

describe('Pruebas para useForm', () => { 

    const initialForm = {
        name: 'Gibran',
        email: 'correo@gamilc.om'
    }

    test('debe de resgresar los valores por defecto', () => {

        const {result} = renderHook( () => useForm(initialForm) );
        expect ( result.current ).toEqual(   {
            name: initialForm.name,
            email: initialForm.email,
            formState: initialForm,
            onInputChange: expect.any( Function ),
            onResetForm: expect.any( Function )
        })
    })

    test('Debe de cambiar el nombres del formulario', () => {

        const newValue = 'Juan'
        const {result} = renderHook(() => useForm(initialForm))
        const {onInputChange} = result.current;

        act(() => {
            onInputChange({target: {name: 'name', 'value': newValue}});    
        })
        expect (result.current.name).toEqual( newValue );
        expect (result.current.formState.name).toEqual( newValue );

    })

    test('Debe de resetear el formulario', () => {

        const newValue = 'Juan'
        const {result} = renderHook(() => useForm(initialForm))
        const {onInputChange, onResetForm} = result.current;

        act(() => {
            onInputChange({target: {name: 'name', 'value': newValue}});
            onResetForm();
        })
        expect (result.current.name).toEqual( initialForm.name );
        expect (result.current.formState.name).toEqual( initialForm.name );

    })

})