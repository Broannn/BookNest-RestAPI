import mongoose from 'mongoose';

// Schéma
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 250
  },
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: true
  },
  publication_date: {
    type: Date,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  cover_image: {
    type: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  genres: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genre'
  }]
}, { timestamps: true });

// Modèle
export default mongoose.model('Book', bookSchema);
