import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import CampanaService from "../../services/CampanaService";
import LoadingError from "../../components/LoadingError";

const Card2 = () => {
  const [campanas, setCampanas] = useState([]);
  const [allCampanas, setAllCampanas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orden, setOrden] = useState("recientes");
  const { obtenerCampanas } = CampanaService();
  const navigate = useNavigate();

  // Función para obtener las campañas de esta semana
  const getCampanasEstaSemana = (campanas) => {
    const hoy = new Date();
    const inicioSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay()));
    const finSemana = new Date(hoy.setDate(hoy.getDate() + 6));
    
    return campanas.filter(campana => {
      const fechaCampana = new Date(campana.fecha_inicio);
      return fechaCampana >= inicioSemana && fechaCampana <= finSemana;
    });
  };

  useEffect(() => {
    const fetchCampanas = async () => {
      try {
        const fetchedCampanas = await obtenerCampanas();
        setAllCampanas(fetchedCampanas);
        
        // Mostrar las de esta semana por defecto
        const campanasSemana = getCampanasEstaSemana(fetchedCampanas);
        ordenarCampanas(campanasSemana.length > 0 ? campanasSemana : fetchedCampanas, orden);
        
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
        console.error("Error al obtener campañas:", err);
      }
    };
    fetchCampanas();
  }, [obtenerCampanas]);

  const ordenarCampanas = (campanas, orden) => {
    const campanasOrdenadas = [...campanas];
    if (orden === "recientes") {
      campanasOrdenadas.sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio));
    } else {
      campanasOrdenadas.sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));
    }
    setCampanas(campanasOrdenadas.slice(0, 8)); // Mostrar hasta 8
  };

  const handleOrdenChange = (e) => {
    const nuevoOrden = e.target.value;
    setOrden(nuevoOrden);
    
    if (nuevoOrden === "todas") {
      navigate("/Campanas");
    } else {
      const campanasAFiltrar = nuevoOrden === "semana" ? 
        getCampanasEstaSemana(allCampanas) : 
        allCampanas;
      ordenarCampanas(campanasAFiltrar, nuevoOrden);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case "activa": return "uil-play-circle text-warning font-size-15 ";
      case "completada": return "uil-check-circle text-success font-size-15";
      case "pendiente": return "uil-clock text-secondary font-size-15";
      default: return "uil-question-circle text-info font-size-15";
    }
  };

  if (loading) return <div className="text-center py-4"><i className="uil uil-spinner uil-spin fs-3"></i></div>;
  if (error) return <div className="alert alert-danger">Error al cargar campañas</div>;
  if (campanas.length === 0) return <div className="alert alert-info">No hay campañas disponibles</div>;

  return (
    <div className="h-100">
      <div className="card h-100">
        <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className=" text-purple mb-4">Campañas Recientes</h5>
            <select 
              className="form-select form-select-sm" 
              style={{width: '100px'}}
              value={orden}
              onChange={handleOrdenChange}
            >
              <option value="semana">Esta semana</option>
              <option value="recientes">Recientes</option>
              <option value="antiguas">Más antiguas</option>
            </select>
          </div>


          <div style={{
            maxHeight: '240px',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            scrollbarColor: '#ddd #f5f5f5'
          }} className="pe-2 flex-grow-1">
            <ol className="activity-feed mb-0 ps-2">
              {campanas.map((campana) => (
                <li className="feed-item" key={campana._id}>
                  <div className="feed-item-list">
                    <p className="text-muted mb-1 font-size-13">
                      {formatDate(campana.fecha_inicio)}
                      <small className="d-inline-block ms-1">
                        <i className={`uil ${getEstadoIcon(campana.estado)} me-1`}></i>
                        {campana.estado}
                      </small>
                    </p>
                    <p className="mb-0">
                      <strong>{campana.nombre}</strong> 
                    </p>
                    <span className="text-muted"> {campana.descripcion?.substring(0, 50)}...</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="text-center mt-3">
            <Link to="/Campanas" className="btn btn-sm btn-outline-purple w-100">
              Ver todas las campañas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card2;