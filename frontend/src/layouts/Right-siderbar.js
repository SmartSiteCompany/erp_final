import React, { useState, useEffect } from 'react';

// Constantes para evitar "magic strings"
const LAYOUT = {
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal'
};

const LAYOUT_MODE = {
  LIGHT: 'light',
  DARK: 'dark'
};

const LAYOUT_WIDTH = {
  FLUID: 'fluid',
  BOXED: 'boxed'
};

const TOPBAR_COLOR = {
  LIGHT: 'light',
  DARK: 'dark',
};

const SIDEBAR_SIZE = {
  DEFAULT: 'default',
  COMPACT: 'compact',
  SMALL: 'small'
};

const SIDEBAR_COLOR = {
  LIGHT: 'light',
  DARK: 'dark',
  COLORED: 'colored'
};

const DEFAULT_CONFIG = {
  layout: LAYOUT.VERTICAL,
  layoutMode: LAYOUT_MODE.LIGHT,
  layoutWidth: LAYOUT_WIDTH.FLUID,
  topbarColor: TOPBAR_COLOR.LIGHT,
  sidebarSize: SIDEBAR_SIZE.DEFAULT,
  sidebarColor: SIDEBAR_COLOR.LIGHT
};

function RightSidebar({ toggleRightSidebar, showRightSidebar }) {
  // Cargar configuración desde localStorage o usar valores por defecto
  const loadConfig = () => {
    const savedConfig = localStorage.getItem('layoutConfig');
    return savedConfig ? JSON.parse(savedConfig) : {...DEFAULT_CONFIG};
  };

  // Inicializa los estados para el diseño
  const [config, setConfig] = useState(loadConfig());

  // Guardar configuración en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('layoutConfig', JSON.stringify(config));
  }, [config]);

  // Función para actualizar la configuración
  const updateConfig = (newConfig) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  // Restablecer a los valores por defecto
  const resetToDefaults = () => {
    setConfig({...DEFAULT_CONFIG});
  };

  // Aplicar todos los cambios al DOM
  useEffect(() => {
    // Aplicar tema claro/oscuro
    document.body.setAttribute('data-bs-theme', config.layoutMode);
    
    // Aplicar layout horizontal/vertical
    if (config.layout === LAYOUT.HORIZONTAL) {
      document.body.classList.add('layout-horizontal');
      document.body.classList.remove('layout-vertical');
    } else {
      document.body.classList.add('layout-vertical');
      document.body.classList.remove('layout-horizontal');
    }
    
    // Aplicar ancho del layout
    document.body.setAttribute('data-layout-size', config.layoutWidth);
    
    // Aplicar color de la topbar
    document.body.setAttribute('data-topbar', config.topbarColor);
    
    // Aplicar tamaño de la sidebar
    let dataSize;
    switch (config.sidebarSize) {
      case SIDEBAR_SIZE.DEFAULT: dataSize = 'lg'; break;
      case SIDEBAR_SIZE.COMPACT: dataSize = 'small'; break;
      case SIDEBAR_SIZE.SMALL: dataSize = 'sm'; break;
      default: dataSize = 'lg';
    }
    document.body.setAttribute('data-sidebar-size', dataSize);
    
    // Aplicar color de la sidebar
    document.body.setAttribute('data-sidebar', config.sidebarColor);
  }, [config]);

  // Función para cambiar entre temas claro/oscuro
  const toggleTheme = () => {
    const newTheme = config.layoutMode === LAYOUT_MODE.LIGHT ? LAYOUT_MODE.DARK : LAYOUT_MODE.LIGHT;
    updateConfig({
      layoutMode: newTheme,
      topbarColor: newTheme === LAYOUT_MODE.DARK ? TOPBAR_COLOR.DARK : TOPBAR_COLOR.LIGHT,
      sidebarColor: newTheme === LAYOUT_MODE.DARK ? SIDEBAR_COLOR.DARK : SIDEBAR_COLOR.LIGHT
    });
  };

  // Estilos en línea dinámicos basados en el tema
  const getStyles = () => {
    const isDark = config.layoutMode === LAYOUT_MODE.DARK;
    const primaryColor = '#7269ef';
    const hoverColor = isDark ? '#5d55d1' : '#847de8';
    
    return {
      rightBar: {
        position: 'fixed',
        right: showRightSidebar ? '0' : '-300px',
        top: '0',
        bottom: '0',
        width: '300px',
        zIndex: '1002',
        backgroundColor: isDark ? '#2a3042' : '#fff',
        color: isDark ? '#e9ecef' : '#495057',
        boxShadow: isDark ? '-5px 0 15px rgba(0, 0, 0, 0.3)' : '-5px 0 15px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease-out'
      },
      overlay: {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        zIndex: '1001'
      },
      title: {
        backgroundColor: isDark ? '#1e2235' : '#f8f9fa',
        borderBottom: isDark ? '1px solid #2f3549' : '1px solid #e9ecef',
        color: isDark ? '#fff' : '#495057'
      },
      section: {
        marginBottom: '1.5rem',
        paddingBottom: '1.5rem',
        borderBottom: isDark ? '1px solid #2f3549' : '1px solid #f1f1f1'
      },
      colorOptions: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem'
      },
      sizeOptions: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      },
      themeSwitch: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem'
      },
      themeLabel: {
        fontWeight: '500',
        marginRight: '1rem',
        color: isDark ? '#e9ecef' : '#495057'
      },
      button: {
        backgroundColor: isDark ? '#3b4254' : '#f8f9fa',
        color: isDark ? '#e9ecef' : '#495057',
        border: 'none',
        borderRadius: '6px',
        padding: '8px 16px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontWeight: '500',
        boxShadow: isDark ? '0 2px 4px rgba(0, 0, 0, 0.1)' : '0 2px 4px rgba(0, 0, 0, 0.05)',
        flex: 1,
        textAlign: 'center',
        margin: '2px'
      },
      activeButton: {
        backgroundColor: primaryColor,
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '8px 16px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontWeight: '500',
        boxShadow: `0 2px 8px ${primaryColor}40`,
        flex: 1,
        textAlign: 'center',
        margin: '2px'
      },
      buttonHover: {
        backgroundColor: isDark ? '#4a5167' : '#e9ecef',
        transform: 'translateY(-1px)'
      },
      activeButtonHover: {
        backgroundColor: hoverColor,
        transform: 'translateY(-1px)'
      },
      buttonGroup: {
        display: 'flex',
        width: '100%',
        gap: '4px',
        marginBottom: '12px'
      },
      resetButton: {
        backgroundColor: isDark ? '#3b4254' : '#f8f9fa',
        color: isDark ? '#e9ecef' : '#495057',
        border: 'none',
        borderRadius: '6px',
        padding: '10px 16px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontWeight: '500',
        boxShadow: isDark ? '0 2px 4px rgba(0, 0, 0, 0.1)' : '0 2px 4px rgba(0, 0, 0, 0.05)',
        width: '100%',
        marginTop: '1rem'
      },
      resetButtonHover: {
        backgroundColor: isDark ? '#4a5167' : '#e9ecef',
        transform: 'translateY(-1px)'
      },
      hr: {
        borderColor: isDark ? '#2f3549' : '#e9ecef',
        padding: 1,
        margin: 5
      }
    };
  };

  const styles = getStyles();

  // Estado para manejar hover en botones
  const [hoverStates, setHoverStates] = useState({
    themeLight: false,
    themeDark: false,
    layoutVertical: false,
    layoutHorizontal: false,
    widthFluid: false,
    widthBoxed: false,
    reset: false
  });

  const handleHover = (button, isHovering) => {
    setHoverStates(prev => ({ ...prev, [button]: isHovering }));
  };

  return (
    <>
      <div style={styles.rightBar}>
        <div data-simplebar className="h-100">
          <div className="rightbar-title d-flex align-items-center p-2" style={styles.title}>
            <h5 className="m-0 me-2">Configuración de Diseño</h5>
            <button 
              className="right-bar-toggle ms-auto btn btn-link p-0" 
              onClick={toggleRightSidebar}
              aria-label="Cerrar panel de configuración"
              style={{color: styles.title.color}}
            >
              <i className="mdi mdi-close noti-icon"></i>
            </button>
          </div>

          <hr style={styles.hr} />

          <div className="p-4">
            {/* Selector de Tema */}
            <div style={styles.themeSwitch}>
              <span style={styles.themeLabel}>Tema:</span>
              <div style={styles.buttonGroup}>
                <button
                  type="button"
                  style={{
                    ...(config.layoutMode === LAYOUT_MODE.LIGHT ? styles.activeButton : styles.button),
                    ...(hoverStates.themeLight && (config.layoutMode === LAYOUT_MODE.LIGHT ? styles.activeButtonHover : styles.buttonHover))
                  }}
                  onClick={() => toggleTheme()}
                  onMouseEnter={() => handleHover('themeLight', true)}
                  onMouseLeave={() => handleHover('themeLight', false)}
                >
                  Claro
                </button>
                <button
                  type="button"
                  style={{
                    ...(config.layoutMode === LAYOUT_MODE.DARK ? styles.activeButton : styles.button),
                    ...(hoverStates.themeDark && (config.layoutMode === LAYOUT_MODE.DARK ? styles.activeButtonHover : styles.buttonHover))
                  }}
                  onClick={() => toggleTheme()}
                  onMouseEnter={() => handleHover('themeDark', true)}
                  onMouseLeave={() => handleHover('themeDark', false)}
                >
                  Oscuro
                </button>
              </div>
            </div>

            {/* Sección de Layout */}
            <div style={styles.section}>
            {/*}  <h6 className="mb-2" style={{color: styles.themeLabel.color}}>Diseño</h6>
              <div style={styles.buttonGroup}>
                <button
                  type="button"
                  style={{
                    ...(config.layout === LAYOUT.VERTICAL ? styles.activeButton : styles.button),
                    ...(hoverStates.layoutVertical && (config.layout === LAYOUT.VERTICAL ? styles.activeButtonHover : styles.buttonHover))
                  }}
                  onClick={() => updateConfig({ layout: LAYOUT.VERTICAL })}
                  onMouseEnter={() => handleHover('layoutVertical', true)}
                  onMouseLeave={() => handleHover('layoutVertical', false)}
                >
                  Vertical
                </button>
                <button
                  type="button"
                  style={{
                    ...(config.layout === LAYOUT.HORIZONTAL ? styles.activeButton : styles.button),
                    ...(hoverStates.layoutHorizontal && (config.layout === LAYOUT.HORIZONTAL ? styles.activeButtonHover : styles.buttonHover))
                  }}
                  onClick={() => updateConfig({ layout: LAYOUT.HORIZONTAL })}
                  onMouseEnter={() => handleHover('layoutHorizontal', true)}
                  onMouseLeave={() => handleHover('layoutHorizontal', false)}
                >
                  Horizontal
                </button>
              </div>*/}

              <h6 className="mb-2 mt-3" style={{color: styles.themeLabel.color}}>Ancho</h6>
              <div style={styles.buttonGroup}>
                <button
                  type="button"
                  style={{
                    ...(config.layoutWidth === LAYOUT_WIDTH.FLUID ? styles.activeButton : styles.button),
                    ...(hoverStates.widthFluid && (config.layoutWidth === LAYOUT_WIDTH.FLUID ? styles.activeButtonHover : styles.buttonHover))
                  }}
                  onClick={() => updateConfig({ layoutWidth: LAYOUT_WIDTH.FLUID })}
                  onMouseEnter={() => handleHover('widthFluid', true)}
                  onMouseLeave={() => handleHover('widthFluid', false)}
                >
                  Fluido
                </button>
                <button
                  type="button"
                  style={{
                    ...(config.layoutWidth === LAYOUT_WIDTH.BOXED ? styles.activeButton : styles.button),
                    ...(hoverStates.widthBoxed && (config.layoutWidth === LAYOUT_WIDTH.BOXED ? styles.activeButtonHover : styles.buttonHover))
                  }}
                  onClick={() => updateConfig({ layoutWidth: LAYOUT_WIDTH.BOXED })}
                  onMouseEnter={() => handleHover('widthBoxed', true)}
                  onMouseLeave={() => handleHover('widthBoxed', false)}
                >
                  Boxed
                </button>
              </div>
            </div>

            {/* Sección de Topbar */}
            <div style={styles.section}>
              <h6 className="mb-2" style={{color: styles.themeLabel.color}}>Barra Superior</h6>
              <div style={styles.colorOptions}>
                {Object.entries(TOPBAR_COLOR).map(([key, value]) => (
                  <div key={value} className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="topbar-color"
                      id={`topbar-color-${value}`}
                      value={value}
                      checked={config.topbarColor === value}
                      onChange={() => updateConfig({ topbarColor: value })}
                    />
                    <label 
                      className="form-check-label" 
                      htmlFor={`topbar-color-${value}`}
                      style={{color: styles.themeLabel.color}}
                    >
                      {key.charAt(0) + key.slice(1).toLowerCase()}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Sección de Sidebar */}
            <div style={styles.section}>
              <h6 className="mb-2" style={{color: styles.themeLabel.color}}>Barra Lateral</h6>
              <div style={styles.sizeOptions}>
                {Object.entries(SIDEBAR_SIZE).map(([key, value]) => (
                  <div key={value} className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="sidebar-size"
                      id={`sidebar-size-${value}`}
                      value={value}
                      checked={config.sidebarSize === value}
                      onChange={() => updateConfig({ sidebarSize: value })}
                    />
                    <label 
                      className="form-check-label" 
                      htmlFor={`sidebar-size-${value}`}
                      style={{color: styles.themeLabel.color}}
                    >
                      {key === 'DEFAULT' ? 'Por defecto' : 
                       key === 'COMPACT' ? 'Compacto' : 
                       'Pequeño (Solo iconos)'}
                    </label>
                  </div>
                ))}
              </div>

              <h6 className="mb-2 mt-3" style={{color: styles.themeLabel.color}}>Color</h6>
              <div style={styles.colorOptions}>
                {Object.entries(SIDEBAR_COLOR).map(([key, value]) => (
                  <div key={value} className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="sidebar-color"
                      id={`sidebar-color-${value}`}
                      value={value}
                      checked={config.sidebarColor === value}
                      onChange={() => updateConfig({ sidebarColor: value })}
                    />
                    <label 
                      className="form-check-label" 
                      htmlFor={`sidebar-color-${value}`}
                      style={{color: styles.themeLabel.color}}
                    >
                      {key.charAt(0) + key.slice(1).toLowerCase()}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón de reset */}
            <button
              type="button"
              style={{
                ...styles.resetButton,
                ...(hoverStates.reset && styles.resetButtonHover)
              }}
              onClick={resetToDefaults}
              onMouseEnter={() => handleHover('reset', true)}
              onMouseLeave={() => handleHover('reset', false)}
            >
              Restablecer valores por defecto
            </button>
          </div>
        </div>
     </div>
      {/* Overlay para cerrar el sidebar */}
      {showRightSidebar && (
        <div 
          style={styles.overlay}
          onClick={toggleRightSidebar}
          role="button"
          aria-label="Cerrar panel de configuración"
        ></div>
      )}
    </>
  );
}

export default RightSidebar;