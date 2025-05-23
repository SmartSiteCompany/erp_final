import React, { useState } from 'react';
import UserService from '../../services/UserService'; // Ajusta la ruta si es necesario
import { useAuth } from '../../context/AuthContext';

const EditarPerfil = ({ currentUser, onProfileUpdated, onCancel }) => {
    const { token } = useAuth();
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
const userService = UserService;

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        try {
            const formData = new FormData();
            // Removed userId from formData as backend gets it from token
            formData.append('foto_user', selectedFile);
    
            const result = await userService.subirFotoPerfil(formData, token);
            
            // Construir URL completa con el dominio del backend
            const imageUrl = `http://localhost:8000${result.filePath}?${Date.now()}`;
            
            onProfileUpdated({ 
                ...currentUser, 
                foto_user: imageUrl 
            });
            
        } catch (err) {
            // Show backend error message if available
            setUploadError(err.message || 'Error al actualizar la foto');
        }
    };

    return (
        <div style={{
            border: '2px solid #ccc',
            borderRadius: '5px',
            padding: '20px',
            backgroundColor: '#f9f9f9',
            boxShadow: '2px 2px 5px #ddd',
            fontFamily: 'sans-serif',
            maxWidth: '400px',
            margin: '0 auto',
        }}>
            <h2 style={{
                fontSize: '1.2em',
                marginBottom: '15px',
                color: '#333',
                borderBottom: '1px solid #eee',
                paddingBottom: '10px',
            }}>Editar Foto de Perfil</h2>
            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="fileInput" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                    Seleccionar archivo:
                </label>
                <input
                    id="fileInput"
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '3px', width: '100%' }}
                />
            </div>
            {uploadError && (
                <p style={{ color: 'red', marginBottom: '10px', fontSize: '0.9em' }}>{uploadError}</p>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        padding: '10px 15px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '0.9em',
                    }}
                    onClick={handleUpload}
                    disabled={uploading}
                >
                    {uploading ? 'Subiendo...' : 'Subir'}
                </button>
                <button
                    style={{
                        backgroundColor: '#6c757d',
                        color: 'white',
                        padding: '10px 15px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '0.9em',
                    }}
                    onClick={onCancel}
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
};

export default EditarPerfil;