const mongoose = require('mongoose');
const Counter = require('./Counter');

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String, // Stores "SUP-1001"
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add a ticket title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description of the issue'],
    },
    category: {
      type: String,
      enum: ['Technical', 'Billing', 'Account Access', 'General Inquiry'],
      default: 'General Inquiry',
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    team: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: auto-generates SUP-1001 before saving a new ticket
ticketSchema.pre('save', async function () {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'ticketNumber' },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true } // Fixed deprecation warning
    );
    this.ticketNumber = `SUP-${counter.seq}`;
  }
});

module.exports = mongoose.model('Ticket', ticketSchema);