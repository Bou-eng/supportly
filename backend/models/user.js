const mongoose = require('mongoose');
const { USER_ROLE_VALUES } = require('../constants/apiConstants');

const userSchema = mongoose.Schema(
{
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true, // No two users can share an email
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Please add a password'],
    },
    role: {
      type: String,
      enum: USER_ROLE_VALUES,
      default: 'customer', // Default role for new signups
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    avatar: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    preferredLanguage: {
      type: String,
      enum: ['en', 'tr'],
      default: 'en',
    },
    notificationPreferences: {
      ticketAssigned: { type: Boolean, default: true },
      ticketUpdated: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: false },
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      default: null,
    },
}, 
    {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
    }
);

module.exports = mongoose.model('User', userSchema);
