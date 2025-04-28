const express = require("express");
const mongoose = require("mongoose");

const swaggerDocs = require("./config/swaggerConfig");
const swaggerUi = require("swagger-ui-express");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const passwordResetRoutes = require("./routes/passwordResetRoutes");
const filialRoutes = require("./routes/filialRoutes");
const clienteRoutes = require("./routes/clienteRoutes");
const campanaRoutes = require("./routes/campanaRoutes");
const cotizacionRoutes = require("./routes/cotizacionRoutes");
const pagoRoutes = require("./routes/pagoRoutes");
const estadoCuentaRoutes = require("./routes/estadoCuentaRoutes");
//const pdfRoutes = require('./routes/pdfRoutes'); 
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
const port = process.env.PORT || 8000;
const mongoURI = process.env.MONGODB_URI;

const app = express();
const path = require('path');
app.use(express.json());

//Conexión a MongoDB
require("./config/db");
mongoose.connect("mongodb://localhost:27017/SSC_intCRM", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Cors
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:3000' })); 

// Configuración de Swagger
app.use('/api-docs', 
  swaggerUi.serve, 
  swaggerUi.setup(swaggerDocs, {
    explorer: true, // Para habilitar la búsqueda
    customSiteTitle: "API Cotizaciones", // Título personalizado
    customCss: '.swagger-ui .topbar { display: none }' // Opcional: personalización CSS
  })
);

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

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});