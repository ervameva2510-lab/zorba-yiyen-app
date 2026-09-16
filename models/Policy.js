const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema({
  version: {
    type: Number,
    default: 1
  },
  title: String,
  content: String,
  articles: [
    {
      number: Number,
      title: String,
      content: String
    }
  ],
  qurranAyah: {
    surah: String,
    ayah: String,
    translation: String
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Policy', PolicySchema);
