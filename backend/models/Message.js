const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  publicId: { type: String, required: true },
  resourceType: { type: String, required: true },
  format: { type: String, default: null },
  mimeType: { type: String, required: true },
  bytes: { type: Number, required: true },
  width: { type: Number, default: null },
  height: { type: Number, default: null },
}, { _id: true });

const messageSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Ticket',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    type: {
      type: String,
      enum: ['public', 'internal'], // 'internal' notes are only visible to agents/admins
      default: 'public',
    },
    content: {
      type: String,
      default: '',
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.pre('validate', function () {
  if (!this.content?.trim() && this.attachments.length === 0) {
    this.invalidate('content', 'Please add message content or an attachment');
  }
});

module.exports = mongoose.model('Message', messageSchema);
