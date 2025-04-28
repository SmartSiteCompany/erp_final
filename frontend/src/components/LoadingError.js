import React from 'react';
import Layout from '../layouts/pages/layout';

const LoadingError = ({ 
  loading, 
  error, 
  loadingMessage, 
  errorMessage, 
  children,
  onRetry
}) => {
  if (loading) {
    return (
      <Layout>
      <div className="loading-error-wrapper">
        <div className="row justify-content-center">
          <div className="loading-error-container loading-state">
            <div className="loading-spinner">
              <div className="spinner-circle"></div>
              <div className="spinner-circle"></div>
              <div className="spinner-circle"></div>
            </div>
            <h2 className="loading-message">{loadingMessage || "Cargando datos..."}</h2>
          </div>
        </div>
      </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
      <div className="loading-error-wrapper">
        <div className="row justify-content-center">
          <div className="loading-error-container error-state">
            <div className="error-icon">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
              </svg>
            </div>
            <h2>Error al cargar datos</h2>
            <p className="error-detail">{errorMessage || error.message || "Ha ocurrido un error inesperado."}</p>
            <button 
              className="retry-button"
              onClick={onRetry || (() => window.location.reload())}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
      </Layout>
    );
  }

  return children;
};

export default LoadingError;