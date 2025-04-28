import { Usuarios } from "../data/Usuarios"


export const getUsuarioById = (id) => {
    return Usuarios.find(user => user.id === id);
};
