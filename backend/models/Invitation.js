const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  role: { type: String, enum: ['customer', 'agent', 'manager'], required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tokenHash: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'accepted', 'revoked'], default: 'pending' },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Invitation', invitationSchema);