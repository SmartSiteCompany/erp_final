const { triggerAsyncId } = require('async_hooks');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');


const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API CRM & Cotizaciones',
      version: '1.0.0',
      description: 'Documentación completa del sistema',
    },
    tags: [
      { name: 'Autenticación', description: 'Operaciones de autenticación' },
      { name: 'Cotizaciones', description: 'Operaciones relacionadas con cotizaciones' },
      { name: 'Clientes', description: 'Operaciones relacionadas con clientes' },
      { name: 'Pagos', description: 'Operaciones relacionadas con pagos' },
      { name: 'Estados de Cuenta', description: 'Operaciones relacionadas con estados de cuenta' },
      { name: 'Documentos', description: 'Operaciones relacionadas con documentos' },
      { name: 'Eventos', description: 'Operaciones relacionadas con eventos' },
      { name: 'Interacciones', description: 'Operaciones relacionadas con interacciones' },
      { name: 'Notas', description: 'Operaciones relacionadas con notas' },
      { name: 'Oportunidades', description: 'Operaciones relacionadas con oportunidades de venta' },
      { name: 'Segmentaciones', description: 'Operaciones relacionadas con segmentaciones de clientes' },
      { name: 'Tareas', description: 'Operaciones relacionadas con tareas' },
      { name: 'Filiales', description: 'Operaciones relacionadas con filiales' },
      { name: 'Feedbacks', description: 'Operaciones relacionadas con feedbacks de clientes' }
    ],
    components: {
      schemas: {
        // ==================== AUTENTICACIÓN ====================
        Usuario: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'María García' },
            email: { type: 'string', format: 'email', example: 'maria@empresa.com' },
            rol_user: { type: 'string', enum: ['admin', 'usuario', 'vendedor'], example: 'admin' },
            foto_user: { type: 'string', example: 'uploads/users/foto-maria.jpg' },
            filial_id: { type: 'string', example: '611f1f77bcf86cd799433344' }
          }
        },

        PasswordReset: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'a1b2c3d4e5f6' },
            email: { type: 'string', example: 'maria@empresa.com' },
            created_at: { type: 'string', format: 'date-time', example: '2023-01-01T00:00:00Z' }
          }
        },

        // ==================== GESTIÓN DE CLIENTES ====================
        Cliente: {
          type: 'object',
          required: ['nombre', 'telefono', 'correo', 'tipo_cliente'],
          properties: {
            _id: { type: 'string', example: '611f1f77bcf86cd799433333' },
            nombre: { type: 'string', example: 'Carlos Méndez' },
            telefono: { type: 'string', example: '+525512345678' },
            correo: { type: 'string', format: 'email', example: 'carlos@cliente.com' },
            direccion: { type: 'string', example: 'Av. Principal 123' },
            tipo_cliente: { type: 'string', enum: ['Individual', 'Empresa'], example: 'Individual' },
            estado_cliente: { type: 'string', enum: ['Activo', 'Inactivo'], example: 'Activo' },
            fecha_registro: { type: 'string', format: 'date-time', example: '2023-01-01T00:00:00Z' }
          }
        },

        ChangeLog: {
          type: 'object',
          required: ['cliente_id', 'campo_modificado', 'valor_anterior', 'valor_nuevo'],
          properties: {
            cliente_id: { type: 'string', example: '611f1f77bcf86cd799433333' },
            campo_modificado: { type: 'string', example: 'dirección' },
            valor_anterior: { type: 'string', example: 'Av. Reforma 123' },
            valor_nuevo: { type: 'string', example: 'Av. Insurgentes 456' },
            fecha_cambio: { type: 'string', format: 'date-time', example: '2023-01-01T00:00:00Z' },
            responsable: { type: 'string', example: 'admin@empresa.com' }
          }
        },

        // ==================== MARKETING ====================
        Campana: {
          type: 'object',
          required: ['nombre', 'fecha_inicio', 'fecha_fin'],
          properties: {
            nombre: { type: 'string', example: 'Promoción Verano 2023' },
            descripcion: { type: 'string', example: 'Descuentos especiales para clientes recurrentes' },
            fecha_inicio: { type: 'string', format: 'date-time', example: '2023-06-01T00:00:00Z' },
            fecha_fin: { type: 'string', format: 'date-time', example: '2023-08-31T23:59:59Z' },
            estado: { type: 'string', enum: ['activa', 'inactiva', 'completada'], example: 'activa' },
            clientes: { 
              type: 'array',
              items: { type: 'string' },
              example: ['611f1f77bcf86cd799433333', '611f1f77bcf86cd799433334']
            }
          }
        },

        Evento: {
          type: 'object',
          required: ['nombre', 'fecha', 'ubicacion'],
          properties: {
            nombre: { type: 'string', example: 'Taller de Energías Renovables' },
            descripcion: { type: 'string', example: 'Taller práctico sobre instalación de paneles solares' },
            fecha: { type: 'string', format: 'date-time', example: '2023-07-15T10:00:00Z' },
            ubicacion: { type: 'string', example: 'Oficina Central' },
            clientes: {
              type: 'array',
              items: { type: 'string' },
              example: ['611f1f77bcf86cd799433333']
            }
          }
        },

        Segmentacion: {
          type: 'object',
          required: ['nombre', 'criterios'],
          properties: {
            nombre: { type: 'string', example: 'Clientes Empresariales' },
            descripcion: { type: 'string', example: 'Segmento para empresas con facturación mayor a $100k' },
            criterios: { type: 'string', example: 'tipo_cliente:Empresa' },
            clientes: {
              type: 'array',
              items: { type: 'string' },
              example: ['611f1f77bcf86cd799433335']
            }
          }
        },

        // ==================== VENTAS ====================
        Oportunidad: {
          type: 'object',
          required: ['cliente_id', 'descripcion', 'valor_estimado', 'fecha_cierre_estimada'],
          properties: {
            cliente_id: { type: 'string', example: '611f1f77bcf86cd799433333' },
            descripcion: { type: 'string', example: 'Proyecto de instalación solar residencial' },
            valor_estimado: { type: 'number', example: 25000 },
            fecha_cierre_estimada: { type: 'string', format: 'date-time', example: '2023-09-30T23:59:59Z' },
            estado: { type: 'string', enum: ['en progreso', 'ganada', 'perdida'], example: 'en progreso' },
            responsable: { type: 'string', example: 'vendedor1@empresa.com' }
          }
        },

        // ==================== COTIZACIONES ====================
        Cotizacion: {
          type: 'object',
          required: ['nombre_cotizacion', 'cliente_id', 'detalles'],
          properties: {
            nombre_cotizacion: { type: 'string', example: 'COT-2023-001' },
            cliente_id: { type: 'string', example: '611f1f77bcf86cd799433333' },
            vendedor: { type: 'string', example: 'vendedor1@empresa.com' },
            filial_id: { type: 'string', example: '611f1f77bcf86cd799433344' },
            detalles: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  descripcion: { type: 'string', example: 'Instalación de paneles solares 5kW' },
                  costo_materiales: { type: 'number', example: 15000 },
                  costo_mano_obra: { type: 'number', example: 5000 },
                  utilidad_esperada: { type: 'number', example: 20 }
                }
              }
            },
            estado: { type: 'string', enum: ['Borrador', 'Enviada', 'Aprobada', 'Completada', 'Cancelada'], example: 'Aprobada' },
            forma_pago: { type: 'string', enum: ['Contado', 'Financiado'], example: 'Financiado' },
            financiamiento: {
              type: 'object',
              properties: {
                anticipo_solicitado: { type: 'number', example: 5000 },
                plazo_semanas: { type: 'number', example: 12 },
                pago_semanal: { type: 'number', example: 1250 }
              }
            }
          }
        },

        // ==================== FINANZAS ====================
        EstadoCuenta: {
          type: 'object',
          required: ['cliente_id', 'cotizacion_id', 'saldo_inicial'],
          properties: {
            cliente_id: { type: 'string', example: '611f1f77bcf86cd799433333' },
            cotizacion_id: { type: 'string', example: '611f1f77bcf86cd799433355' },
            saldo_inicial: { type: 'number', example: 20000 },
            pagos_total: { type: 'number', example: 5000 },
            saldo_actual: { type: 'number', example: 15000 },
            estado: { type: 'string', enum: ['Activo', 'Pagado', 'Vencido', 'Cancelado'], example: 'Activo' },
            intereses_moratorios: { type: 'number', example: 0 }
          }
        },

        Pago: {
          type: 'object',
          required: ['cliente_id', 'cotizacion_id', 'monto_pago', 'tipo_pago'],
          properties: {
            cliente_id: { type: 'string', example: '611f1f77bcf86cd799433333' },
            cotizacion_id: { type: 'string', example: '611f1f77bcf86cd799433355' },
            monto_pago: { type: 'number', example: 5000 },
            tipo_pago: { type: 'string', enum: ['Contado', 'Financiado', 'Anticipo', 'Abono'], example: 'Abono' },
            metodo_pago: { type: 'string', enum: ['Efectivo', 'Transferencia', 'Tarjeta', 'Cheque'], example: 'Transferencia' },
            referencia: { type: 'string', example: 'TRANS-12345' }
          }
        },

        // ==================== DOCUMENTOS ====================
        Documento: {
          type: 'object',
          required: ['cliente_id', 'nombre', 'tipo'],
          properties: {
            cliente_id: { type: 'string', example: '611f1f77bcf86cd799433333' },
            nombre: { type: 'string', example: 'Contrato-Servicio-001' },
            tipo: { type: 'string', enum: ['contrato', 'factura', 'propuesta', 'otro'], example: 'contrato' },
            archivo: { type: 'string', example: 'uploads/documents/contrato-001.pdf' },
            formato: { type: 'string', enum: ['.pdf', '.xls', '.docx', '.csv'], example: '.pdf' }
          }
        },

        // ==================== CRM ====================
        Interaccion: {
          type: 'object',
          required: ['cliente_id', 'tipo_interaccion', 'descripcion'],
          properties: {
            cliente_id: { type: 'string', example: '611f1f77bcf86cd799433333' },
            tipo_interaccion: { type: 'string', enum: ['llamada', 'correo', 'reunión', 'visita'], example: 'llamada' },
            descripcion: { type: 'string', example: 'El cliente consultó por garantías' },
            responsable: { type: 'string', example: 'asesor1@empresa.com' },
            estado: { type: 'string', enum: ['pendiente', 'completada', 'cancelada'], example: 'completada' }
          }
        },

        Feedback: {
          type: 'object',
          required: ['cliente_id', 'comentario', 'calificacion'],
          properties: {
            cliente_id: { type: 'string', example: '611f1f77bcf86cd799433333' },
            comentario: { type: 'string', example: 'Excelente servicio post-venta' },
            calificacion: { type: 'number', minimum: 1, maximum: 5, example: 5 },
            fecha: { type: 'string', format: 'date-time', example: '2023-01-15T00:00:00Z' }
          }
        },

        Nota: {
          type: 'object',
          required: ['titulo', 'contenido', 'autor'],
          properties: {
            cliente_id: { type: 'string', example: '611f1f77bcf86cd799433333' },
            usuario_id: { type: 'string', example: '611f1f77bcf86cd799433344' },
            titulo: { type: 'string', example: 'Recordar seguimiento' },
            contenido: { type: 'string', example: 'El cliente solicitará una cotización adicional en 2 semanas' },
            autor: { type: 'string', example: 'asesor1@empresa.com' }
          }
        },

        Tarea: {
          type: 'object',
          required: ['descripcion', 'fecha_vencimiento', 'responsable'],
          properties: {
            descripcion: { type: 'string', example: 'Enviar recordatorio de pago' },
            fecha_vencimiento: { type: 'string', format: 'date-time', example: '2023-02-01T17:00:00Z' },
            responsable: { type: 'string', example: 'asesor1@empresa.com' },
            estado: { type: 'string', enum: ['pendiente', 'en progreso', 'completada'], example: 'pendiente' }
          }
        },

        // ==================== CONFIGURACIÓN ====================
        Filial: {
          type: 'object',
          required: ['nombre_filial'],
          properties: {
            nombre_filial: { type: 'string', enum: ['DataX', 'StudioDesign', 'GeneralSystech', 'SmartSite'], example: 'DataX' },
            descripcion_filial: { type: 'string', example: 'Sucursal especializada en análisis de datos' }
          }
        },

        // ==================== ERRORES ====================
        ErrorAPI: {
          type: 'object',
          properties: {
            codigo: { type: 'number', example: 404 },
            mensaje: { type: 'string', example: 'Recurso no encontrado' },
            detalles: { type: 'string', example: 'El cliente con ID 123 no existe' }
          }
        }
      },
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ BearerAuth: [] }]
  },
  apis: [ path.resolve(__dirname, '../routes/*.js') ], // Ruta a los archivos de rutas
};


const swaggerSpec = swaggerJsdoc(swaggerOptions);
module.exports = swaggerSpec;