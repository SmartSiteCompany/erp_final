import { Link, NavLink } from "react-router-dom"
 
export const NavBar = () => {
  return (
    
    <nav className="navbar navbar-expand-lg bg-dark navbar-dark rounded-3 fixed-top">
  <div className="container-fluid ">
    <Link className="navbar-brand" to="#">Poryect Manager</Link>
    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>

    <div className="collapse navbar-collapse" id="navbarNav">
      <ul className="navbar-nav">
        
        <NavLink 
        className={({ isActive }) => `nav-link ${isActive ? "active" : "" } ` }
        to="/inicio"
        >
            Inicio
        </NavLink>

        <NavLink
        className={({ isActive }) => `nav-link ${isActive ? "active" : "" } ` }
        to="/tareas"
        >
            Todas las Tareas
        </NavLink>

        <NavLink
        className={({ isActive }) => `nav-link ${isActive ? "active" : "" } ` }
        to="/datax"
        >
            Tareas datax
        </NavLink>

        <NavLink
        className={({ isActive }) => `nav-link ${isActive ? "active" : "" } ` }
        to="/general"
        >
            Tareas GeneralSystech
        </NavLink>

        <NavLink
        className={({ isActive }) => `nav-link ${isActive ? "active" : "" } ` }
        to="/studiodesign"
        >
            Tareas StudioDesign
        </NavLink>

        <NavLink
        className={({ isActive }) => `nav-link ${isActive ? "active" : "" }`}
        to="/hacer"
        >
        Hacer Tarea
        </NavLink>

        <NavLink
        className={({ isActive }) => `nav-link ${isActive ? "active" : "" } ` }
        to="/calendario"
        >
            Calendario
        </NavLink>
        <NavLink 
        className={ ({isActivate}) => `nav-link nav-link ${ isActivate ? 'active' : '' }`} 
        to="/buscar"
        >
        Buscar
        </NavLink>

      </ul>
    </div>
  </div>
</nav>
  )
}