import React, {useState, useEffect} from "react";
import { Link } from "react-router-dom";
import EventoService from "../../services/EventoService";

const Card1 = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { obtenerEventos } = EventoService();
  
  const cardColors = [
    'linear-gradient(135deg, #270a78 0%, #764ba2 50%, #8861f2 100%)',
    'linear-gradient(135deg, #602dee 0%, #8861f2 50%, #2d57ee 100%)',
    'linear-gradient(135deg, #0a1b78 0%, #602dee 50%, #6177f2 100%)',
    'linear-gradient(135deg, #2d4aee 0%, #0a1b78 50%, #602dee 100%)',
    
  ];

  const getTodayAndTomorrow = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    
    return { today, tomorrow };
  };

  const { today, tomorrow } = getTodayAndTomorrow();

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true);
        const fetchedEventos = await obtenerEventos();
        setEventos(fetchedEventos);
        setError(null);
      } catch (err) {
        console.error("Error al obtener eventos:", err);
        setError("Error al cargar eventos");
      } finally {
        setLoading(false);
      }
    };
    fetchEventos();
  }, [obtenerEventos]);

  const featuredEvents = eventos.filter(evento => {
    if (!evento.fecha) return false;
    const eventDate = new Date(evento.fecha);
    
    if (evento.prioridad === "alta") {
      return true;
    }
    
    return eventDate >= today && eventDate <= tomorrow;
  });

  if (loading) {
    return (
      <div className="card bg-light shadow-sm h-100">
        <div className="card-body d-flex flex-column justify-content-center align-items-center text-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 mb-0 text-muted">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-light shadow-sm h-100">
        <div className="card-body d-flex flex-column justify-content-center align-items-center text-center p-4">
          <i className="mdi mdi-alert-circle-outline fs-3 text-danger mb-3"></i>
          <p className="h5 text-danger mb-3">{error}</p>
          <button 
            className="btn btn-outline-danger btn-sm"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (featuredEvents.length === 0) {
    return (
      <div className="card bg-light shadow-sm">
        <div className="card-body d-flex flex-column justify-content-center align-items-center text-center p-4">
          <i className="mdi mdi-calendar-blank fs-3 text-muted mb-3"></i>
          <h3 className="text-muted mb-2">No hay eventos próximos</h3>
          <p className="text-muted small">No hay eventos importantes hoy o mañana</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-100 position-relative">
      <div 
        id="eventosCarousel" 
        className="card carousel slide h-100" 
        data-bs-ride="carousel"
      >
        <div className="carousel-inner h-100 rounded-2 overflow-hidden">
          {featuredEvents.map((evento, index) => {
            const eventDate = new Date(evento.fecha);
            const isToday = eventDate.toDateString() === today.toDateString();
            const isTomorrow = eventDate.toDateString() === tomorrow.toDateString();
            const bgColor = cardColors[index % cardColors.length];
            
            return (
              <div 
                className={`carousel-item h-100 ${index === 0 ? 'active' : ''}`} 
                key={evento._id || index}
              >
                <div 
                  className="h-100 d-flex flex-column p-3"
                  style={{ 
                    background: bgColor,
                    color: 'white'
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-white text-dark rounded-pill px-2 py-1">
                      <i className="mdi mdi-calendar-check me-1"></i>
                      {evento.prioridad === "alta" ? "Prioridad Alta" : 
                       isToday ? "Hoy" : "Mañana"}
                    </span>
                    <small className="text-white-50">
                      {eventDate.toLocaleDateString('es-ES', { weekday: 'short' })}
                    </small>
                  </div>
                  
                  <div className="flex-grow-1 d-flex flex-column justify-content-center">
                    <h4 className="fw-bold text-center mb-2 text-truncate text-white">{evento.nombre}</h4>
                    
                    <div className="row justify-content-center gx-3 mb-1">
                      <div className="col-auto">
                        <div className="d-flex align-items-center">
                          <i className="mdi mdi-clock-outline me-2"></i>
                          <span>
                            {eventDate.toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="col-auto">
                        <div className="d-flex align-items-center">
                          <i className="mdi mdi-map-marker-outline me-2"></i>
                          <span>{evento.ubicacion}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center pt-1">
                    <Link 
                      to={`/evento/ver/${evento._id}`}
                      className="btn btn-outline-light text-white btn-sm rounded-pill px-3 mb-3"
                    >
                      Ver detalles
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {featuredEvents.length > 1 && (
          <>
            <div className="carousel-indicators" style={{
              position: 'absolute',
              bottom: '10px',
              left: 0,
              right: 0,
              margin: '0 auto',
              justifyContent: 'center'
            }}>
              {featuredEvents.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  data-bs-target="#eventosCarousel"
                  data-bs-slide-to={idx}
                  className={idx === 0 ? 'active' : ''}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    border: '1px solid white',
                    backgroundColor: 'solid',
                    opacity: idx === 0 ? 1 : 0.5,
                    margin: '0 3px'
                  }}
                />
              ))}
            </div>
            
            <button 
              className="carousel-control-prev" 
              type="button" 
              data-bs-target="#eventosCarousel" 
              data-bs-slide="prev"
            >
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            </button>
            <button 
              className="carousel-control-next" 
              type="button" 
              data-bs-target="#eventosCarousel" 
              data-bs-slide="next"
            >
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Card1;