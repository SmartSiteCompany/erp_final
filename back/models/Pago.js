// src/models/Pago.js
const mongoose = require('mongoose');
const {
  metodosPago,
  tiposPago,
  estadosPago
} = require('../utils/constantes');

const pagoSchema = new mongoose.Schema({
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
    description: "Referencia a la cotización asociada"
  },

  estado_cuenta_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EstadoCuenta',
    description: "Referencia al estado de cuenta (si aplica)"
  },

  // ============ DATOS DEL PAGO ============
  fecha_pago: {
    type: Date,
    default: Date.now,
    description: "Fecha en que se realizó el pago"
  },

  fecha_registro: {
    type: Date,
    default: Date.now,
    description: "Fecha en que se registró el pago en el sistema"
  },

  monto_pago: {
    type: Number,
    required: [true, 'El monto es requerido'],
    min: [0.01, 'El monto mínimo es 0.01'],
    validate: {
      validator: Number.isFinite,
      message: 'El monto debe ser un número válido'
    },
    description: "Monto del pago realizado"
  },

  saldo_pendiente: {
    type: Number,
    min: 0,
    description: "Saldo restante después de este pago",
    default: 0
  },

  // ============ TIPOS Y ESTADOS ============
  tipo_pago: {
    type: String,
    enum: {
      values: tiposPago,
      message: `Tipo de pago no válido. Valores permitidos: ${tiposPago.join(', ')}`
    },
    required: [true, 'El tipo de pago es requerido'],
    description: "Tipo de pago realizado"
  },

  metodo_pago: {
    type: String,
    enum: {
      values: metodosPago,
      message: `Método de pago no válido. Valores permitidos: ${metodosPago.join(', ')}`
    },
    required: [true, 'El método de pago es requerido'],
    description: "Método de pago utilizado"
  },

  estado: {
    type: String,
    enum: {
      values: estadosPago,
      message: `Estado no válido. Valores permitidos: ${estadosPago.join(', ')}`
    },
    default: 'Completado',
    description: "Estado actual del pago"
  },

  // ============ DATOS ADICIONALES ============
  referencia: {
    type: String,
    unique: true,
    required: [true, 'La referencia es requerida'],
    description: "Número/folio único del pago"
  },

  comprobante_url: {
    type: String,
    description: "URL del comprobante de pago (imagen/documento)"
  },

  observaciones: {
    type: String,
    maxlength: [500, 'Las observaciones no pueden exceder los 500 caracteres'],
    description: "Notas adicionales sobre el pago"
  },

  // ============ METADATA ============
  registrado_por: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    description: "Usuario que registró el pago"
  },

  autorizado_por: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    description: "Usuario que autorizó el pago (si aplica)"
  }

}, {
  timestamps: true, // Crea createdAt y updatedAt automáticamente
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v; // Eliminar versión de mongoose
      ret.id = ret._id; // Agregar id como alias de _id
      delete ret._id;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// ============ ÍNDICES ============
pagoSchema.index({ cotizacion_id: 1, fecha_pago: -1 });
pagoSchema.index({ cliente_id: 1, estado: 1 });
//pagoSchema.index({ referencia: 1 }, { unique: true });
pagoSchema.index({ 'fecha_pago': 1, 'metodo_pago': 1 });

// ============ MIDDLEWARES (HOOKS) ============

/**
 * Hook pre-save para generación automática de referencia
 */
pagoSchema.pre('save', async function(next) {
  try {
    // Generar referencia si no existe
    if (!this.referencia) {
      const prefix = this.tipo_pago.substring(0, 3).toUpperCase();
      this.referencia = `${prefix}-${Date.now().toString().slice(-6)}`;
    }

    // Validar coherencia entre tipo_pago y estado
    if (this.tipo_pago === 'Anticipo' && this.estado !== 'Completado') {
      throw new Error('Los anticipos deben registrarse como Completados');
    }

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Hook post-save para actualizar referencias en otros modelos
 */
pagoSchema.post('save', async function(doc, next) {
  try {
    // Actualizar referencia en Cotización si es pago de contado
    if (doc.tipo_pago === 'Contado') {
      await mongoose.model('Cotizacion').findByIdAndUpdate(
        doc.cotizacion_id,
        { pago_contado_id: doc._id }
      );
    }

    // Actualizar referencia en EstadoCuenta si es pago financiado
    if (['Anticipo', 'Abono', 'Intereses'].includes(doc.tipo_pago)) {
      await mongoose.model('EstadoCuenta').findOneAndUpdate(
        { cotizacion_id: doc.cotizacion_id },
        { 
          $push: { pagos_ids: doc._id },
          $inc: { pagos_total: doc.monto_pago }
        }
      );
    }

    next();
  } catch (error) {
    next(error);
  }
});

// ============ VIRTUALS ============
pagoSchema.virtual('cliente', {
  ref: 'Cliente',
  localField: 'cliente_id',
  foreignField: '_id',
  justOne: true
});

pagoSchema.virtual('cotizacion', {
  ref: 'Cotizacion',
  localField: 'cotizacion_id',
  foreignField: '_id',
  justOne: true
});

pagoSchema.virtual('estado_cuenta', {
  ref: 'EstadoCuenta',
  localField: 'estado_cuenta_id',
  foreignField: '_id',
  justOne: true
});

// ============ MÉTODOS ESTÁTICOS ============

/**
 * Busca pagos por rango de fechas y método
 */
pagoSchema.statics.findByDateRangeAndMethod = function(startDate, endDate, method) {
  return this.find({
    fecha_pago: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    metodo_pago: method
  }).populate('cliente', 'nombre email');
};

/**
 * Obtiene el balance de pagos por cliente
 */
pagoSchema.statics.getBalanceByClient = function(clientId) {
  return this.aggregate([
    { $match: { cliente_id: mongoose.Types.ObjectId(clientId) } },
    {
      $group: {
        _id: '$estado',
        total: { $sum: '$monto_pago' },
        count: { $sum: 1 }
      }
    }
  ]);
};

// ============ MÉTODOS DE INSTANCIA ============

/**
 * Genera un objeto para comprobante
 */
pagoSchema.methods.toComprobante = function() {
  return {
    referencia: this.referencia,
    fecha: this.fecha_pago,
    monto: this.monto_pago,
    metodo: this.metodo_pago,
    tipo: this.tipo_pago
  };
};

module.exports = mongoose.model('Pago', pagoSchema);