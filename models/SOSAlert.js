const mongoose = require('mongoose');

const SOSAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    city: String,
    district: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'cancelled'],
    default: 'active'
  },
  respondingUsers: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      respondedAt: Date
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: Date
});

module.exports = mongoose.model('SOSAlert', SOSAlertSchema);
