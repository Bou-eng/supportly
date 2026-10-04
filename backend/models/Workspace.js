const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  domain: { type: String, required: true, trim: true, lowercase: true },
}, { timestamps: true });

module.exports = mongoose.model('Workspace', workspaceSchema);