import { Usuarios } from "../data/Usuarios";


export const getUsuarioByArea = (area) => {

    const validpublisher = ['smart-site','DataX', 'StudioDesign', 'GeneralSystech' ]
    if ( !validpublisher.includes(area) ) {
        throw new Error(`${area} No es valido esa area`)
    }
    return Usuarios.filter( Usuarios => Usuarios.area === area )
}
