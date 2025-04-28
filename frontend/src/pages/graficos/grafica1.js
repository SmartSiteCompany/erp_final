import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Chart } from 'chart.js/auto';
import TareaService from '../../services/TareaService';

const Grafica1 = () => {
  const [stats, setStats] = useState({
    total: 0,
    completadas: 0,
    pendientes: 0,
    porcentaje: 0
  });
  const chartRefs = useRef({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tareas = await TareaService().obtenerTareas();
        const total = tareas.length;
        const completadas = tareas.filter(t => t.estado === 'completada').length;
        const pendientes = tareas.filter(t => t.estado === 'pendiente').length;
        
        setStats({
          total,
          completadas,
          pendientes,
          porcentaje: total > 0 ? Math.round((completadas / total) * 100) : 0
        });

        initMiniCharts();
      } catch (error) {
        console.error("Error cargando tareas:", error);
      }
    };

    fetchData();

    return () => {
      // Limpiar gráficos al desmontar
      Object.values(chartRefs.current).forEach(chart => chart && chart.destroy());
    };
  }, []);

  const initMiniCharts = () => {
    const charts = [
      { id: 'total-tareas-chart', color: '--bs-primary' },
      { id: 'pendientes-chart', color: '--bs-success' },
      { id: 'completadas-chart', color: '--bs-primary' },
      { id: 'crecimiento-chart', color: '--bs-warning' }
    ];

    charts.forEach(chart => {
      const ctx = document.getElementById(chart.id);
      if (!ctx) return;

      chartRefs.current[chart.id] = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
          datasets: [{
            data: [12, 15, 10, 18, 14, 8, 16],
            borderColor: `var(${chart.color})`,
            borderWidth: 2,
            tension: 0.4,
            fill: false,
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { display: false }, y: { display: false } }
        }
      });
    });
  };

  return (
    <Row>
      {/* Card 1: Total Tareas */}
      <Col md={6} xl={3}>
        <Card>
          <Card.Body>
            <div className="float-end mt-2">
              <div id="total-tareas-chart" style={{ height: '40px', width: '70px' }}></div>
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
      </Col>

      {/* Card 2: Tareas Pendientes */}
      <Col md={6} xl={3}>
        <Card>
          <Card.Body>
            <div className="float-end mt-2">
              <div id="pendientes-chart" style={{ height: '40px', width: '70px' }}></div>
            </div>
            <div>
              <h4 className="mb-1 mt-1">{stats.pendientes}</h4>
              <p className="text-muted mb-0">Pendientes</p>
            </div>
            <p className="text-muted mt-3 mb-0">
              <span className="text-danger me-1">
                <i className="mdi mdi-arrow-down-bold me-1"></i>
                {stats.total > 0 ? Math.round((stats.pendientes / stats.total) * 100) : 0}%
              </span> del total
            </p>
          </Card.Body>
        </Card>
      </Col>

      {/* Card 3: Tareas Completadas */}
      <Col md={6} xl={3}>
        <Card>
          <Card.Body>
            <div className="float-end mt-2">
              <div id="completadas-chart" style={{ height: '40px', width: '70px' }}></div>
            </div>
            <div>
              <h4 className="mb-1 mt-1">{stats.completadas}</h4>
              <p className="text-muted mb-0">Completadas</p>
            </div>
            <p className="text-muted mt-3 mb-0">
              <span className="text-success me-1">
                <i className="mdi mdi-arrow-up-bold me-1"></i>
                {stats.porcentaje}%
              </span> del total
            </p>
          </Card.Body>
        </Card>
      </Col>

      {/* Card 4: Crecimiento */}
      <Col md={6} xl={3}>
        <Card>
          <Card.Body>
            <div className="float-end mt-2">
              <div id="crecimiento-chart" style={{ height: '40px', width: '70px' }}></div>
            </div>
            <div>
              <h4 className="mb-1 mt-1">+ <span>{stats.porcentaje}</span>%</h4>
              <p className="text-muted mb-0">Eficiencia</p>
            </div>
            <p className="text-muted mt-3 mb-0">
              <span className="text-success me-1">
                <i className="mdi mdi-arrow-up-bold me-1"></i>
                5.2%
              </span> desde ayer
            </p>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Grafica1;