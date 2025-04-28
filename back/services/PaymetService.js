// src/services/PaymentService.js
const mongoose = require('mongoose');
const Pago = require('../models/Pago');
const Cotizacion = require('../models/Cotizacion');
const EstadoCuenta = require('../models/EstadoCuenta');
const { logError, logInfo } = require('../utils/loger');

class PaymentService {
  /**
   * Crea un nuevo registro de pago
   * @param {Object} paymentData - Datos del pago
   * @param {Object} [options] - Opciones adicionales (session)
   * @returns {Promise<Pago>} - Instancia del pago creado
   */
  static async createPayment(paymentData, options = {}) {
    const session = options.session || await mongoose.startSession();
    let shouldEndSession = false;

    if (!options.session) {
      await session.startTransaction();
      shouldEndSession = true;
    }

    try {
      // Validación de campos requeridos
      const requiredFields = [
        'cliente_id', 
        'cotizacion_id', 
        'monto_pago', 
        'metodo_pago',
        'tipo_pago'
      ];
      
      for (const field of requiredFields) {
        if (!paymentData[field]) {
          throw new Error(`Campo requerido faltante: ${field}`);
        }
      }

      // Validar monto positivo
      if (isNaN(paymentData.monto_pago) || Number(paymentData.monto_pago) <= 0) {
        throw new Error('Monto de pago debe ser un número positivo');
      }

      // Crear y guardar el pago
      const pago = new Pago({
        ...paymentData,
        fecha_pago: paymentData.fecha_pago || new Date(),
        estado: paymentData.estado || 'Completado'
      });

      await pago.save({ session });
      
      // Actualizar referencia en cotización si es pago de contado
      if (paymentData.tipo_pago === 'Contado') {
        await Cotizacion.findByIdAndUpdate(
          paymentData.cotizacion_id,
          { pago_contado_id: pago._id },
          { session }
        );
      }

      // Actualizar estado de cuenta para pagos financiados
      if (paymentData.tipo_pago === 'Abono' || paymentData.tipo_pago === 'Anticipo') {
        await EstadoCuenta.findOneAndUpdate(
          { cotizacion_id: paymentData.cotizacion_id },
          {
            $push: { pagos_ids: pago._id },
            $inc: { 
              pagos_total: paymentData.monto_pago,
              saldo_actual: paymentData.tipo_pago === 'Abono' ? -paymentData.monto_pago : 0
            }
          },
          { session, new: true }
        );
      }

      if (shouldEndSession) {
        await session.commitTransaction();
      }

      logInfo(`Pago creado exitosamente: ${pago._id}`, { 
        cotizacion_id: paymentData.cotizacion_id,
        tipo_pago: paymentData.tipo_pago
      });

      return pago;
    } catch (error) {
      if (shouldEndSession) {
        await session.abortTransaction();
      }
      logError('Error en PaymentService.createPayment', {
        error: error.message,
        paymentData,
        stack: error.stack
      });
      throw error;
    } finally {
      if (shouldEndSession) {
        session.endSession();
      }
    }
  }

  /**
   * Crea el pago inicial para una cotización financiada
   * @param {Cotizacion} cotizacion - Instancia de la cotización
   * @param {String} metodo_pago - Método de pago del anticipo
   * @param {Object} [options] - Opciones adicionales (session)
   * @returns {Promise<Pago>} - Pago de anticipo creado
   */
  static async createInitialPayment(cotizacion, metodo_pago, options = {}) {
    try {
      if (!cotizacion.financiamiento) {
        throw new Error('La cotización no tiene financiamiento configurado');
      }

      const anticipo = cotizacion.financiamiento.anticipo_solicitado || 0;
      
      if (anticipo <= 0) {
        throw new Error('El anticipo solicitado debe ser mayor a cero');
      }

      return await this.createPayment({
        cliente_id: cotizacion.cliente_id,
        cotizacion_id: cotizacion._id,
        monto_pago: anticipo,
        metodo_pago: metodo_pago,
        tipo_pago: 'Anticipo',
        saldo_pendiente: cotizacion.precio_venta - anticipo,
        referencia: `ANTICIPO-${cotizacion._id.toString().slice(-6)}`
      }, options);
    } catch (error) {
      logError('Error en PaymentService.createInitialPayment', {
        error: error.message,
        cotizacion_id: cotizacion?._id,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Genera los pagos programados para un financiamiento
   * @param {String} cotizacionId - ID de la cotización
   * @param {Object} [options] - Opciones adicionales (session)
   * @returns {Promise<Array<Pago>>} - Pagos futuros creados
   */
  static async generateScheduledPayments(cotizacionId, options = {}) {
    const session = options.session || await mongoose.startSession();
    let shouldEndSession = false;

    if (!options.session) {
      await session.startTransaction();
      shouldEndSession = true;
    }

    try {
      const cotizacion = await Cotizacion.findById(cotizacionId).session(session);
      
      if (!cotizacion || cotizacion.forma_pago !== 'Financiado') {
        throw new Error('Cotización financiada no encontrada');
      }

      if (!cotizacion.financiamiento) {
        throw new Error('La cotización no tiene financiamiento configurado');
      }

      const { plazo_semanas, pago_semanal, anticipo_solicitado } = cotizacion.financiamiento;
      
      if (!plazo_semanas || !pago_semanal) {
        throw new Error('Datos de financiamiento incompletos');
      }

      const pagos = [];
      const saldoInicial = cotizacion.precio_venta - anticipo_solicitado;

      for (let i = 1; i <= plazo_semanas; i++) {
        const saldoPendiente = Math.max(0, saldoInicial - (pago_semanal * (i - 1)));
        
        pagos.push({
          cliente_id: cotizacion.cliente_id,
          cotizacion_id: cotizacion._id,
          monto_pago: i === plazo_semanas ? 
            saldoInicial - (pago_semanal * (plazo_semanas - 1)) : 
            pago_semanal,
          tipo_pago: 'Cuota',
          estado: 'Pendiente',
          fecha_estimada: new Date(Date.now() + 7 * i * 86400000), // +i semanas
          saldo_pendiente: saldoPendiente,
          referencia: `CUOTA-${i}-${cotizacion._id.toString().slice(-6)}`
        });
      }

      const result = await Pago.insertMany(pagos, { session });
      
      // Actualizar cotización con los IDs de los pagos programados
      cotizacion.financiamiento.pagos = [
        ...(cotizacion.financiamiento.pagos || []),
        ...result.map(p => p._id)
      ];
      await cotizacion.save({ session });

      // Actualizar estado de cuenta con los pagos programados
      await EstadoCuenta.findOneAndUpdate(
        { cotizacion_id: cotizacion._id },
        { $push: { pagos_ids: { $each: result.map(p => p._id) } } },
        { session }
      );

      if (shouldEndSession) {
        await session.commitTransaction();
      }

      logInfo(`Generados ${result.length} pagos programados para cotización ${cotizacionId}`);
      return result;
    } catch (error) {
      if (shouldEndSession) {
        await session.abortTransaction();
      }
      logError('Error en PaymentService.generateScheduledPayments', {
        error: error.message,
        cotizacionId,
        stack: error.stack
      });
      throw error;
    } finally {
      if (shouldEndSession) {
        session.endSession();
      }
    }
  }

  /**
   * Obtiene todos los pagos asociados a una cotización
   * @param {String} cotizacionId - ID de la cotización
   * @returns {Promise<Array<Pago>>} - Lista de pagos
   */
  static async getPaymentsByQuotation(cotizacionId) {
    try {
      return await Pago.find({ cotizacion_id: cotizacionId })
        .populate('cliente_id', 'nombre email')
        .sort({ fecha_pago: -1, fecha_estimada: 1 });
    } catch (error) {
      logError('Error en PaymentService.getPaymentsByQuotation', {
        error: error.message,
        cotizacionId,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Elimina todos los pagos asociados a una cotización
   * @param {String} cotizacionId - ID de la cotización
   * @param {Object} [options] - Opciones adicionales (session)
   * @returns {Promise<Object>} - Resultado de la operación
   */
  static async deletePaymentsByQuotation(cotizacionId, options = {}) {
    const session = options.session || await mongoose.startSession();
    let shouldEndSession = false;

    if (!options.session) {
      await session.startTransaction();
      shouldEndSession = true;
    }

    try {
      const result = await Pago.deleteMany({ cotizacion_id: cotizacionId }, { session });
      
      // Limpiar referencias en estado de cuenta
      await EstadoCuenta.findOneAndUpdate(
        { cotizacion_id: cotizacionId },
        { $set: { pagos_ids: [] } },
        { session }
      );

      if (shouldEndSession) {
        await session.commitTransaction();
      }

      logInfo(`Eliminados ${result.deletedCount} pagos de cotización ${cotizacionId}`);
      return result;
    } catch (error) {
      if (shouldEndSession) {
        await session.abortTransaction();
      }
      logError('Error en PaymentService.deletePaymentsByQuotation', {
        error: error.message,
        cotizacionId,
        stack: error.stack
      });
      throw error;
    } finally {
      if (shouldEndSession) {
        session.endSession();
      }
    }
  }

  /**
   * Registra el pago de una cuota pendiente
   * @param {String} pagoId - ID del pago programado
   * @param {String} metodo_pago - Método de pago utilizado
   * @param {Object} [options] - Opciones adicionales (session)
   * @returns {Promise<Pago>} - Pago actualizado
   */
  static async payPendingPayment(pagoId, metodo_pago, options = {}) {
    const session = options.session || await mongoose.startSession();
    let shouldEndSession = false;

    if (!options.session) {
      await session.startTransaction();
      shouldEndSession = true;
    }

    try {
      const pago = await Pago.findByIdAndUpdate(
        pagoId,
        {
          estado: 'Completado',
          metodo_pago,
          fecha_pago: new Date()
        },
        { new: true, session }
      );

      if (!pago) {
        throw new Error('Pago no encontrado');
      }

      // Actualizar saldo en cotización
      await Cotizacion.findOneAndUpdate(
        { _id: pago.cotizacion_id },
        { $inc: { 'financiamiento.saldo_restante': -pago.monto_pago } },
        { session }
      );

      // Actualizar estado de cuenta
      await EstadoCuenta.findOneAndUpdate(
        { cotizacion_id: pago.cotizacion_id },
        { 
          $inc: { 
            pagos_total: pago.monto_pago,
            saldo_actual: -pago.monto_pago
          }
        },
        { session }
      );

      if (shouldEndSession) {
        await session.commitTransaction();
      }

      return pago;
    } catch (error) {
      if (shouldEndSession) {
        await session.abortTransaction();
      }
      logError('Error en PaymentService.payPendingPayment', {
        error: error.message,
        pagoId,
        stack: error.stack
      });
      throw error;
    } finally {
      if (shouldEndSession) {
        session.endSession();
      }
    }
  }
}

module.exports = PaymentService;