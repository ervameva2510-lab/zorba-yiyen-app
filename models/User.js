const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    sparse: true
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  profilePhoto: {
    type: String,
    required: false
  },
  location: {
    city: String,
    district: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  sportStatus: {
    type: String,
    enum: ['Sporcu', 'Acemi', 'Başlamamış'],
    required: false
  },
  fitnessStatus: {
    type: String,
    enum: ['Fit', 'Yarı Fit', 'Hafif Göbekli', 'Göbekli', 'Obez'],
    required: false
  },
  tag: {
    type: String,
    enum: ['Haklıysan Kavgaya Gelirim', 'Zorbalığa Gelirim'],
    required: false
  },
  sözleşmeKabul: {
    type: Boolean,
    default: false
  },
  politikaKabul: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('User', UserSchema);
