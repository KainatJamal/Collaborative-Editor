const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  version: { type: Number, default: 0 },
});

module.exports = mongoose.model('Document', documentSchema);
