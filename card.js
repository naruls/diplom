const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  visibility: {
    type: Number,
    required: true,
  },
  main: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  coord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
});

module.exports = mongoose.model('card', cardSchema);
