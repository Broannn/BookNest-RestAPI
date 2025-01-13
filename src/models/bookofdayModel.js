/**
 * Schéma pour le modèle BookOfDay.
 * 
 * @typedef {Object} BookOfDay
 * @property {mongoose.Schema.Types.ObjectId} book_id - Référence à l'identifiant du livre.
 * @property {Date} date - Date à laquelle le livre est sélectionné comme livre du jour.
 * 
 * @property {Date} createdAt - Date de création du document (générée automatiquement par Mongoose).
 * @property {Date} updatedAt - Date de la dernière mise à jour du document (générée automatiquement par Mongoose).
 * 
 * @module models/bookofdayModel
 * @requires mongoose
 */
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
  }
}, { timestamps: true });

// Index pour la recherche par date
bookOfDaySchema.index({ date: -1 });

// Modèle
export default mongoose.model('BookOfDay', bookOfDaySchema);
