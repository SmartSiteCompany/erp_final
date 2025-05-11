const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const path = require('path');
const cors = require('cors');

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const passwordResetRoutes = require("./routes/passwordResetRoutes");
const filialRoutes = require("./routes/filialRoutes");
const clienteRoutes = require("./routes/clienteRoutes");
const campanaRoutes = require("./routes/campanaRoutes");
const cotizacionRoutes = require("./routes/cotizacionRoutes");
const pagoRoutes = require("./routes/pagoRoutes");
const estadoCuentaRoutes = require("./routes/estadoCuentaRoutes");
const eventoRoutes = require('./routes/eventoRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const interaccionRoutes = require('./routes/interaccionRoutes');
const notaRoutes = require('./routes/notaRoutes');
const oportunidadRoutes = require('./routes/oportunidadRoutes');
const segmentacionRoutes = require('./routes/segmentacionRoutes');
const tareaRoutes = require('./routes/tareaRoutes');
const documentRoutes = require('./routes/documentoRoutes');
const catalogoRoutes = require('./routes/catalogoRoutes');

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8000;

// Cors
app.use(cors({ origin: 'http://localhost:3000' })); 
app.use(express.json());

// Rutas
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/password-resets", passwordResetRoutes);
app.use("/filiales", filialRoutes);
app.use("/campanas", campanaRoutes);
app.use("/clientes", clienteRoutes);
app.use("/cotizaciones", cotizacionRoutes);
app.use("/pagos", pagoRoutes);
app.use("/estados-cuenta", estadoCuentaRoutes);
//app.use('/api', pdfRoutes);
app.use('/eventos', eventoRoutes);
app.use('/feedbacks', feedbackRoutes);
app.use('/interacciones', interaccionRoutes);
app.use('/notas', notaRoutes);
app.use('/oportunidades', oportunidadRoutes);
app.use('/segmentaciones', segmentacionRoutes);
app.use('/tareas', tareaRoutes);
app.use('/documentos', documentRoutes);
app.use('/catalogos', catalogoRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Rutas protegidas
app.use("/users", userRoutes);

// Conexion a DB
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log('✅ Conexión a MongoDB establecida');
  });
}).catch(err => {
  console.error('❌ Error al iniciar la aplicación:', err);
  process.exit(1);
});