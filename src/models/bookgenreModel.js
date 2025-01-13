/**
 * Schéma Book_Genre (relation entre Livre et Genre)
 * @module models/bookgenreModel
 */

import mongoose from 'mongoose';

/**
 * Schéma pour la relation entre un livre et un genre.
 * @typedef {Object} BookGenreSchema
 * @property {mongoose.Schema.Types.ObjectId} book_id - Référence à l'identifiant du livre.
 * @property {mongoose.Schema.Types.ObjectId} genre_id - Référence à l'identifiant du genre.
 * @property {Date} createdAt - Date de création de l'entrée.
 * @property {Date} updatedAt - Date de mise à jour de l'entrée.
 */

const bookGenreSchema = new mongoose.Schema({
  book_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  genre_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genre',
    required: true
  }
  }, { timestamps: true });

export default mongoose.model('BookGenre', bookGenreSchema);
