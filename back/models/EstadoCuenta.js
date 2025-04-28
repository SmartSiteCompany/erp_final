const mongoose = require('mongoose');
const {
  estadosEstadoCuenta,
  tiposMovimiento
} = require('../utils/constantes');

const estadoCuentaSchema = new mongoose.Schema({
  // ============ RELACIONES PRINCIPALES ============
  cliente_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: [true, 'El cliente es requerido'],
    description: "Referencia al cliente asociado"
  },

  cotizacion_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cotizacion',
    required: [true, 'La cotización es requerida'],
    unique: true,
    description: "Referencia a la cotización asociada (única)"
  },

  // ============ DATOS FINANCIEROS ============
  saldo_inicial: {
    type: Number,
    required: [true, 'El saldo inicial es requerido'],
    min: [0, 'El saldo inicial no puede ser negativo'],
    description: "Monto total a pagar inicialmente"
  },

  pagos_total: {
    type: Number,
    default: 0,
    min: [0, 'El total de pagos no puede ser negativo'],
    description: "Suma acumulada de todos los pagos registrados"
  },

  saldo_actual: {
    type: Number,
    required: true,
    min: [0, 'El saldo actual no puede ser negativo'],
    description: "Saldo pendiente (saldo_inicial - pagos_total)"
  },

  cargo_financiero: {
    type: Number,
    default: 0,
    description: "Monto de cargo financiero aplicado (si aplica)"
  },

  // ============ DETALLES DE PAGOS ============
  pagos_ids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pago',
    description: "Lista de referencias a los pagos asociados"
  }],

  movimientos: [{
    fecha: {
      type: Date,
      default: Date.now,
      description: "Fecha del movimiento"
    },
    tipo: {
      type: String,
      enum: tiposMovimiento,
      required: true,
      description: "Tipo de movimiento"
    },
    monto: {
      type: Number,
      required: true,
      description: "Monto del movimiento"
    },
    saldo_anterior: {
      type: Number,
      required: true,
      description: "Saldo antes del movimiento"
    },
    saldo_posterior: {
      type: Number,
      required: true,
      description: "Saldo después del movimiento"
    },
    referencia: {
      type: String,
      description: "Referencia del pago/movimiento"
    },
    descripcion: {
      type: String,
      maxlength: 200,
      description: "Descripción adicional del movimiento"
    }
  }],

  // ============ TÉRMINOS Y CONDICIONES ============
  fecha_creacion: {
    type: Date,
    default: Date.now,
    description: "Fecha de creación del estado de cuenta"
  },

  fecha_vencimiento: {
    type: Date,
    required: function() {
      return this.estado === 'Activo'; // Requerido solo para cuentas activas
    },
    description: "Fecha límite para liquidar el saldo"
  },

  pago_semanal: {
    type: Number,
    min: [0, 'El pago semanal no puede ser negativo'],
    description: "Monto de pago semanal sugerido"
  },

  // ============ INTERESES Y MORAS ============
  intereses_moratorios: {
    type: Number,
    default: 0,
    min: [0, 'Los intereses no pueden ser negativos'],
    description: "Intereses acumulados por atrasos"
  },

  tasa_interes_moratorio: {
    type: Number,
    default: 0.01, // 1% diario
    min: [0, 'La tasa de interés no puede ser negativa'],
    description: "Tasa de interés moratorio aplicable"
  },

  dias_mora: {
    type: Number,
    default: 0,
    description: "Días de atraso en pagos"
  },

  // ============ ESTADO Y SEGUIMIENTO ============
  estado: {
    type: String,
    enum: {
      values: estadosEstadoCuenta,
      message: `Estado no válido. Valores permitidos: ${estadosEstadoCuenta.join(', ')}`
    },
    default: 'Activo',
    description: "Estado actual del estado de cuenta"
  },

  fecha_liquidacion: {
    type: Date,
    description: "Fecha cuando se liquidó completamente"
  },

  // ============ METADATA ============
  creado_por: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    description: "Usuario que creó el registro"
  },

  actualizado_por: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    description: "Último usuario que actualizó el registro"
  }

}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// ============ ÍNDICES ============
estadoCuentaSchema.index({ cliente_id: 1, estado: 1 });
estadoCuentaSchema.index({ cotizacion_id: 1 }, { unique: true });
estadoCuentaSchema.index({ fecha_vencimiento: 1 });
estadoCuentaSchema.index({ 'estado': 1, 'fecha_vencimiento': 1 });

// ============ MIDDLEWARES (HOOKS) ============

/**
 * Hook pre-save para cálculos automáticos
 */
estadoCuentaSchema.pre('save', function(next) {
  // 1. Calcular saldo actual
  this.saldo_actual = this.saldo_inicial - this.pagos_total;

  // 2. Actualizar estado basado en saldo
  if (this.saldo_actual <= 0) {
    this.estado = 'Liquidado';
    this.fecha_liquidacion = new Date();
    this.saldo_actual = 0; // Evitar valores negativos
  }

  // 3. Calcular días de mora si está vencido
  if (this.fecha_vencimiento && this.fecha_vencimiento < new Date() && this.estado === 'Activo') {
    this.estado = 'En Mora';
    this.dias_mora = Math.floor((new Date() - this.fecha_vencimiento) / (1000 * 60 * 60 * 24));
  }

  next();
});

/**
 * Hook post-save para mantener consistencia
 */
estadoCuentaSchema.post('save', async function(doc, next) {
  try {
    // Si es nuevo, actualizar referencia en cotización
    if (doc.isNew) {
      await mongoose.model('Cotizacion').findByIdAndUpdate(
        doc.cotizacion_id,
        { estado_cuenta_id: doc._id }
      );
    }
    next();
  } catch (error) {
    next(error);
  }
});

// ============ MÉTODOS DE INSTANCIA ============

/**
 * Registra un nuevo movimiento/pago
 */
estadoCuentaSchema.methods.registrarMovimiento = function(tipo, monto, referencia = null, descripcion = '') {
  const movimiento = {
    tipo,
    monto,
    saldo_anterior: this.saldo_actual,
    saldo_posterior: this.saldo_actual - monto,
    referencia,
    descripcion
  };

  this.movimientos.push(movimiento);
  this.pagos_total += monto;
};

/**
 * Calcula intereses moratorios
 */
estadoCuentaSchema.methods.calcularIntereses = function() {
  if (this.estado === 'En Mora') {
    const intereses = this.dias_mora * (this.saldo_actual * this.tasa_interes_moratorio);
    this.intereses_moratorios = parseFloat(intereses.toFixed(2));
    this.saldo_actual += this.intereses_moratorios;
  }
};

/**
 * Genera un resumen ejecutivo
 */
estadoCuentaSchema.methods.generarResumen = function() {
  return {
    saldo_inicial: this.saldo_inicial,
    pagos_total: this.pagos_total,
    saldo_actual: this.saldo_actual,
    estado: this.estado,
    proximo_pago: this.pago_semanal,
    dias_mora: this.dias_mora,
    intereses: this.intereses_moratorios
  };
};

// ============ VIRTUALS ============
estadoCuentaSchema.virtual('cliente', {
  ref: 'Cliente',
  localField: 'cliente_id',
  foreignField: '_id',
  justOne: true
});

estadoCuentaSchema.virtual('cotizacion', {
  ref: 'Cotizacion',
  localField: 'cotizacion_id',
  foreignField: '_id',
  justOne: true
});

estadoCuentaSchema.virtual('pagos', {
  ref: 'Pago',
  localField: 'pagos_ids',
  foreignField: '_id'
});

// ============ MÉTODOS ESTÁTICOS ============

/**
 * Busca estados de cuenta próximos a vencer
 */
estadoCuentaSchema.statics.findProximosAVencer = function(days = 7) {
  const hoy = new Date();
  const fechaLimite = new Date();
  fechaLimite.setDate(hoy.getDate() + days);

  return this.find({
    estado: 'Activo',
    fecha_vencimiento: {
      $gte: hoy,
      $lte: fechaLimite
    }
  }).populate('cliente', 'nombre email telefono');
};

/**
 * Obtiene el historial de movimientos por cliente
 */
estadoCuentaSchema.statics.getHistorialPorCliente = function(clienteId, limit = 10) {
  return this.aggregate([
    { $match: { cliente_id: mongoose.Types.ObjectId(clienteId) } },
    { $unwind: '$movimientos' },
    { $sort: { 'movimientos.fecha': -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        fecha: '$movimientos.fecha',
        tipo: '$movimientos.tipo',
        monto: '$movimientos.monto',
        saldo: '$movimientos.saldo_posterior',
        referencia: '$movimientos.referencia'
      }
    }
  ]);
};

estadoCuentaSchema.pre('updateOne', async function(next) {
  const update = this.getUpdate();
  if (update.$pull && update.$pull.pagos_ids) {
    const pagoId = update.$pull.pagos_ids;
    const pago = await mongoose.model('Pago').findById(pagoId);
    
    // Actualizar montos si el pago estaba completado
    if (pago.estado === 'Completado') {
      this.pagos_total -= pago.monto_pago;
      this.saldo_actual += pago.monto_pago;
    }
  }
  next();
});

module.exports = mongoose.model('EstadoCuenta', estadoCuentaSchema);