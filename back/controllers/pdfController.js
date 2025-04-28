const PDFDocument = require('pdfkit');
const Cotizacion = require('../models/Cotizacion');
const fs = require('fs');
const path = require('path');

// Función principal para generar PDF
exports.generarPDFCotizacion = async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findById(req.params.id)
      .populate('cliente_id', 'nombre email telefono direccion')
      .populate('filial_id', 'nombre_filial direccion');

    if (!cotizacion) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }

    const doc = new PDFDocument({ margin: 30 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Cotizacion_${cotizacion._id}.pdf"`);
    doc.pipe(res);

    // Elegir plantilla según tipo de pago
    if (cotizacion.forma_pago === 'Contado') {
      generarContadoPDF(doc, cotizacion);
    } else {
      generarFinanciadoPDF(doc, cotizacion);
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ error: 'Error al generar PDF', details: error.message });
  }
};

// --- Funciones de Plantillas ---
function generarContadoPDF(doc, data) {
  // Encabezado
  doc.fontSize(18).text('COTIZACIÓN', { align: 'center', underline: true });
  doc.moveDown(0.5);

  // Datos del cliente
  doc.fontSize(12).text(`No. Cliente: ${data.cliente_id._id}`, { continued: true })
     .text(`Realizado por: ${data.vendedor}`, { align: 'right' });
  doc.text(`Nombre: ${data.cliente_id.nombre}`, { continued: true })
     .text(`Cotización No.: ${data._id}`, { align: 'right' });
  // ... más campos según tu formato

  // Productos
  doc.moveDown().fontSize(14).text('Descripción', { underline: true });
  data.detalles.forEach(item => {
    doc.fontSize(10).text(`${item.cantidad} ${item.descripcion}`, { indent: 20 });
  });

  // Totales
  doc.moveDown().text(`Subtotal: $${data.precio_venta.toFixed(2)}`, { align: 'right' });
  doc.text(`IVA: $${(data.precio_venta * 0.16).toFixed(2)}`, { align: 'right' });
  doc.font('Helvetica-Bold').text(`Total: $${(data.precio_venta * 1.16).toFixed(2)}`, { align: 'right' });

  // Pie de página
  agregarPiePagina(doc, data.filial_id);
}

function generarFinanciadoPDF(doc, data) {
  // Página 1 (similar a contado pero con financiamiento)
  generarContadoPDF(doc, data);

  // Página 2: Plan de pagos
  doc.addPage();
  doc.fontSize(16).text('FINANCIAMIENTO', { align: 'center' });
  doc.moveDown();

  const { anticipo, plazo_semanas, pago_semanal } = data.financiamiento;
  const total = data.precio_venta;

  doc.text(`Precio total: $${total.toFixed(2)}`);
  doc.text(`Anticipo: $${anticipo.toFixed(2)}`);
  doc.text(`Restante: $${(total - anticipo).toFixed(2)}`);
  doc.moveDown();
  doc.text(`Plazo: ${plazo_semanas} semanas`);
  doc.text(`Pago semanal: $${pago_semanal.toFixed(2)}`);

  agregarPiePagina(doc, data.filial_id);
}

function agregarPiePagina(doc, filial) {
  doc.moveTo(50, doc.y + 20).lineTo(550, doc.y + 20).stroke();
  doc.fontSize(10).text(filial.direccion, { align: 'center' });
  doc.text(`Tel: ${filial.telefono} | ${filial.email}`, { align: 'center' });
}