import mongoose from 'mongoose';

// Schéma
const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 250
  },
  birth_date: {
    type: Date
  }
}, { timestamps: true });

// Modèle

export default mongoose.model('Author', authorSchema);