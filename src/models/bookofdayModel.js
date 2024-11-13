import mongoose from 'mongoose';

// Schéma
const bookOfDaySchema = new mongoose.Schema({
  book_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  discussions: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Index pour la recherche par date
bookOfDaySchema.index({ date: -1 });

// Modèle
export default mongoose.model('BookOfDay', bookOfDaySchema);
