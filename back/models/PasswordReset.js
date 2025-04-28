// src/models/PasswordReset.js
const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  token: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PasswordReset', passwordResetSchema);