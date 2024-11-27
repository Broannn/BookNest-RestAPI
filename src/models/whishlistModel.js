import mongoose from 'mongoose';

// Wishlist Schema
const wishlistSchema = new mongoose.Schema({
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

export default mongoose.model('Wishlist', wishlistSchema);
