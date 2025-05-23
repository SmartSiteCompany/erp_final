import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { Chart } from 'chart.js/auto';
import TareaService from '../../services/TareaService';

const Grafica1 = () => {
  const [stats, setStats] = useState({
    total: 0,
    completadas: 0,
    pendientes: 0,
    enProgreso: 0,
    porcentaje: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRefs = useRef({});
  const { obtenerTareas } = TareaService();
  const [tareas, setTareas] = useState([]);

  // Función para calcular estadísticas
  const calcularEstadisticas = (tareas) => {
    const total = tareas.length;
    const completadas = tareas.filter(t => t.estado === 'completada').length;
    const pendientes = tareas.filter(t => t.estado === 'pendiente').length;
    const enProgreso = tareas.filter(t => t.estado === 'en progreso').length;
    
    return {
      total,
      completadas,
      pendientes,
      enProgreso,
      porcentaje: total > 0 ? Math.round((completadas / total) * 100) : 0
    };
  };

  // Función para crear gráficas pequeñas
  const crearMiniGraficas = () => {
    const charts = [
      { 
        id: 'total-tareas-chart', 
        color: '#5F2DEE', // --bs-primary
        value: stats.total,
        label: 'Total'
      },
      { 
        id: 'completadas-chart', 
        color: '#0acf97', // --bs-success
        value: stats.completadas,
        label: 'Completadas'
      },
      { 
        id: 'pendientes-chart', 
        color: '#f9bc0b', // --bs-primary
        value: stats.pendientes,
        label: 'Pendientes'
      },
      { 
        id: 'progreso-chart', 
        color: '#727cf5', // --bs-warning
        value: stats.enProgreso,
        label: 'En Progreso'
      }
    ];

    charts.forEach(chart => {
      // Destruir gráfica existente si hay una
      if (chartRefs.current[chart.id]) {
        chartRefs.current[chart.id].destroy();
      }

      const ctx = document.getElementById(chart.id);
      if (!ctx) return;

      // Datos semanales simulados
      const weeklyData = Array(7).fill(0).map((_, i) => {
        const base = chart.value || 1;
        return Math.max(1, Math.round(base * (0.5 + Math.random() * 0.5 * (i + 1))));
      });

      chartRefs.current[chart.id] = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['', '', '', '', '', '', ''],
          datasets: [{
            data: weeklyData,
            borderColor: chart.color,
            borderWidth: 2,
            tension: 0.4,
            fill: false,
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { display: false },
            tooltip: { enabled: false }
          },
          scales: { 
            x: { display: false },
            y: { display: false }
          },
          elements: {
            line: {
              borderWidth: 2
            }
          }
        }
      });
    });
  };

  // Efecto principal para cargar tareas
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await obtenerTareas();
        setTareas(data);
        
        const nuevasStats = calcularEstadisticas(data);
        setStats(nuevasStats);
        
        // Pequeño retraso para asegurar que el DOM esté listo
        setTimeout(() => {
          crearMiniGraficas();
        }, 100);
      } catch (err) {
        console.error("Error cargando tareas:", err);
        setError(err.message || "Error al cargar tareas");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Limpieza al desmontar
    return () => {
      Object.values(chartRefs.current).forEach(chart => chart && chart.destroy());
    };
  }, [obtenerTareas]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        Error al cargar las tareas: {error}
      </Alert>
    );
  }

  return (
    <Row>
      {/* Card 1: Total Tareas */}
      <div className="col-md-6 col-xl-3">
        <Card>
          <Card.Body>
            <div className="float-end mt-2">
              <div style={{ height: '60px', width: '80px' }}>
                <canvas id="total-tareas-chart"></canvas>
              </div>
            </div>
            <div>
              <h4 className="mb-1 mt-1">{stats.total}</h4>
              <p className="text-muted mb-0">Total Tareas</p>
            </div>
            <p className="text-muted mt-3 mb-0">
              <span className="text-success me-1">
                <i className="mdi mdi-arrow-up-bold me-1"></i>
                {stats.porcentaje}%
              </span> completadas
            </p>
          </Card.Body>
        </Card>
      </div>

      {/* Card 2: Tareas Completadas */}
      <div className="col-md-6 col-xl-3">
        <Card>
          <Card.Body>
            <div className="float-end mt-2">
              <div style={{ height: '60px', width: '80px' }}>
                <canvas id="completadas-chart"></canvas>
              </div>
            </div>
            <div>
              <h4 className="mb-1 mt-1">{stats.completadas}</h4>
              <p className="text-muted mb-0">Completadas</p>
            </div>
            <p className="text-muted mt-3 mb-0">
              <span className="text-success me-1">
                <i className="mdi mdi-check-circle me-1"></i>
                {stats.porcentaje}%
              </span> del total
            </p>
          </Card.Body>
        </Card>
      </div>

      {/* Card 3: Tareas Pendientes */}
      <div className="col-md-6 col-xl-3">
        <Card>
          <Card.Body>
            <div className="float-end mt-2">
              <div style={{ height: '60px', width: '80px' }}>
                <canvas id="pendientes-chart"></canvas>
              </div>
            </div>
            <div>
              <h4 className="mb-1 mt-1">{stats.pendientes}</h4>
              <p className="text-muted mb-0">Pendientes</p>
            </div>
            <p className="text-muted mt-3 mb-0">
              <span className="text-warning me-1">
                <i className="mdi mdi-alert-circle me-1"></i>
                {stats.total > 0 ? Math.round((stats.pendientes / stats.total) * 100) : 0}%
              </span> del total
            </p>
          </Card.Body>
        </Card>
      </div>

      {/* Card 4: En Progreso */}
      <div className="col-md-6 col-xl-3">
        <Card>
          <Card.Body>
            <div className="float-end mt-2">
              <div style={{ height: '60px', width: '80px' }}>
                <canvas id="progreso-chart"></canvas>
              </div>
            </div>
            <div>
              <h4 className="mb-1 mt-1">{stats.enProgreso}</h4>
              <p className="text-muted mb-0">En Progreso</p>
            </div>
            <p className="text-muted mt-3 mb-0">
              <span className="text-info me-1">
                <i className="mdi mdi-progress-clock me-1"></i>
                {stats.total > 0 ? Math.round((stats.enProgreso / stats.total) * 100) : 0}%
              </span> del total
            </p>
          </Card.Body>
        </Card>
      </div>
    </Row>
  );
};

export default Grafica1;