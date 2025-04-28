import React, { useState, useEffect, useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import CotizacionService from "../../services/CotizacionService";

const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

const formatDateLabel = (key, timeRange) => {
  if (timeRange === 'yearly') return key;
  if (timeRange === 'monthly') {
    const [year, month] = key.split('-');
    return new Date(year, month - 1).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
  }
  if (timeRange === 'weekly') {
    const [year, week] = key.split('-W');
    return `Sem ${week} ${year}`;
  }
  return key;
};

const Grafica2 = () => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("weekly");
  const [groupBy, setGroupBy] = useState("fecha");
  
  const { obtenerCotizaciones } = CotizacionService();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await obtenerCotizaciones();
        setCotizaciones(data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [obtenerCotizaciones]);

  const chartData = useMemo(() => {
    if (!cotizaciones || cotizaciones.length === 0) return { series: [], categories: [] };

    const groupedData = {};
    
    cotizaciones.forEach(cotizacion => {
      let key;
      
      if (groupBy === 'fecha') {
        const date = new Date(cotizacion.fecha_cotizacion);
        if (timeRange === 'yearly') {
          key = date.getFullYear();
        } else if (timeRange === 'monthly') {
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        } else {
          const weekNumber = getWeekNumber(date);
          key = `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
        }
      } else if (groupBy === 'area') {
        key = cotizacion.filial_id?.nombre_filial || 'Sin filial';
      } else {
        key = cotizacion.forma_pago || 'Sin especificar';
      }

      groupedData[key] = (groupedData[key] || 0) + (cotizacion.precio_venta || 0);
    });

    let sortedKeys = Object.keys(groupedData);
    if (groupBy === 'fecha') {
      sortedKeys.sort();
    } else {
      sortedKeys.sort((a, b) => groupedData[b] - groupedData[a]);
    }

    const formattedCategories = groupBy === 'fecha' 
      ? sortedKeys.map(key => formatDateLabel(key, timeRange))
      : sortedKeys;

    return {
      series: [{
        name: 'Monto Total',
        data: sortedKeys.map(key => groupedData[key])
      }],
      categories: formattedCategories
    };
  }, [cotizaciones, groupBy, timeRange]);

  const options = useMemo(() => ({
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { 
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '70%',
        endingShape: 'rounded',
        borderRadius: 4,
        dataLabels: {
          position: 'top'
        }
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0.25,
        gradientToColors: ['#602dee'],
        inverseColors: false,
        opacityFrom: 0.85,
        opacityTo: 0.95,
        stops: [0, 100]
      }
    },
    colors: ['#8861f2'], // Color principal del degradado
    dataLabels: { 
      enabled: chartData.categories.length <= 20,
      formatter: function(val) {
        return new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          maximumFractionDigits: 0
        }).format(val);
      },
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: ["#333"]
      }
    },
    xaxis: {
      categories: chartData.categories,
      title: {
        text: groupBy === 'fecha' ? 
              (timeRange === 'yearly' ? 'Año' : 
               timeRange === 'monthly' ? 'Mes' : 'Semana') : 
              groupBy === 'area' ? 'Área/Filial' : 'Forma de Pago',
        style: {
          fontSize: '14px',
          fontWeight: 'bold'
        }
      },
      labels: {
        style: {
          fontSize: '12px'
        },
        rotate: groupBy === 'fecha' && timeRange === 'monthly' ? -45 : 0
      }
    },
    yaxis: {
      title: { 
        text: 'Monto Total (MXN)',
        style: {
          fontSize: '14px',
          fontWeight: 'bold'
        }
      },
      labels: {
        formatter: function (value) {
          return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            maximumFractionDigits: 0
          }).format(value);
        }
      }
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
          }).format(val);
        }
      }
    },
    responsive: [{
      breakpoint: 768,
      options: {
        plotOptions: {
          bar: {
            columnWidth: '50%'
          }
        },
        dataLabels: {
          enabled: false
        }
      }
    }]
  }), [chartData.categories, groupBy, timeRange]);

  const totalCotizaciones = cotizaciones.length;
  const totalMonto = cotizaciones.reduce((sum, c) => sum + (c.precio_venta || 0), 0);
  const promedioMonto = totalCotizaciones > 0 ? totalMonto / totalCotizaciones : 0;

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="alert alert-danger" role="alert">
      Error al cargar los datos: {error.message}
    </div>
  );

  return (
    <div className="card shadow">
      <div className="card-body">
        <div className="row mb-1">
          <div className="col-md-6 align-items-center">
            <h4 className="card-title mb-1 fw-semibold text-gradient">
              Análisis de Cotizaciones</h4>
            <p className="text-muted mb-0">
              Resumen visual de las cotizaciones
            </p>
          </div>
          
          <div className="col-md-6">
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Fecha</label>
                  <select 
                    className="form-select"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                  >
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Agrupar por</label>
                  <select 
                    className="form-select"
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value)}
                  >
                    <option value="fecha">Fecha</option>
                    <option value="area">Filial</option>
                    <option value="forma_pago">Forma de Pago</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-1">
          {[
            { value: totalCotizaciones, label: 'Total Cotizaciones', isPrimary: true },
            { value: totalMonto, label: 'Monto Total', format: 'currency' },
            { value: promedioMonto, label: 'Promedio por Cotización', format: 'currency' }
          ].map((stat, index) => (
            <div className="col-md-4" key={index}>
              <div className={`card ${stat.isPrimary ? 'border-purple' : 'border-light'} shadow-sm`}>
                <div className="card-body text-center">
                  <h5 className={stat.isPrimary ? 'text-purple' : ''}>
                    {stat.format === 'currency' ? 
                      new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: 'MXN',
                        maximumFractionDigits: 0
                      }).format(stat.value) : 
                      stat.value.toLocaleString()}
                  </h5>
                  <p className="text-muted mb-0 font-size-10">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2">
          <div id="cotizaciones-analytics-chart">
            <ReactApexChart 
              options={options} 
              series={chartData.series} 
              type="bar" 
              height={320} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Grafica2;