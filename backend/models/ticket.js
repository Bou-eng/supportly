const mongoose = require('mongoose');
const Counter = require('./Counter');
const {
  TICKET_STATUS_VALUES,
  TICKET_PRIORITY_VALUES,
} = require('../constants/apiConstants');

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
    contactEmail: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please add a valid contact email'],
      default: null,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    status: {
      type: String,
      enum: TICKET_STATUS_VALUES,
      default: 'open',
    },
    priority: {
      type: String,
      enum: TICKET_PRIORITY_VALUES,
      default: 'medium',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    tags: {
      type: [String],
      default: [],
      set: (tags) => [...new Set((tags || []).map((tag) => tag.trim()).filter(Boolean))],
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    slaDueAt: {
      type: Date,
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