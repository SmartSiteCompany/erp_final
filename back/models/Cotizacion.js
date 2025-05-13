const mongoose = require('mongoose');
const {
  estadosCotizacion,
  formasPago,
  estadosServicio,
  configFinanciera
} = require('../utils/constantes');

const cotizacionSchema = new mongoose.Schema({
  // ======================
  // Información Básica
  // ======================
  nombre_cotizacion: {
    type: String,
    required: [true, 'El nombre de la cotización es requerido'],
    maxlength: [100, 'El nombre no puede exceder los 100 caracteres'],
    trim: true
  },

  id_manual: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      const random = Math.floor(Math.random() * 90 + 10); // Número entre 10-99
      return `COT-${Date.now().toString().slice(-6)}-${random}`;
    }
  },

  fecha_cotizacion: {
    type: Date,
    default: Date.now,
    immutable: true
  },

  valido_hasta: {
    type: Date,
    required: [true, 'La fecha de validez es requerida'],
    validate: {
      validator: function(value) {
        return value > this.fecha_cotizacion;
      },
      message: 'La fecha de validez debe ser posterior a la creación'
    }
  },

  // ======================
  // Estados y Flujos
  // ======================
  estado: {
    type: String,
    enum: {
      values: estadosCotizacion,
      message: 'Estado no válido'
    },
    default: 'Borrador'
  },

  estado_servicio: {
    type: String,
    enum: estadosServicio,
    default: 'Pendiente'
  },

  // ======================
  // Relaciones
  // ======================
  cliente_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: [true, 'El cliente es requerido']
  },

  vendedor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El vendedor es requerido']
  },

  filial_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Filial',
    required: [true, 'La filial es requerida']
  },

  // ======================
  // Detalles y Cálculos
  // ======================
  detalles: {
    type: [{
      tipo: {
        type: String,
        enum: ['Producto', 'Servicio', 'ManoObra'],
        required: true,
        default: 'Producto'
      },

      producto_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Catalogo',
        required: function() { return this.tipo !== 'ManoObra'; }
      },

      /*descripcion: {
        type: String,
        required: [true, 'La descripción es requerida'],
        maxlength: 200
      },*/

      cantidad: {
        type: Number,
        required: true,
        min: [1, 'La cantidad mínima es 1'],
        default: 1
      },

      /*horas: {
        type: Number,
        required: function() { return this.tipo === 'ManoObra'; },
        min: [0, 'Las horas no pueden ser negativas']
      },*/

      /*tarifa_hora: {
        type: Number,
        default: configFinanciera.TARIFA_MANO_OBRA || 100
      },*/

      costo_materiales: {
        type: Number,
        min: [0, 'El costo no puede ser negativo'],
        required: function() { return this.tipo !== 'ManoObra'; }
      },

      /*costo_mano_obra: {
        type: Number,
        min: [0, 'El costo no puede ser negativo'],
        required: function() { return this.tipo === 'ManoObra'; }
      },*/

      utilidad_esperada: {
        type: Number,
        default: 0,
        min: [0, 'La utilidad no puede ser negativa'],
        max: [100, 'La utilidad máxima es 100%']
      },

      // Campos calculados
      inversion_total: {
        type: Number,
        default: 0
      },

      precio_venta: {
        type: Number,
        default: 0
      }
    }],
    required: true,
    validate: {
      validator: array => array.length > 0,
      message: 'Debe incluir al menos un ítem'
    }
  },

  // ======================
  // Porcentajes Dinámicos
  // ======================
  porcentajes: {
    iva: {
      type: Number,
      default: configFinanciera.IVA * 100, // 16%
      min: 0,
      max: 100
    },
    financiamiento: {
      type: Number,
      default: configFinanciera.TASA_FINANCIAMIENTO * 100, // 34%
      min: 0
    },
    agregado: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  calculos_automaticos: {
    type: Boolean,
    default: true
  },

  // ======================
  // Totales Editables
  // ======================
  subtotal: {
    type: Number,
    min: 0,
    editable: true
  },

  iva: {
    type: Number,
    min: 0,
    editable: true
  },

  precio_venta: {
    type: Number,
    min: 0,
    editable: true
  },

  // ======================
  // Pago y Financiamiento
  // ======================
  forma_pago: {
    type: String,
    enum: formasPago,
    required: [true, 'La forma de pago es requerida']
  },

  pago_contado_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pago'
  },

  financiamiento: {
    anticipo_solicitado: {
      type: Number,
      min: 0
    },
    plazo_semanas: {
      type: Number,
      min: 1
    },
    pago_semanal: {
      type: Number,
      min: 0
    },
    saldo_restante: {
      type: Number,
      min: 0
    },
    fecha_inicio: Date,
    fecha_termino: Date,
    pagos_ids: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pago'
    }],
    tasa_interes: {
      type: Number,
      default: configFinanciera.TASA_FINANCIAMIENTO // 0.34
    }
  },

  // ======================
  // Seguimiento de Servicio
  // ======================
  fecha_inicio_servicio: {
    type: Date,
    validate: {
      validator: function(value) {
        if (this.estado_servicio === 'En Proceso' && !value) return false;
        return true;
      },
      message: 'Fecha de inicio requerida cuando el servicio está en proceso'
    }
  },

  fecha_fin_servicio: {
    type: Date,
    validate: {
      validator: function(value) {
        if (this.estado_servicio === 'Completado' && !value) return false;
        if (value && this.fecha_inicio_servicio && value < this.fecha_inicio_servicio) return false;
        return true;
      },
      message: 'La fecha de fin debe ser posterior al inicio'
    }
  },

  // ======================
  // Metadata
  // ======================
  creado_por: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },

  actualizado_por: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }

}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// ======================
// Índices
// ======================
cotizacionSchema.index({ cliente_id: 1, estado: 1 });
cotizacionSchema.index({ filial_id: 1, fecha_cotizacion: -1 });
cotizacionSchema.index({ estado_servicio: 1, fecha_inicio_servicio: 1 });
cotizacionSchema.index({ 'financiamiento.fecha_termino': 1 });
//cotizacionSchema.index({ id_manual: 1 }, { unique: true });

// ======================
// Middlewares (Hooks)
// ======================
cotizacionSchema.pre('save', async function(next) {
  try {
    // Cálculos a nivel de ítem
    this.detalles.forEach(item => {
      // Calcular costo de mano de obra si es aplicable
      if (item.tipo === 'ManoObra') {
        item.costo_mano_obra = item.horas * item.tarifa_hora;
        item.costo_materiales = 0;
      }

      item.inversion_total = item.costo_materiales + item.costo_mano_obra;
      item.precio_venta = item.inversion_total * (1 + (item.utilidad_esperada || 0) / 100);
    });

    // Cálculos globales (solo si es automático)
    if (this.calculos_automaticos) {
      this.subtotal = this.detalles.reduce((sum, item) => sum + (item.precio_venta * item.cantidad), 0);
      this.iva = parseFloat((this.subtotal * (this.porcentajes.iva / 100)).toFixed(2));

      const cargoFinanciero = this.forma_pago === 'Financiado' ?
        this.subtotal * (this.porcentajes.financiamiento / 100) : 0;

      const cargoAgregado = this.subtotal * (this.porcentajes.agregado / 100);

      this.precio_venta = parseFloat((
        this.subtotal +
        Number(this.iva) +
        cargoFinanciero +
        cargoAgregado
      ).toFixed(2));
    }

    // Lógica de pagos
    if (this.forma_pago === 'Financiado') {
      await this._handleFinanciamiento();
    } else {
      this._handleContado();
    }

    // Validación de estados
    this._validateStatusChanges();

    next();
  } catch (error) {
    next(error);
  }
});

// ======================
// Métodos de Instancia
// ======================
cotizacionSchema.methods._handleFinanciamiento = function() {
  if (!this.financiamiento?.plazo_semanas || this.financiamiento.plazo_semanas <= 0) {
    throw new Error('Plazo de financiamiento inválido (mínimo 1 semana)');
  }

  // Aplicar tasa de interés
  const tasa = this.financiamiento.tasa_interes || configFinanciera.TASA_FINANCIAMIENTO;
  const cargoFinanciero = parseFloat((this.precio_venta * tasa).toFixed(2));
  this.precio_venta = parseFloat((this.precio_venta + cargoFinanciero).toFixed(2));

  // Configurar financiamiento
  const anticipo = this.financiamiento.anticipo_solicitado || 0;
  this.financiamiento.saldo_restante = parseFloat((this.precio_venta - anticipo).toFixed(2));
  this.financiamiento.pago_semanal = parseFloat((
    this.financiamiento.saldo_restante / this.financiamiento.plazo_semanas
  ).toFixed(2));

  // Calcular fechas si aplica
  if (this.financiamiento.fecha_inicio) {
    const fechaTermino = new Date(this.financiamiento.fecha_inicio);
    fechaTermino.setDate(fechaTermino.getDate() + (this.financiamiento.plazo_semanas * 7));
    this.financiamiento.fecha_termino = fechaTermino;
  }

  this.pago_contado_id = undefined;
};

cotizacionSchema.methods._handleContado = function() {
  if (this.precio_venta <= 0) {
    throw new Error('El precio de venta debe ser mayor a cero para pagos de contado');
  }
  this.financiamiento = undefined;
};

cotizacionSchema.methods._validateStatusChanges = function() {
  if (this.estado_servicio === 'En Proceso' && !this.fecha_inicio_servicio) {
    this.fecha_inicio_servicio = new Date();
  }

  if (this.estado_servicio === 'Completado' && !this.fecha_fin_servicio) {
    this.fecha_fin_servicio = new Date();
  }
};

cotizacionSchema.methods.calcularProgreso = function() {
  if (this.estado_servicio === 'Completado') return 100;
  if (!this.fecha_inicio_servicio) return 0;
  
  const totalDays = (this.fecha_fin_servicio - this.fecha_inicio_servicio) / (1000 * 60 * 60 * 24);
  const daysPassed = (new Date() - this.fecha_inicio_servicio) / (1000 * 60 * 60 * 24);
  
  return Math.min(100, Math.round((daysPassed / totalDays) * 100));
};

// ======================
// Métodos Estáticos
// ======================
cotizacionSchema.statics.findByStatusAndDateRange = function(status, startDate, endDate) {
  return this.find({
    estado: status,
    fecha_cotizacion: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).populate('cliente', 'nombre email');
};

// ======================
// Virtuals
// ======================
cotizacionSchema.virtual('cliente', {
  ref: 'Cliente',
  localField: 'cliente_id',
  foreignField: '_id',
  justOne: true
});

cotizacionSchema.virtual('filial', {
  ref: 'Filial',
  localField: 'filial_id',
  foreignField: '_id',
  justOne: true
});

cotizacionSchema.virtual('pago_contado', {
  ref: 'Pago',
  localField: 'pago_contado_id',
  foreignField: '_id',
  justOne: true
});

cotizacionSchema.virtual('pagos_financiamiento', {
  ref: 'Pago',
  localField: 'financiamiento.pagos_ids',
  foreignField: '_id'
});

cotizacionSchema.virtual('estado_cuenta', {
  ref: 'EstadoCuenta',
  localField: '_id',
  foreignField: 'cotizacion_id',
  justOne: true
});

module.exports = mongoose.model('Cotizacion', cotizacionSchema);