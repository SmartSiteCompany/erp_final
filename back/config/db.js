const mongoose = require('mongoose');
require('dotenv').config();

let supportsTransactions = false;

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
     
    });

    const topology = connection.connection.client.topology;
    if (topology && (topology.description.type === 'ReplicaSetWithPrimary' || topology.description.type === 'Sharded')) {
      supportsTransactions = true;
    } else {
      supportsTransactions = false;
    }

    console.log('✅ Conectado a MongoDB');
    console.log(`Supports transactions: ${supportsTransactions}`);
  } catch (error) {
    console.error('❌ Error de conexión a MongoDB:', error.message);
    process.exit(1); // Si hay error
  }
};

const getSupportsTransactions = () => supportsTransactions;

module.exports = {
  connectDB,
  getSupportsTransactions
};
