import { useState } from "react"


export const useCounter = ( initialValue = 10 ) => {

    const [counter, setCounter] = useState( initialValue )

    const incremnt = ( value = 1 ) => {
        setCounter( (current) => current + value);
    }

    const reset = () => {
        setCounter( initialValue)
    }

    const decrement = (value = 1) => {
        //if ( counter === 0 )return;
        setCounter( (current) => current - value)
    }


    return{
        counter,
        incremnt,
        reset,
        decrement,
        //si no retornamos el componente no hay manera que podamos usarlo en otros archivos 
    }
}

//hook es una funcion, identificar un hook comienza con "use"