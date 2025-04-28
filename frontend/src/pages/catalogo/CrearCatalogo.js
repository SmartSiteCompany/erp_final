import React, { useState } from "react";
import Layout from "../../layouts/pages/layout";
import { useNavigate } from "react-router-dom";
import { Form, Row, Col, Card, Button } from "react-bootstrap";
import useCatalogoService from "../../services/CatalagoService";

const CrearCatalogo = () => {
    const navigate = useNavigate();
    const { crearProducto } = useCatalogoService();
    const [formData, setFormData] = useState({
        codigo: "",
        nombre: "",
        codigoTienda: "",
        categoria: "",
        subcategoria: "",
        precioCompra: 0,
        precioSinFinanciamiento: 0,
        precioConFinanciamiento: 0,
        seccion: "",
        estatus: "Activo"
    });
    const [validated, setValidated] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        if (!isNaN(value) && parseFloat(value) >= 0) {
            setFormData({ ...formData, [name]: parseFloat(value) });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }
        
        setLoading(true);
        
        try {
            await crearProducto(formData);
            navigate("/catalogo", { state: { success: "Producto creado exitosamente" } });
        } catch (error) {
            console.error("Error al crear producto:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Row>
                <Col lg={12}>
                    <Card>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4 className="header-title">Agregar Producto al Catálogo</h4>
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={() => navigate("/catalogo")}
                                    disabled={loading}
                                >
                                    <i className="uil uil-arrow-left me-1"></i> Volver
                                </Button>
                            </div>
                            <hr className="mt-0" />

                            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Código Smart <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="codigo"
                                                value={formData.codigo}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Ej: PROD-001"
                                                disabled={loading}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Por favor ingrese un código válido
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Descripción <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="nombre"
                                                value={formData.nombre}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Nombre del producto"
                                                disabled={loading}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Por favor ingrese una descripción válida
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Código Tienda</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="codigoTienda"
                                                value={formData.codigoTienda}
                                                onChange={handleInputChange}
                                                placeholder="Código en la tienda"
                                                disabled={loading}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Categoría <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="categoria"
                                                value={formData.categoria}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Categoría del producto"
                                                disabled={loading}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                Por favor ingrese una categoría válida
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Subcategoría</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="subcategoria"
                                                value={formData.subcategoria}
                                                onChange={handleInputChange}
                                                placeholder="Subcategoría del producto"
                                                disabled={loading}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Sección</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="seccion"
                                                value={formData.seccion}
                                                onChange={handleInputChange}
                                                placeholder="Sección del producto"
                                                disabled={loading}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Precio de Compra</Form.Label>
                                            <div className="input-group">
                                                <span className="input-group-text">$</span>
                                                <Form.Control
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    name="precioCompra"
                                                    value={formData.precioCompra}
                                                    onChange={handleNumberChange}
                                                    disabled={loading}
                                                />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Precio Sin Financiamiento</Form.Label>
                                            <div className="input-group">
                                                <span className="input-group-text">$</span>
                                                <Form.Control
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    name="precioSinFinanciamiento"
                                                    value={formData.precioSinFinanciamiento}
                                                    onChange={handleNumberChange}
                                                    disabled={loading}
                                                />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Precio Con Financiamiento</Form.Label>
                                            <div className="input-group">
                                                <span className="input-group-text">$</span>
                                                <Form.Control
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    name="precioConFinanciamiento"
                                                    value={formData.precioConFinanciamiento}
                                                    onChange={handleNumberChange}
                                                    disabled={loading}
                                                />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Estatus</Form.Label>
                                    <Form.Select
                                        name="estatus"
                                        value={formData.estatus}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                    >
                                        <option value="Activo">Activo</option>
                                        <option value="Inactivo">Inactivo</option>
                                    </Form.Select>
                                </Form.Group>

                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <Button 
                                        variant="light" 
                                        type="button"
                                        onClick={() => navigate("/catalogo")}
                                        disabled={loading}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button 
                                        variant="primary" 
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <i className="uil uil-save me-1"></i> Guardar Producto
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Layout>
    );
};

export default CrearCatalogo;