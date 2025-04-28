import { useEffect, useState } from "react";


const LocalCache = {};

export const useFetch = (url) => {
    const [state, setState] = useState({
        data: null,
        isLoading: true,
        hasError: null,
        error: null
    });

    useEffect(() => {
        getFetch();
    }, [url]);

    const setLoadingState = () => {
        setState({
            data: null, // Inicialmente no hay datos
            isLoading: true,
            hasError: false,
            error: null,
        });
    };

    const getFetch = async () => {

        if (LocalCache[url]) {
            console.log('usando cache');
            setState({
                data: LocalCache[url],
                isLoading: false,
                hasError: false,
                error: null
            })
            return;
        }


        setLoadingState(); // Llama a la función corregida

        try {
            const resp = await fetch(url);
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (!resp.ok) {
                setState({
                    data: null,
                    isLoading: false,
                    hasError: true,
                    error: {
                        code: resp.status,
                        message: resp.statusText,
                    }
                });
                return;
            }

            const data = await resp.json();
            setState({
                data: data,
                isLoading: false,
                hasError: false,
                error: null,
            });

            LocalCache[url] = data;

        } catch (error) {
            setState({
                data: null,
                isLoading: false,
                hasError: true,
                error: { message: error.message },
            });
        }
    };

    return {
        data: state.data,
        isLoading: state.isLoading,
        hasError: state.hasError,
        error: state.error,
    };
};
