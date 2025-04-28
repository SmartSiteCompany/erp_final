// components/ListaTareasUsuario.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import CardTarea from './cardTarea';
import TareaService from '../../services/TareaService';
import { useAuth } from '../../context/AuthContext'; // Ruta corregida

const ListaTareasUsuario = () => {
    const [tareas, setTareas] = useState([]);
    const { user } = useAuth();
    const tareaService = TareaService();
    
    const cargarTareasUsuario = useCallback(async () => {
        try {
            const tareasData = await tareaService.obtenerTareasPorUsuario(user?._id);
            setTareas(tareasData);
        } catch (error) {
            console.error("Error al cargar tareas:", error);
        }
    }, [user?._id, tareaService]);

    useEffect(() => {
        if (user?._id) {
            cargarTareasUsuario();
        }
    }, [user, cargarTareasUsuario]); // Dependencias correctas

    const handleEditarTarea = (tarea) => {
        // Lógica para editar tarea
        console.log('Editar tarea:', tarea);
    };

    const handleEliminarTarea = async (id) => {
        try {
            await tareaService.eliminarTarea(id);
            setTareas(prevTareas => prevTareas.filter(t => t._id !== id));
        } catch (error) {
            console.error("Error al eliminar tarea:", error);
        }
    };

    const handleCambiarEstado = async (tarea) => {
        // Lógica para cambiar estado
        console.log('Cambiar estado de tarea:', tarea);
    };

    if (tareaService.loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </Spinner>
            </Container>
        );
    }

    if (tareaService.error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{tareaService.error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <Row>
                <Col>
                    <h3 className="mb-4">Mis Tareas</h3>
                    
                    {tareas.length === 0 ? (
                        <Alert variant="info">
                            No tienes tareas asignadas actualmente.
                        </Alert>
                    ) : (
                        <Row>
                            {tareas.map(tarea => (
                                <Col key={tarea._id} md={6} lg={4} className="mb-4">
                                    <CardTarea
                                        tarea={tarea}
                                        onEdit={handleEditarTarea}
                                        onDelete={handleEliminarTarea}
                                        onStatusChange={handleCambiarEstado}
                                    />
                                </Col>
                            ))}
                        </Row>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default ListaTareasUsuario;