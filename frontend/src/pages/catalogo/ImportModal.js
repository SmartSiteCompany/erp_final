import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Modal, ProgressBar, Spinner } from 'react-bootstrap';
import axios from 'axios';
import CatalogoService from '../../services/CatalagoService';

const ImportModal = ({ show, onHide, onImportSuccess }) => {
  // Estados
  const [file, setFile] = useState(null);
  const [importFileName, setImportFileName] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);
  const cancelTokenRef = useRef(null);

  // Servicio
  const { cargarCatalogo, loading, error } = CatalogoService();
  const baseURL = 'http://localhost:8000';

  // Manejador de cambio de archivo
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validar extensión del archivo
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(`.${fileExtension}`)) {
      showError("Tipo de archivo no válido", "Solo se aceptan archivos Excel (.xlsx, .xls) o CSV", 'validation');
      return;
    }

    // Leer y validar el archivo
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Validar columnas requeridas
        const requiredColumns = {
          'B1': 'Codigo Smart',
          'C1': 'Descripción',
          'E1': 'Categoria',
          'G1': 'Precio de compra'
        };
        
        const missingColumns = Object.entries(requiredColumns)
          .filter(([cell, expected]) => !firstSheet[cell] || firstSheet[cell].v !== expected)
          .map(([_, expected]) => expected);
        
        if (missingColumns.length > 0) {
          showError(
            "El archivo no tiene el formato esperado",
            `Faltan columnas requeridas: ${missingColumns.join(', ')}`,
            'validation'
          );
          return;
        }
        
        // Archivo válido
        setFile(selectedFile);
        setImportFileName(selectedFile.name);
        setImportResult(null);
      } catch (error) {
        showError("Error al leer el archivo", "El archivo podría estar corrupto o no ser un Excel válido", 'validation');
      }
    };
    
    reader.onerror = () => {
      showError("Error al leer el archivo", "No se pudo leer el contenido del archivo", 'file');
    };
    
    reader.readAsArrayBuffer(selectedFile);
  };

  // Función para mostrar errores
  const showError = (message, details, errorType) => {
    setImportResult({
      success: false,
      message,
      details,
      errorType
    });
    setImportStatus('error');
  };

  // Iniciar importación
  const startImport = async () => {
    if (!file) return;
  
    setIsImporting(true);
    setImportStatus('uploading');
    setImportProgress(0);
    setImportResult(null);
  
    try {
      const result = await cargarCatalogo(file, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || file.size)
        );
        setImportProgress(percentCompleted);
      });
  
      setImportResult({
        success: true,
        message: result.message || 'Importación completada con éxito',
        details: `Se importaron ${result.imported || result.count} productos`,
        imported: result.imported || result.count
      });
      setImportStatus('done');
      
      if (onImportSuccess) onImportSuccess();
    } catch (error) {
      console.error('Error en importación:', error);
      
      let errorMessage = 'Error en la importación';
      let errorDetails = error.message;
      
      if (error.response) {
        errorMessage = error.response.data?.error || errorMessage;
        errorDetails = error.response.data?.details || 
                      (Array.isArray(error.response.data?.errors) ? 
                       error.response.data.errors.join('. ') : 
                       errorDetails);
      }
  
      setImportResult({
        success: false,
        message: errorMessage,
        details: errorDetails,
        errorType: 'server'
      });
      setImportStatus('error');
    } finally {
      setIsImporting(false);
    }
  };

  // Cancelar importación
  const handleCancelImport = () => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel("Importación cancelada por el usuario");
    }
  };

  // Cerrar modal
  const handleClose = () => {
    if (!isImporting) {
      onHide();
      resetModal();
    }
  };

  // Reiniciar modal
  const resetModal = () => {
    setFile(null);
    setImportFileName('');
    setImportStatus('');
    setImportProgress(0);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Descargar plantilla
  const downloadTemplate = async () => {
    try {
      const response = await axios.get(`${baseURL}/catalogos/plantilla`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'plantilla-catalogo.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      showError(
        "Error al descargar plantilla",
        "No se pudo descargar el archivo de plantilla",
        'download'
      );
    }
  };

  // Funciones auxiliares para renderizado
  const getStatusIcon = () => {
    switch (importStatus) {
      case 'done': return <i className="mdi mdi-check-circle-outline display-4 text-success"></i>;
      case 'error': return <i className="mdi mdi-alert-circle-outline display-4 text-danger"></i>;
      case 'cancelled': return <i className="mdi mdi-cancel display-4 text-warning"></i>;
      default: return <Spinner animation="border" variant="primary" className="spinner-lg" />;
    }
  };

  const getStatusTitle = () => {
    switch (importStatus) {
      case 'uploading': return "Subiendo archivo...";
      case 'processing': return "Procesando datos...";
      case 'done': return "¡Importación exitosa!";
      case 'error': return "Error en la importación";
      case 'cancelled': return "Importación cancelada";
      default: return "Importar catálogo desde Excel";
    }
  };

  const getModalHeaderClass = () => {
    switch (importStatus) {
      case 'done': return 'bg-success text-white';
      case 'error': return 'bg-danger text-white';
      case 'cancelled': return 'bg-warning text-dark';
      default: return 'bg-primary text-white';
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg" backdrop={isImporting ? 'static' : true}>
      <Modal.Header 
        closeButton 
        className={getModalHeaderClass()}
        closeVariant={['done', 'error'].includes(importStatus) ? 'white' : undefined}
      >
        <Modal.Title>{getStatusTitle()}</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <div className="text-center mb-4">
          <div className="import-status-icon mb-3">{getStatusIcon()}</div>
          
          {importFileName && (
            <div className="file-info bg-light p-3 rounded mb-3">
              <div className="d-flex align-items-center justify-content-center">
                <i className="mdi mdi-file-excel-outline me-2 text-success fs-3"></i>
                <div className="text-start">
                  <div className="fw-bold">{importFileName}</div>
                  {file?.size && (
                    <small className="text-muted">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </small>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {importStatus && importStatus !== 'done' && importStatus !== 'error' && importStatus !== 'cancelled' && (
          <div className="mb-4">
            <div className="d-flex justify-content-between mb-1">
              <small>Progreso de importación</small>
              <small>{importProgress}%</small>
            </div>
            <ProgressBar 
              now={importProgress} 
              variant="primary"
              animated={importStatus !== 'done' && importStatus !== 'error'}
              striped 
              className="progress-lg"
            />
          </div>
        )}
        
        {importResult && (
          <div className={`alert alert-${importResult.success ? 'success' : 
                         importResult.errorType === 'cancelled' ? 'warning' : 'danger'} mb-0`}>
            <div className="d-flex align-items-start">
              <i className={`mdi mdi-${
                importResult.success ? 'check-circle' : 
                importResult.errorType === 'cancelled' ? 'cancel' : 'alert-circle'
              } me-2 mt-1 fs-4`}></i>
              
              <div className="flex-grow-1">
                <h5 className="alert-heading">{importResult.message}</h5>
                {importResult.details && <p className="mb-2">{importResult.details}</p>}
              </div>
            </div>
          </div>
        )}
        
        {!file && !isImporting && (
          <div className="text-center mt-4">
            <label className="btn btn-primary btn-lg">
              <i className="mdi mdi-file-upload me-2"></i> Seleccionar archivo Excel
              <input 
                ref={fileInputRef} 
                type="file" 
                style={{ display: 'none' }} 
                accept=".xlsx, .xls, .csv" 
                onChange={handleFileChange}
              />
            </label>
            <p className="mt-3 text-muted">
              Formatos aceptados: .xlsx, .xls, .csv (Tamaño máximo: 5MB)
            </p>
            <button 
              className="btn btn-outline-primary mt-2" 
              onClick={downloadTemplate}
            >
              <i className="mdi mdi-download me-1"></i> Descargar plantilla
            </button>
          </div>
        )}
      </Modal.Body>
      
      <Modal.Footer className="d-flex justify-content-between">
        {importStatus === 'error' || importStatus === 'cancelled' ? (
          <>
            <button className="btn btn-outline-secondary" onClick={handleClose}>
              <i className="mdi mdi-close me-1"></i> Cerrar
            </button>
            <div>
              <label className="btn btn-primary me-2 mb-1 mb-md-0">
                <i className="mdi mdi-file-upload me-1"></i> Reintentar
                <input 
                  type="file" 
                  style={{ display: 'none' }} 
                  accept=".xlsx, .xls, .csv"  
                  onChange={handleFileChange}
                />
              </label>
              <button className="btn btn-outline-primary" onClick={downloadTemplate}>
                <i className="mdi mdi-download me-1"></i> Plantilla
              </button>
            </div>
          </>
        ) : importStatus === 'done' ? (
          <button className="btn btn-success" onClick={handleClose}>
            <i className="mdi mdi-check me-1"></i> Aceptar
          </button>
        ) : file && !isImporting ? (
          <>
            <button 
              className="btn btn-outline-secondary" 
              onClick={() => { setFile(null); setImportFileName(''); }}
            >
              <i className="mdi mdi-arrow-left me-1"></i> Cambiar archivo
            </button>
            <button className="btn btn-primary" onClick={startImport}>
              <i className="mdi mdi-file-import me-1"></i> Iniciar importación
            </button>
          </>
        ) : isImporting ? (
          <button className="btn btn-danger" onClick={handleCancelImport}>
            <i className="mdi mdi-cancel me-1"></i> Cancelar
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={handleClose}>
            <i className="mdi mdi-close me-1"></i> Cancelar
          </button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ImportModal;