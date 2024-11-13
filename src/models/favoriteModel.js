const mongoose = require('mongoose');

// Favorite Schema
const favoriteSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  }
}, { timestamps: true });

export const Favorite = mongoose.model('Favorite', favoriteSchema);