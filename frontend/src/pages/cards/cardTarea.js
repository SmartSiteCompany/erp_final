// components/TareaCard.jsx
import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CardTarea = ({ tarea, onEdit, onDelete, onStatusChange }) => {
    const getBadgeVariant = () => {
        switch(tarea.estado) {
            case 'pendiente': return 'warning';
            case 'en progreso': return 'primary';
            case 'completada': return 'success';
            default: return 'secondary';
        }
    };

    return (
        <Card className="mb-3 shadow-sm">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                    <Card.Title>{tarea.descripcion}</Card.Title>
                    <Badge pill bg={getBadgeVariant()}>
                        {tarea.estado.toUpperCase()}
                    </Badge>
                </div>
                
                <Card.Text className="text-muted mt-2">
                    <small>
                        <strong>Vence:</strong> {format(new Date(tarea.fecha_vencimiento), 'PPP', { locale: es })}
                    </small>
                </Card.Text>
                
                {tarea.cliente_id && (
                    <Card.Text>
                        <strong>Cliente:</strong> {tarea.cliente_id.nombre || 'N/A'}
                    </Card.Text>
                )}
                
                <div className="d-flex justify-content-end gap-2 mt-3">
                    <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => onEdit(tarea)}
                    >
                        Editar
                    </Button>
                    <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => onDelete(tarea._id)}
                    >
                        Eliminar
                    </Button>
                    <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => onStatusChange(tarea)}
                    >
                        Cambiar Estado
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default CardTarea;