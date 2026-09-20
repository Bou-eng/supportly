const mongoose = require('mongoose');

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
      enum: ['customer', 'agent', 'manager', 'admin'],
      default: 'customer', // Default role for new signups
    },
    team: {
      type: String,
      default: null, // e.g., "Technical Support", "Billing"
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
}, 
    {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
    }
);

module.exports = mongoose.model('User', userSchema);
