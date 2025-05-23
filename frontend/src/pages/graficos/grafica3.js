import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import InteraccionService from "../../services/InteraccionService";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Grafica3 = () => {
  const [chartData, setChartData] = useState({
    series: [],
    categories: []
  });
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
    completionRate: 0,
    avgDuration: "0m"
  });
  const [filter, setFilter] = useState("tipo_interaccion");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [loading, setLoading] = useState(true);
  const { obtenerInteracciones } = InteraccionService();

  // Paleta de colores profesional mejorada
  const colorPalette = {
    tipo: ['#2d44ee', '#6177f2','#602dee', '#8861f2', '#2d5aee'],
    estado: ['#34c38f', '#f46a6a', '#f1b44c', '#50a5f1'],
    highlight: '#FF7E5F'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const interacciones = await obtenerInteracciones();
        processData(interacciones);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter, dateRange]);



  const processData = (interacciones) => {
    // Filtrar por rango de fechas
    let filteredData = interacciones.filter(interaccion => {
      if (!startDate && !endDate) return true;
      
      const interaccionDate = new Date(interaccion.fecha);
      return (
        (!startDate || interaccionDate >= startDate) &&
        (!endDate || interaccionDate <= endDate)
      );
    });

    // Procesar datos según el filtro seleccionado
    let data = {};
    let categories = [];
    
    if (filter === "tipo_interaccion") {
      data = filteredData.reduce((acc, item) => {
        const tipo = item.tipo_interaccion?.charAt(0).toUpperCase() + item.tipo_interaccion?.slice(1) || 'Sin tipo';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {});
      categories = Object.keys(data);
    } else {
      data = filteredData.reduce((acc, item) => {
        const estado = item.estado?.charAt(0).toUpperCase() + item.estado?.slice(1) || 'Sin estado';
        acc[estado] = (acc[estado] || 0) + 1;
        return acc;
      }, {});
      categories = Object.keys(data);
    }

    // Calcular estadísticas avanzadas
    const total = filteredData.length;
    const completed = filteredData.filter(i => i.estado === "completada").length;
    const pending = filteredData.filter(i => i.estado === "pendiente").length;
    const cancelled = filteredData.filter(i => i.estado === "cancelada").length;
    const completionRate = total > 0 ? (completed / total * 100).toFixed(1) : 0;

    setChartData({
      series: Object.values(data),
      categories: categories
    });

    setStats({
      total,
      completed,
      pending,
      cancelled,
      completionRate,
    });
  };

  const chartOptions = {
    chart: {
      type: 'donut',
      height: 380,
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
      dropShadow: {
        enabled: true,
        top: 0,
        left: 0,
        blur: 3,
        opacity: 0.2
      },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          console.log('Segmento seleccionado:', chartData.categories[config.dataPointIndex]);
        }
      }
    },
    colors: filter === "tipo_interaccion" ? colorPalette.tipo : colorPalette.estado,
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          background: 'transparent',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '16px',
              fontWeight: 600,
              color: '#6c757d'
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 700,
              color: '#343a40',
              formatter: (val) => val
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Total',
              fontSize: '18px',
              fontWeight: 600,
              color: '#6c757d',
              formatter: () => stats.total
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      width: 0
    },
    legend: {
      position: 'right',
      horizontalAlign: 'center',
      fontSize: '14px',
      markers: {
        width: 12,
        height: 12,
        strokeWidth: 0,
        radius: 12,
        offsetX: -5
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      },
      onItemClick: {
        toggleDataSeries: true
      },
      onItemHover: {
        highlightDataSeries: true
      }
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (value) => `${value} interacciones (${((value / stats.total) * 100).toFixed(1)}%)`,
        title: {
          formatter: (seriesName) => seriesName
        }
      },
      style: {
        fontSize: '14px'
      }
    },
    responsive: [{
      breakpoint: 992,
      options: {
        chart: {
          height: 320
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  return (
    <div className="col-xl-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card shadow border-0"
      >
        <div className="card-body p-3">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
            <div>
              <h4 className="card-title mb-1 fw-semibold text-gradient">
                Dashboard de Interacciones
              </h4>
              <p className="text-muted mb-0">
                Resumen visual de las interacciones con clientes
              </p>
            </div>
            
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <div className="filter-select">
                <select 
                  className="form-select form-select-sm bg-light border-0 shadow-sm"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="tipo_interaccion">Por Tipo</option>
                  <option value="estado">Por Estado</option>
                </select>
              </div>
              
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2">Cargando datos de interacciones...</p>
            </div>
          ) : (
            <>
              <div className="row align-items-center">
                <div className="col-lg-5 p-1">
                  <div className="stats-card p-2 bg-light rounded-3 mb-1 mb-lg-0">
                    <div className="d-flex align-items-center mb-3">
                      <div className="icon-shape bg-primary-soft rounded-3 p-2 me-1">
                        <i className="uil uil-chart-pie-alt text-primary fs-2"/>
                      </div>
                      <div>
                        <h6 className="mb-0">Interaciones:</h6>
                        <h4 className="mb-0 text-primary"> {stats.total}</h4>
                      </div>
                    </div>
                    
                    <div className="border-top pt-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Completadas</span>
                        <span className="fw-semibold text-success me-1">
                          {stats.completed} {/*({stats.completionRate}%)*/}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Pendientes</span>
                        <span className="fw-semibold text-warning me-1">{stats.pending}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Canceladas</span>
                        <span className="fw-semibold text-danger me-1">{stats.cancelled}</span>
                      </div>
                      
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-7 ">
                  <div className="chart-container position-relative ">
                     <ReactApexChart 
                      options={{
                         ...chartOptions,
                          legend: {
                             show: false // Oculta la leyenda
                         },
                          chart: {
                             ...chartOptions.chart,
                              height: 200
                         },
                       }} 
                       series={chartData.series} 
                       type="donut" 
                       height={230}
                       />
                       {chartData.series.length === 0 && (
                        <div className="no-data-overlay">
                          <div className="text-center text-muted py-5">
                            <i className="uil uil-exclamation-circle fs-1"></i>
                             <p className="mt-2">No hay datos disponibles</p>
                             </div>
                             </div>
                          )}
                         </div>
                      </div>
                   </div>
              
              <div className="mt-2 pt-3 border-top">
                <div className="row">
                  {chartData.categories.map((category, index) => (
                    <div key={index} className="col-md-3 mb-3">
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="d-flex align-items-center bg-hover-light p-2 rounded"
                      >
                        <span 
                          className="badge-color me-2" 
                          style={{
                            backgroundColor: chartOptions.colors[index],
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%'
                          }}
                        ></span>
                        <div className="flex-grow-1">
                          <h6 className="mb-0">{category}</h6>
                          <span className="text-muted small">
                            {((chartData.series[index] / stats.total) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Grafica3;