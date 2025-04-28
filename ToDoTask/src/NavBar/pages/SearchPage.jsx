import { useLocation, useNavigate } from "react-router-dom"; // Asegurar import correcto
import { useForm } from "../../hook/useForm";
import { UsuarioCard } from "../components";
import { getUsuarioByName } from "../helpers"; // Buscar por área en lugar de ID
import queryString from "query-string";


export const SearchPage = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { q = '' } = queryString.parse( location.search );
  const usuario = getUsuarioByName(q);

  const showsearch = ( q.length === 0);
  const showError = ( q.length > 0) && usuario.length === 0;

  const {searchText, onInputChange}=useForm({
    searchText: q
  })


  const onSearchSubmit = (event) =>{
    event.preventDefault();
      // if (searchText.trim().length <= 1) return; {

      navigate(`?q=${searchText}`)
  }

  return (
    <>
        <h1 className="mt-5">SearchPage</h1>
          <hr/>


      <div className="row">
        <div className="col-5">
          <h4> Buscar... </h4>
            <hr/>
          <form onSubmit={ onSearchSubmit }>
            <input
              type="text"
              placeholder="Buscar heroe"
              className="form-control"
              name="searchText"
              autoComplete="off"
              value={ searchText }
              onChange={ onInputChange }
            />

            <button className="btn btn-warning mt-1">
              Buscar
            </button>
          </form>
        </div>

        <div className="col-7">
          <h4 className="col-7">Resultados</h4>
            <hr/>

        {/* {
          ( q === '' ) ? (<div className="alert alert-success"> Buscar heroe</div>) : (heroes.length === 0 ) && (<div className="alert alert-warning"> No hay un hero con ese nombre <b>{q}</b></div>)
        } */}

          <div className="alert alert-success" style={{display: showsearch ? '' : 'none' } } > 
          Buscar Persona</div>

          <div className="alert alert-warning" style={{display: showError ? '' : 'none' } } > 
          No hay ninguna perona con ese nombre <b>{q}</b></div>

        {/* <div className="alert alert-success"> Buscar heroe</div>
        <div className="alert alert-warning"> No hay un hero con ese nombre <b>{q}</b></div> */}
        
        {
          usuario.map( user => (
            <UsuarioCard key={user.id} {...user}/>
          ))
        }

        </div>

      </div>

    </>
  )
}
