const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g., 'ticketNumber'
  seq: { type: Number, default: 1000 },  // Starts at 1000 so the first ticket is 1001
});

module.exports = mongoose.model('Counter', counterSchema);