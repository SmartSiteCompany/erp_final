import { Usuarios } from "../data/Usuarios";


export const getUsuarioByName = ( name = '' ) =>{

    name = name.toLocaleLowerCase().trim();

    if (name.length === 0 ) return []; 

        return Usuarios.filter(
            user => user.username.toLocaleLowerCase().includes( name )
        );
        
}
