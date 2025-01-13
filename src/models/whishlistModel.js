/**
 * Schéma de la liste de souhaits
 * 
 * Ce schéma représente une liste de souhaits pour un utilisateur, contenant des références à des livres.
 * 
 * @typedef {Object} Wishlist
 * @property {mongoose.Schema.Types.ObjectId} user_id - Référence à l'utilisateur (obligatoire)
 * @property {mongoose.Schema.Types.ObjectId} book_id - Référence au livre (obligatoire)
 * @property {Date} createdAt - Date de création de l'entrée (générée automatiquement)
 * @property {Date} updatedAt - Date de mise à jour de l'entrée (générée automatiquement)
 */
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
