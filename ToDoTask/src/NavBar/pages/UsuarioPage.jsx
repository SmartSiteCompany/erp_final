import { Navigate, replace, useNavigate, useParams } from "react-router-dom"
import { getUsuarioById } from "../helpers";
import { useMemo } from "react";



export const UsuarioPage = () => {

  const navigate = useNavigate()

  const {id} = useParams();
  // Por ejemplo, si tienes una ruta como /user/:id, puedes usar useParams 
  // para obtener el valor de id cuando el componente asociado a esa ruta se renderice:

  const user = useMemo( () => getUsuarioById( id ), [ id ] )
  //useMemo es para guardar valores,  cuando el [id] cambie vuleve a disparar "getHeroById" y lo manda al "hero"
  //CallbackMemo es pra guardar funciones

  const onNavigateBack=()=>{
    navigate(-1);
  }
  //El navigate -1 regresa a la pagian anterior pero tambien puede sacarte de la app
  
  if (!user) {
    return <Navigate to='/inicio'/>
    //esto si ponemos nombres que no esxisten en la url te redirige a la pagina comodin
  }


  return (
    <div className="row mt-5">
      <div className="col-4">
        <img
          src={`/assets/image/${ id }.jpg`} // Cambié 'image' por 'images'
          alt={user.username}
          className="img-thumbnail animate__animated animate__fadeInLeft bg-black"
        />
      </div>

      <div className="col-8 mt-5">
        <h3>{user.username}</h3>
        <ul className="list-group list-group-flush">
          <li className="list-group-item"><b>Email:</b> {user.email}</li>
          <li className="list-group-item"><b>Área:</b> {user.area}</li>
        </ul>

        <h5 className="mt-5">Descripción</h5>
        <p>########</p>

        <button className="btn btn-outline-primary" onClick={onNavigateBack}>
          Regresar
        </button>
      </div>
    </div>
  );
};
