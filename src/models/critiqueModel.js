import mongoose from 'mongoose';

// Schéma
const critiqueSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Assurer une critique unique par utilisateur et par livre
critiqueSchema.index({ user_id: 1, book_id: 1 }, { unique: true });

// Modèle
export default mongoose.model('Critique', critiqueSchema);
